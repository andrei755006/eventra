// services/analytics/src/ingestion/dto/patient-event.dto.ts

export class PatientEventDto {
    // Matches 'patientId' from proto
    patientId: string;

    // Matches 'name' from proto
    name: string;

    // Matches 'email' from proto
    email: string;

    // Matches 'event_type' from proto
    eventType: string;

    // Optional fields for our internal mapping
    source?: string;
}