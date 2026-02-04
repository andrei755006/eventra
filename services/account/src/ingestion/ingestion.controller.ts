// services/account/src/ingestion/ingestion.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import * as protobuf from 'protobufjs';
import { join } from 'path';

@Controller()
export class IngestionController {
    private patientProto: protobuf.Type;

    constructor() {
        this.initProto();
    }

    private async initProto() {
        // Поднимаемся к корню shared-proto
        const protoPath = join(__dirname, '../../../../shared-proto/proto/patient/v1/patient_event.proto');

        try {
            const root = await protobuf.load(protoPath);
            // ВАЖНО: берем в точности то, что в package файла .proto
            this.patientProto = root.lookupType('patient.events.PatientEvent');
            console.log('✅ Account Service: Proto loaded from', protoPath);
        } catch (e) {
            console.error('❌ Account Service: Failed to load proto!', e);
        }
    }

    @EventPattern('patient')
    async handlePatientCreated(@Payload() data: any) {
        if (!this.patientProto) {
            console.warn('⏳ Proto not ready yet, skipping...');
            return;
        }

        try {
            // Извлекаем Buffer из Kafka payload
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

            console.log('\n' + '👤 '.repeat(10) + 'ACCOUNT SERVICE' + ' 👤'.repeat(10));
            console.dir({
                service: 'ACCOUNT-SYNC',
                payload: {
                    id: patientData.patientId,
                    name: patientData.name,
                    roles: patientData.roles
                }
            }, { depth: null, colors: true });
            console.log('='.repeat(50) + '\n');

        } catch (e) {
            console.error('❌ Account ingestion error:', e.message);
        }
    }
}