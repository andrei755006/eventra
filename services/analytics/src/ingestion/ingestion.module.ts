import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { PatientHistory } from './entities/patient-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PatientHistory])],
    controllers: [IngestionController],
})
export class IngestionModule {}