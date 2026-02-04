// services/analytics/src/ingestion/ingestion.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientHistory } from './entities/patient-history.entity';
import * as protobuf from 'protobufjs';
import { join } from 'path';

@Controller()
export class IngestionController {
    private patientProto: protobuf.Type;

    constructor(
        @InjectRepository(PatientHistory)
        private readonly repository: Repository<PatientHistory>,
    ) {
        this.initProto();
    }

    private async initProto() {
        const protoPath = join(__dirname, '../../../../shared-proto/proto/patient/v1/patient_event.proto');
        try {
            const root = await protobuf.load(protoPath);
            this.patientProto = root.lookupType('patient.events.PatientEvent');
            console.log('✅ Analytics Service: Proto loaded');
        } catch (e) {
            console.error('❌ Analytics Service: Failed to load proto!', e);
        }
    }

    @EventPattern('patient')
    async handlePatientCreated(@Payload() data: any) {
        if (!this.patientProto) return;

        try {
            const buffer = Buffer.isBuffer(data) ? data :
                (data.value && Buffer.isBuffer(data.value)) ? data.value :
                    Buffer.from(data.value || data);

            const message = this.patientProto.decode(buffer);
            const patientData = this.patientProto.toObject(message, {
                longs: String,
                enums: String,
                defaults: true,
                arrays: true,
            });

            console.log('\n' + '📊 '.repeat(10) + 'ANALYTICS SERVICE' + ' 📊'.repeat(10));
            console.dir({
                service: 'ANALYTICS-ENGINE',
                payload: {
                    id: patientData.patientId,
                    // В .proto у нас event_type (snake_case)
                    eventType: patientData.eventType || patientData.event_type,
                    roles: patientData.roles
                }
            }, { depth: null, colors: true });

            await this.repository.save(this.repository.create({
                externalId: patientData.patientId,
                firstName: patientData.name?.split(' ')[0],
                lastName: patientData.name?.split(' ').slice(1).join(' '),
                status: patientData.eventType || patientData.event_type || 'CREATED',
                source: 'JAVA_PATIENT_SERVICE',
            }));

        } catch (err) {
            console.error('[Analytics] Decoding failed:', err.message);
        }
    }
}