import { NestFactory } from '@nestjs/core';
import { AppModule } from "./module/app.module";
import { ConfigService } from '@nestjs/config';
import { ApplicationConfig } from './config/app.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Eventra-Account');
    const app = await NestFactory.create(AppModule);

    // Get configuration service
    const config = app.get<ConfigService<ApplicationConfig>>(ConfigService);

    const prefix = config.get('HTTP_PREFIX')!;
    const port = Number(config.get('HTTP_PORT')!);

    // Connect Kafka microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [config.get('KAFKA_BROKER') || 'localhost:9094'],
            },
            consumer: {
                groupId: config.get('KAFKA_GROUP_ID') || 'eventra-account-group',
            },
        },
    });

    // Start all microservices (Kafka listener)
    await app.startAllMicroservices();

    app.setGlobalPrefix(prefix);
    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}${prefix}`);
    logger.log(`Kafka microservice is connected`);
}

bootstrap();