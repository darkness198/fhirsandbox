
export interface Patient {
    name?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    conditions?: ActiveCondition[];
}

export enum Gender {
    FEMALE = 'female',
    MALE = 'male'
}

export interface ActiveCondition {
    name: string;
    dateRecorded: Date;
    pubMedLink: string;
}