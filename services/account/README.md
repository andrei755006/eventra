# Eventra Ecosystem

## Overview
Eventra is an event-driven extension of the core hospital system. It processes patient and financial data in real-time using a reactive microservices architecture.

## Architecture
- **Core (Java):** Provides Auth and API Gateway (Port: 4004).
- **Eventra (Node.js/NestJS):** Processes data via Kafka consumers.

| Service | Technology | Port | Primary Communication |
| :--- | :--- | :--- | :--- |
| **Auth/Gateway** | Java / Spring | 4004 | REST / JWT Provider |
| **Account** | NestJS 11 | 5005 | Kafka Consumer + REST |
| **Analytics** | NestJS 11 | 5006 | Kafka Consumer (Ingestion) |

## Infrastructure
- **Message Broker:** Kafka (Port: 9092/9094)
- **Database:** PostgreSQL (Port: 45432)
- **Serialization:** Protocol Buffers (Protobuf)

## Project Setup
```bash
# Install dependencies
pnpm install

# Run services (from service directories)
pnpm run start:dev
Environment VariablesVariableDescriptionDefaultHTTP_PORTService API Port5005/5006KAFKA_BROKERKafka Broker Addresslocalhost:9092