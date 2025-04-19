import { SupportedLanguage } from '@/services/translationService';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    translation?: string;
    detectedLanguage?: SupportedLanguage;
}

export interface ChatRequest {
    message: string;
    history: ChatMessage[];
    userInfo?: {
        name?: string;
        preferredLanguage?: SupportedLanguage;
        [key: string]: any;
    } | null;
}

export interface ChatResponse {
    response: string;
    translation?: string;
    detectedLanguage?: SupportedLanguage;
    [key: string]: any;
}