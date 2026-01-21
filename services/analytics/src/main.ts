import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './module/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Eventra-Analytics');
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/analytics');

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
                connectionTimeout: 10000, // Даем 10 секунд на коннект
            },
            consumer: {
                groupId: 'eventra-analytics-group-v1-server', // Добавил -server для надежности
            },
            subscribe: {
                fromBeginning: true,
            }
        },
    });

    await app.startAllMicroservices();
    await app.listen(5006);

    logger.log(`Analytics service is running on: http://localhost:5006/api/analytics`);
}
bootstrap();