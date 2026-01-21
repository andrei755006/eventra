import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientHistory } from './entities/patient-history.entity';
import * as protobuf from 'protobufjs';
import { join } from 'path';

@Controller()
export class IngestionController {
    private patientProto: any;

    constructor(
        @InjectRepository(PatientHistory)
        private readonly repository: Repository<PatientHistory>,
    ) {
        // Load proto file on startup
        this.initProto();
    }

    private async initProto() {
        const root = await protobuf.load(join(__dirname, 'proto/patient_event.proto'));
        this.patientProto = root.lookupType('patient.events.PatientEvent');
    }


    @EventPattern('patient')
    async handlePatientCreated(@Payload() data: any) {
        console.log('--- EVENTRA INGESTION: RECEIVED RAW DATA ---');

        try {
            // В NestJS + KafkaJS данные обычно прилетают как объект с метаданными.
            // Нам нужен ТОЛЬКО Buffer из поля value.
            let buffer: Buffer;

            if (Buffer.isBuffer(data)) {
                buffer = data;
            } else if (data && data.value) {
                // Если data.value уже Buffer или его надо превратить в Buffer
                buffer = Buffer.isBuffer(data.value) ? data.value : Buffer.from(data.value);
            } else {
                // Если пришла строка или что-то еще, принудительно делаем Buffer
                buffer = Buffer.from(data);
            }

            const message = this.patientProto.decode(buffer);
            const patientData = this.patientProto.toObject(message, {
                longs: String,
                enums: String,
                defaults: true,
            });

            console.log(`✅ SUCCESS! Decoded Patient: ${patientData.name} (ID: ${patientData.patientId})`);

            // Сохранение в БД
            await this.repository.save(this.repository.create({
                externalId: patientData.patientId,
                firstName: patientData.name?.split(' ')[0],
                lastName: patientData.name?.split(' ').slice(1).join(' '),
                status: patientData.eventType || 'CREATED',
                source: 'JAVA_PATIENT_SERVICE',
            }));

        } catch (err) {
            console.error('[Error] Decoding failed:', err.message);
            console.log('Raw data was:', data);
        }
    }



}