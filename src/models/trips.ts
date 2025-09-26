export interface Trip {
    id?: string;
    name?: string;
    date?: Date;
    title?: string;
    description?: string | null;
    image?: string | null;
    video?: string | null;
    content?: object[];
    stages?: any[];
    keywords?: string[] | null;
    published?: boolean;
    url?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
}

export interface TripPreview {
    name?: string;
    date?: Date;
    title?: string;
    description?: string | null;
    image?: string | null;
    video?: string | null;
    url?: string;
}
