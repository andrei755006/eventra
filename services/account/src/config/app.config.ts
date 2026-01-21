// src/config/app.config.ts
import { IsEnum, IsString } from 'class-validator';
import { Environment } from './types/configurations.enums';

export class ApplicationConfig {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsString()
    SERVICE_NAME: string;

    @IsString()
    HTTP_HOST: string;

    @IsString()
    HTTP_PORT: string;

    @IsString()
    HTTP_PREFIX: string;

    @IsString()
    HTTP_VERSION: string;

    @IsString()
    DB_HOST: string;

    @IsString()
    DB_PORT: string;

    @IsString()
    DB_NAME: string;

    @IsString()
    DB_USER: string;

    @IsString()
    DB_PASSWORD: string;

    @IsString()
    KAFKA_BROKER: string;

    @IsString()
    KAFKA_GROUP_ID: string;
}
