'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ChatbotDialog from '@/components/ChatbotDialog';
import { SupportedLanguage } from '@/services/translationService';

interface ChatbotContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isTranslationEnabled: boolean;
  toggleTranslation: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);

  // Load language preference from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('chatbot-language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        setLanguage(savedLanguage as SupportedLanguage);
      }
      
      const translationEnabled = localStorage.getItem('chatbot-translation-enabled');
      if (translationEnabled) {
        setIsTranslationEnabled(translationEnabled === 'true');
      }
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot-language', language);
      localStorage.setItem('chatbot-translation-enabled', isTranslationEnabled.toString());
      
      // Also save as speech preference
      localStorage.setItem('speech-language-preference', language);
    }
  }, [language, isTranslationEnabled]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  
  const toggleTranslation = () => {
    setIsTranslationEnabled(prev => !prev);
  };

  return (
    <ChatbotContext.Provider 
      value={{ 
        isOpen, 
        openChat, 
        closeChat, 
        language, 
        setLanguage,
        isTranslationEnabled,
        toggleTranslation
      }}
    >
      {children}
      <ChatbotDialog open={isOpen} onOpenChange={setIsOpen} />
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};

export default ChatbotContext;