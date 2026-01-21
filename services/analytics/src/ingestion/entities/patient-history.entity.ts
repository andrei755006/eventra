import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('patient_history')
export class PatientHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    externalId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    source: string;

    @CreateDateColumn()
    receivedAt: Date;
}