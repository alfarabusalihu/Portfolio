export type SendStatus = 'idle' | 'sending' | 'success' | 'error';

export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export interface ContactFormErrors {
    name: string;
    email: string;
    message: string;
}

export interface SpinningBorderWrapperProps {
    active: boolean;
    children: React.ReactNode;
}
