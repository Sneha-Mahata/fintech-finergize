'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from '@/types/chatbot';
import { SupportedLanguage } from '@/services/translationService';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  resetMessages: (initialMessage?: string) => void;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  isTranslationEnabled: boolean;
  setTranslationEnabled: (enabled: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      language: 'en' as SupportedLanguage,
      isTranslationEnabled: false,
      
      addMessage: (message) => 
        set((state) => ({ messages: [...state.messages, message] })),
      
      setMessages: (messages) => set({ messages }),
      
      resetMessages: (initialMessage) => 
        set({ 
          messages: initialMessage 
            ? [{ role: 'assistant', content: initialMessage }] 
            : [] 
        }),
      
      setLanguage: (language) => set({ language }),
      
      setTranslationEnabled: (enabled) => set({ isTranslationEnabled: enabled }),
    }),
    {
      name: 'chat-storage',
    }
  )
);