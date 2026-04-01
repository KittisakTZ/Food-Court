export type TypeAuth = {
    created_at: string;
    updated_at: string;
}

export type AuthResponse = {
    success: boolean;
    message: string;
    responseObject: TypeAuth;
    statusCode: number;
};

export type UserAuthResponse = {
    id: string;
    username: string;
    email: string | null;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    gender: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED' | null;
    createdAt: string;
    updatedAt: string;
};