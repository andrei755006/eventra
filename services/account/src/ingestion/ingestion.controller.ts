// services/account/src/ingestion/ingestion.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import * as protobuf from 'protobufjs';
import { join } from 'path';

@Controller()
export class IngestionController {
    private patientProto: any;

    constructor() {
        this.initProto();
    }

    private async initProto() {
        const root = await protobuf.load(join(__dirname, 'proto/patient_event.proto'));
        this.patientProto = root.lookupType('patient.events.PatientEvent');
    }

    @EventPattern('patient')
    async handlePatientCreated(@Payload() data: any) {
        console.log('--- ACCOUNT SERVICE: RECEIVED EVENT ---');
        try {
            let buffer: Buffer;

            if (Buffer.isBuffer(data)) {
                buffer = data;
            } else if (typeof data === 'string') {
                // Если пришла строка (как мы видим в дебаге), превращаем её в Buffer
                buffer = Buffer.from(data, 'utf-8');
            } else if (data && data.value) {
                buffer = Buffer.isBuffer(data.value) ? data.value : Buffer.from(data.value);
            } else {
                // На всякий случай для других форматов
                buffer = Buffer.from(data);
            }

            if (!buffer || buffer.length === 0) {
                throw new Error('Buffer is empty');
            }

            const message = this.patientProto.decode(buffer);
            const patientData = this.patientProto.toObject(message, {
                longs: String,
                enums: String,
                defaults: true,
            });

            console.log(`✅ SUCCESS! Account Service synced: ${patientData.name} (ID: ${patientData.patientId})`);

        } catch (e) {
            console.error('❌ Account ingestion error:', e.message);
        }
    }
}