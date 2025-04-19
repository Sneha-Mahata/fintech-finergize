'use client';

/**
 * Translation service for the chatbot
 * Uses Google Translate API for translations
 */

// Define supported languages
export type SupportedLanguage = 'en' | 'hi';

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

const GOOGLE_TRANSLATE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';

/**
 * Translates text using Google Translate API
 * @param text The text to translate
 * @param targetLanguage The target language code (default: 'hi' for Hindi)
 * @returns Promise with the translated text
 */
export async function translateText(
  text: string,
  targetLanguage: SupportedLanguage = 'hi'
): Promise<string> {
  try {
    // Skip translation if API key is missing
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('No Google Translate API key provided.');
      return text;
    }
    
    // Skip translation if input is empty
    if (!text.trim()) {
      return text;
    }

    // Skip translation if the target language matches the detected source language
    const detectedLang = await detectLanguage(text);
    if (detectedLang === targetLanguage) {
      return text;
    }
    
    // Construct the Google Translate API URL
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Detects the language of the provided text
 * @param text The text to detect language for
 * @returns Promise with the detected language code
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage> {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      return 'en'; // Default to English if no API key
    }

    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.status}`);
    }

    const data = await response.json();
    const detectedLang = data.data.detections[0][0].language;
    
    // Convert to our supported languages
    if (detectedLang.startsWith('hi')) return 'hi';
    return 'en'; // Default to English for any other language
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Formats a message with translation
 * @param original Original message
 * @param translated Translated message
 * @returns Formatted message with original and translation
 */
export function formatWithTranslation(original: string, translated: string): string {
  if (original === translated) return original;
  
  return `${original}\n\n${translated}`;
}