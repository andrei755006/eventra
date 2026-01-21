import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        IngestionModule,
    ],
})
export class AppModule {}