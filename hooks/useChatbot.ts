'use client';
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot';
import { sendMessage, sendMessageSimple, fetchUserInfo } from '@/services/chatbotService';

interface UseChatbotReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    userInfo: { name: string } | null;
    sendMessage: (message: string) => Promise<void>;
    reset: () => void;
}

/**
 * Hook to interact with the financial advisor chatbot
 */
export function useChatbot(initialMessage?: string): UseChatbotReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);

    // Fetch user information when the component mounts
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const data = await fetchUserInfo();
                setUserInfo(data);
                
                // Set initial message with user's name if available
                const greeting = data?.name 
                    ? `Hi ${data.name}! I'm your financial advisor. How can I help you today?`
                    : `Hi there! I'm your financial advisor. How can I help you today?`;
                
                setMessages([{ role: 'assistant', content: greeting }]);
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Set default message if user info fetch fails
                setMessages([{ 
                    role: 'assistant', 
                    content: initialMessage || "Hi there! I'm your financial advisor. How can I help you today?" 
                }]);
            }
        };

        getUserInfo();
    }, [initialMessage]);

    const sendUserMessage = useCallback(async (message: string) => {
        if (!message.trim() || isLoading) return;

        // Add user message to the chat
        const userMessage: ChatMessage = { role: 'user', content: message.trim() };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Prepare the API request
            const historyForAPI = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const request = {
                message: message.trim(),
                history: historyForAPI,
                userInfo: userInfo // Pass user info to API
            };

            // Try main API first, fall back to simple API if it fails
            let data;
            try {
                data = await sendMessage(request);
            } catch (error) {
                console.log('Main API failed, trying simple API');
                data = await sendMessageSimple(request);
            }

            // Add assistant response to the chat
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error communicating with chatbot:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an issue. Please try again later or refresh the page.'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading, userInfo]);

    const reset = useCallback(() => {
        // Reset with personalized message if user info is available
        const greeting = userInfo?.name 
            ? `Hi ${userInfo.name}! I'm your financial advisor. How can I help you today?`
            : initialMessage || "Hi there! I'm your financial advisor. How can I help you today?";
            
        setMessages([{ role: 'assistant', content: greeting }]);
    }, [initialMessage, userInfo]);

    return {
        messages,
        isLoading,
        userInfo,
        sendMessage: sendUserMessage,
        reset
    };
}

export default useChatbot;