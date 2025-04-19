'use client';
// hooks/useAuthModal.ts
import React, { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<'login' | 'register'>('login');
  
  const openModal = (tab: 'login' | 'register' = 'login') => {
    setInitialTab(tab);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
  };
  
  // Fix: Define the component function without JSX inside the hook
  // This avoids TS issues with JSX in non-component files
  const AuthModalComponent: React.FC = () => {
    return React.createElement(AuthModal, {
      isOpen: isOpen,
      onClose: closeModal,
      initialTab: initialTab
    });
  };
  
  return {
    isOpen,
    openModal,
    closeModal,
    AuthModalComponent,
  };
}