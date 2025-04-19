import { ChatRequest, ChatResponse } from '@/types/chatbot';
import { SupportedLanguage } from '@/services/translationService';

const API_URL = 'https://financial-chatbot-api.onrender.com';

/**
 * Fetches user information if available
 * @returns Promise with user info or null
 */
export async function fetchUserInfo(): Promise<{ name: string; preferredLanguage?: SupportedLanguage } | null> {
    try {
        // Check if we have a local session with user info
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user-info');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        }
        
        // If no local info, try to fetch from API
        const response = await fetch(`${API_URL}/user-info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies if any
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

/**
 * Sends a message to the chatbot API and returns the response
 * @param request The chat request containing user message and history
 * @returns Promise with the chatbot response
 */
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `API error: ${response.status} ${response.statusText}${
                    errorData?.detail ? ` - ${errorData.detail}` : ''
                }`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error calling chatbot API:', error);
        throw error;
    }
}

/**
 * Fallback method if the main API fails
 */
export async function sendMessageSimple(request: ChatRequest): Promise<ChatResponse> {
    try {
        // Include language preference in the request
        const response = await fetch(`${API_URL}/simple-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Simple API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error calling simple chatbot API:', error);
        throw error;
    }
}

/**
 * Check if the chatbot API is available
 */
export async function checkChatbotHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Chatbot health check failed:', error);
        return false;
    }
}

/**
 * Update user language preference
 */
export async function updateUserLanguagePreference(language: SupportedLanguage): Promise<boolean> {
    try {
        // Save preference locally
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user-info');
            if (storedUser) {
                const userInfo = JSON.parse(storedUser);
                userInfo.preferredLanguage = language;
                localStorage.setItem('user-info', JSON.stringify(userInfo));
            } else {
                localStorage.setItem('user-info', JSON.stringify({ preferredLanguage: language }));
            }
        }
        
        // Send to backend if user is authenticated
        const response = await fetch(`${API_URL}/update-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ preferredLanguage: language }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error updating language preference:', error);
        return false;
    }
}