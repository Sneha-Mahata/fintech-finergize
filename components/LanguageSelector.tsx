'use client';
import { useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatbotContext } from '@/contexts/ChatbotContext';
import { SupportedLanguage } from '@/services/translationService';

interface Language {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
];

const LanguageSelector = () => {
  const { language, setLanguage, isTranslationEnabled, toggleTranslation } = useChatbotContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (value: string) => {
    if (value === 'en' || value === 'hi') {
      setLanguage(value as SupportedLanguage);
    }
    setIsOpen(false);
  };

  const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-gray-400 hover:text-white hover:bg-purple-900/30 gap-1.5"
          >
            <span className="text-base mr-1">{selectedLanguage.flag}</span>
            <span className="hidden md:inline">{selectedLanguage.name}</span>
            <Languages className="h-4 w-4 md:ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 border border-gray-800">
          <DropdownMenuRadioGroup value={language} onValueChange={handleLanguageChange}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <DropdownMenuRadioItem
                key={lang.code}
                value={lang.code}
                className="text-gray-300 cursor-pointer focus:bg-purple-900/30 focus:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span className="text-sm text-gray-500">({lang.nativeName})</span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <div className="px-2 py-2 border-t border-gray-800 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTranslation}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-900/30 gap-2"
            >
              <div className="h-4 w-4 flex items-center justify-center rounded border border-gray-600">
                {isTranslationEnabled && <Check className="h-3 w-3 text-blue-400" />}
              </div>
              <span>Show translations</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;