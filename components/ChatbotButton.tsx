'use client';
import { Bot } from 'lucide-react';
import { Button } from './ui/button';
import { useChatbotContext } from '@/contexts/ChatbotContext';

const ChatbotButton = () => {
    const { openChat } = useChatbotContext();

    return (
        <Button
            onClick={openChat}
            className="fixed bottom-6 right-6 rounded-full w-16 h-16 border border-purple-500/50 p-0 flex items-center justify-center z-40 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.3)] bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700"
            aria-label="Chat with Nova"
        >
           <div className="flex items-center justify-center w-full h-full">
                <Bot className="text-white" style={{ width: '32px', height: '32px' }} />
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-40 rounded-full animate-pulse"></div>
            </div>
        </Button>
    );
};

export default ChatbotButton;