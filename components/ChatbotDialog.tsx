'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Mic, Volume2, VolumeX, HelpCircle, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChatMessage } from '@/types/chatbot';
import { sendMessage, sendMessageSimple } from '@/services/chatbotService';
import { translateText, detectLanguage, SupportedLanguage } from '@/services/translationService';
import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/chatStore';
import { useChatbotContext } from '@/contexts/ChatbotContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LanguageSelector from './LanguageSelector';

interface ChatbotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const BOT_NAME = "Nova";

const ChatbotDialog = ({ open, onOpenChange }: ChatbotDialogProps) => {
    const { data: session, status } = useSession();
    const { messages, addMessage, setMessages, resetMessages } = useChatStore();
    const { language, isTranslationEnabled } = useChatbotContext();
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [detectedInputLanguage, setDetectedInputLanguage] = useState<SupportedLanguage>('en');
    const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, vx: number, vy: number, opacity: number}>>([]);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const particleContainerRef = useRef<HTMLDivElement>(null);
    const recognition = useRef<any>(null);
    const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize speech synthesis voices
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Load voices
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                console.log(`Loaded ${voices.length} voices for speech synthesis`);
                setVoicesLoaded(voices.length > 0);
            };
            
            // Chrome requires onvoiceschanged, Firefox doesn't
            window.speechSynthesis.onvoiceschanged = loadVoices;
            
            // Try loading immediately as well (for Firefox)
            loadVoices();
            
            // Sometimes there's an issue with speechSynthesis getting stuck
            return () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            };
        }
    }, []);

    // Log audio state for debugging
    useEffect(() => {
        console.log("Audio enabled:", audioEnabled);
        console.log("Speech synthesis available:", typeof window !== 'undefined' && 'speechSynthesis' in window);
        console.log("Speech recognition available:", typeof window !== 'undefined' && 
            (!!window.SpeechRecognition || !!window.webkitSpeechRecognition));
    }, [audioEnabled]);

    // Initialize particles for background effect
    useEffect(() => {
        if (open) {
            const newParticles = [];
            for (let i = 0; i < 30; i++) {
                newParticles.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 2 + 1,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
            setParticles(newParticles);

            const animateParticles = () => {
                if (!open) return;
                
                setParticles(prevParticles => 
                    prevParticles.map(p => ({
                        ...p,
                        x: (p.x + p.vx + 100) % 100,
                        y: (p.y + p.vy + 100) % 100,
                    }))
                );
                animationFrameId = requestAnimationFrame(animateParticles);
            };

            let animationFrameId = requestAnimationFrame(animateParticles);
            
            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [open]);

    // Initialize messages with personalized greeting when session data is available
    useEffect(() => {
        if (open && !isInitialized) {
            // Only initialize if there are no messages yet
            if (messages.length === 0) {
                const userName = session?.user?.name;
                const welcomeMessage = userName
                    ? `Hi ${userName}! I'm ${BOT_NAME}, your financial assistant. How can I help you today?`
                    : `Hi there! I'm ${BOT_NAME}, your financial assistant. How can I help you today?`;
                
                // Initialize with welcome message in selected language
                initializeWithWelcomeMessage(welcomeMessage);
            }
            setIsInitialized(true);
        }
    }, [open, session, messages.length, isInitialized]);
    
    // Initialize with translated welcome message
    const initializeWithWelcomeMessage = async (welcomeMessage: string) => {
        // If English is selected, no translation needed
        if (language === 'en') {
            resetMessages();
            addMessage({
                role: 'assistant',
                content: welcomeMessage,
                detectedLanguage: 'en'
            });
            
            // Speak welcome message after a short delay to ensure the speech synthesis is ready
            setTimeout(() => {
                speakText(welcomeMessage, 'en');
            }, 500);
            return;
        }
        
        // If Hindi is selected, translate the welcome message
        try {
            setIsTranslating(true);
            const translatedMessage = await translateText(welcomeMessage, 'hi');
            
            const messageWithTranslation: ChatMessage = {
                role: 'assistant',
                content: welcomeMessage,
                translation: translatedMessage,
                detectedLanguage: 'en'
            };
            
            resetMessages();
            addMessage(messageWithTranslation);
            
            // Speak the translated welcome message for Hindi users
            setTimeout(() => {
                speakText(translatedMessage, 'hi');
            }, 500);
        } catch (error) {
            console.error('Error translating welcome message:', error);
            resetMessages();
            addMessage({
                role: 'assistant',
                content: welcomeMessage,
                detectedLanguage: 'en'
            });
            
            // Speak original welcome message if translation fails
            setTimeout(() => {
                speakText(welcomeMessage, 'en');
            }, 500);
        } finally {
            setIsTranslating(false);
        }
    };

    // Scroll to bottom when new messages arrive or when dialog opens
    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition ||
                window.webkitSpeechRecognition;

            if (SpeechRecognition && !recognition.current) {
                console.log("Initializing speech recognition");
                recognition.current = new SpeechRecognition();
                recognition.current.continuous = false;
                recognition.current.interimResults = false;
                
                // Set recognition language based on selected language
                recognition.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

                recognition.current.onresult = (event: any) => {
                    console.log("Speech recognition result:", event);
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setSpeechError(null);
                    setIsListening(false);
                    
                    // Clear any listening timeout
                    if (listeningTimeoutRef.current) {
                        clearTimeout(listeningTimeoutRef.current);
                        listeningTimeoutRef.current = null;
                    }
                };

                recognition.current.onerror = (event: any) => {
                    // Add specific handling for "no-speech" error
                    if (event.error === 'no-speech') {
                        console.log('No speech detected. Please try again and speak clearly.');
                        setSpeechError('No speech detected. Please try again and speak clearly.');
                    } else {
                        console.error('Speech recognition error:', event.error);
                        setSpeechError(`Speech error: ${event.error}`);
                    }
                    setIsListening(false);
                    
                    // Clear any listening timeout
                    if (listeningTimeoutRef.current) {
                        clearTimeout(listeningTimeoutRef.current);
                        listeningTimeoutRef.current = null;
                    }
                };

                recognition.current.onend = () => {
                    console.log("Speech recognition ended");
                    setIsListening(false);
                    
                    // Clear any listening timeout
                    if (listeningTimeoutRef.current) {
                        clearTimeout(listeningTimeoutRef.current);
                        listeningTimeoutRef.current = null;
                    }
                };
            }
        }

        return () => {
            stopListening();
            // Clear any listening timeout
            if (listeningTimeoutRef.current) {
                clearTimeout(listeningTimeoutRef.current);
                listeningTimeoutRef.current = null;
            }
        };
    }, [language]);

    // Update recognition language when selected language changes
    useEffect(() => {
        if (recognition.current) {
            recognition.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            console.log("Updated speech recognition language to:", recognition.current.lang);
        }
    }, [language]);

    // Play a short beep sound to indicate the start of listening
    const playListeningBeep = () => {
        if (!audioEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 880; // A5 note
            gainNode.gain.value = 0.1; // Low volume
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (error) {
            console.error("Error playing beep:", error);
        }
    };

    // Function to start listening
    const startListening = () => {
        if (recognition.current) {
            try {
                console.log("Starting speech recognition...");
                setSpeechError(null);
                
                // Ensure microphone permission is requested
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        // Play a beep to indicate the start of listening
                        playListeningBeep();
                        
                        // Set a longer timeout (default might be too short)
                        if ('timeout' in recognition.current) {
                            recognition.current.timeout = 10000; // 10 seconds (if supported)
                        }
                        
                        recognition.current.start();
                        setIsListening(true);
                        
                        // Set a safety timeout to stop listening after 15 seconds if no result
                        listeningTimeoutRef.current = setTimeout(() => {
                            if (isListening) {
                                try {
                                    recognition.current.stop();
                                } catch (e) {
                                    console.error("Error stopping recognition:", e);
                                }
                                setIsListening(false);
                                setSpeechError("Listening timed out. Please try again.");
                            }
                        }, 15000);
                    })
                    .catch(err => {
                        console.error("Microphone permission denied:", err);
                        setSpeechError("Microphone access is required for voice input.");
                        alert("Microphone access is required for voice input.");
                    });
            } catch (error) {
                console.error('Speech recognition error:', error);
                setIsListening(false);
                setSpeechError("Error starting speech recognition. Please try again.");
            }
        } else {
            console.error("Speech recognition not initialized");
            setSpeechError("Speech recognition not available in this browser.");
        }
    };

    // Function to stop listening
    const stopListening = () => {
        if (recognition.current && isListening) {
            try {
                recognition.current.stop();
                console.log("Stopped speech recognition");
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
            setIsListening(false);
        }
        
        // Clear any listening timeout
        if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
            listeningTimeoutRef.current = null;
        }
    };

    // Function to toggle audio output
    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    // Function to speak text with language support
    const speakText = (text: string, lang?: string) => {
        if (!audioEnabled) {
            console.log("Audio is disabled");
            return;
        }
        
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            console.error("Speech synthesis not supported in this browser");
            return;
        }

        try {
            console.log("Speaking text:", text.substring(0, 50) + "...");
            console.log("Language:", lang || "default");
            
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set language for speech synthesis
            if (lang === 'hi') {
                utterance.lang = 'hi-IN';
            } else {
                utterance.lang = 'en-US';
            }
            
            // Try to find a voice that matches the language
            const voices = window.speechSynthesis.getVoices();
            console.log("Available voices:", voices.length);
            
            const langVoices = voices.filter(voice => 
                voice.lang.startsWith(lang === 'hi' ? 'hi' : 'en')
            );
            
            if (langVoices.length > 0) {
                utterance.voice = langVoices[0];
                console.log("Using voice:", langVoices[0].name);
            }
            
            // Add an event handler to log when speech has completed
            utterance.onend = () => {
                console.log("Speech synthesis completed");
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Speech synthesis error:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!input.trim() || isLoading) return;
    
        // Detect language of user input
        setIsLoading(true);
        let userInputLanguage: SupportedLanguage = 'en';
        let translatedUserInput = input.trim();
        
        try {
            userInputLanguage = await detectLanguage(input.trim()) as SupportedLanguage;
            setDetectedInputLanguage(userInputLanguage);
            
            // If user typed in Hindi and we need to process in English
            if (userInputLanguage === 'hi') {
                translatedUserInput = await translateText(input.trim(), 'en');
            }
        } catch (error) {
            console.error('Error detecting language:', error);
            // Continue with original input
        }
    
        // Add user message with appropriate translation
        const userMessage: ChatMessage = { 
            role: 'user', 
            content: input.trim(),
            detectedLanguage: userInputLanguage
        };
        
        // If user is writing in a different language than currently selected
        if (userInputLanguage !== 'en' && userInputLanguage !== language) {
            try {
                // Add translation to match selected language
                userMessage.translation = await translateText(input.trim(), language);
            } catch (error) {
                console.error('Translation error:', error);
                // Continue without translation if it fails
            }
        }
        
        addMessage(userMessage);
        setInput('');
        setSpeechError(null);
    
        try {
            // Process through API (always sending English to the API for best results)
            const historyForAPI = messages.map(msg => ({
                role: msg.role,
                content: msg.role === 'user' && msg.detectedLanguage === 'hi' 
                    ? (msg.translation || msg.content) // Use English translation if available
                    : msg.content
            }));
    
            const request = {
                message: translatedUserInput,
                history: historyForAPI,
                userInfo: session?.user ? {
                    name: session.user.name || '',
                    preferredLanguage: language
                } : null
            };
    
            // Get response from API
            let data;
            try {
                data = await sendMessage(request);
            } catch (error) {
                console.log('Main API failed, trying simple API', error);
                data = await sendMessageSimple(request);
            }
    
            // Get the English response
            const englishResponse = data.response;
            
            // Create assistant response with appropriate translations
            const assistantResponse: ChatMessage = { 
                role: 'assistant', 
                content: englishResponse,
                detectedLanguage: 'en'
            };
    
            // Always add Hindi translation when Hindi is selected or user is communicating in Hindi
            if (language === 'hi' || userInputLanguage === 'hi') {
                setIsTranslating(true);
                try {
                    assistantResponse.translation = await translateText(englishResponse, 'hi');
                } catch (error) {
                    console.error('Translation error:', error);
                    // Continue without translation if it fails
                }
                setIsTranslating(false);
            }
    
            addMessage(assistantResponse);
    
            // Speak the response in the appropriate language
            if (language === 'hi' && assistantResponse.translation) {
                speakText(assistantResponse.translation, 'hi');
            } else {
                speakText(englishResponse, 'en');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            addMessage({ 
                role: 'assistant', 
                content: 'Sorry, I encountered an issue. Please try again later.',
                detectedLanguage: 'en'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        const userName = session?.user?.name;
        const welcomeMessage = userName
            ? `Hi ${userName}! I'm ${BOT_NAME}, your financial advisor. How can I help you today?`
            : `Hi there! I'm ${BOT_NAME}, your financial assistant. How can I help you today?`;
            
        // Reset with welcome message in selected language
        initializeWithWelcomeMessage(welcomeMessage);
    };

    const handleHelpTopicClick = async (topic: string) => {
        setActiveTab('chat');
        
        // Add user question
        let userMessage: ChatMessage = { 
            role: 'user', 
            content: topic,
            detectedLanguage: 'en'
        };
        
        // If selected language is Hindi, add translation
        if (language === 'hi') {
            try {
                setIsTranslating(true);
                const translatedTopic = await translateText(topic, 'hi');
                userMessage.translation = translatedTopic;
                setIsTranslating(false);
            } catch (error) {
                console.error('Translation error:', error);
                // Continue without translation if it fails
            }
        }
        
        addMessage(userMessage);
        
        // Simulate bot responding to the help topic
        setIsLoading(true);
        setTimeout(async () => {
            let response = '';
            
            switch(topic) {
                case 'How do I register?':
                    response = "To register for an account, click on the 'Register' button at the top of the website. You'll need to provide your name, phone number, and Aadhaar number. Once verified, you can set up your PIN for secure access.";
                    break;
                case 'How do I check my balance?':
                    response = "You can check your balance by logging into your account and visiting the Dashboard. Your current balance will be displayed prominently. You can also ask me 'What is my current balance?' and I'll help you retrieve that information.";
                    break;
                case 'How do I send money?':
                    response = "To send money, go to the 'Transfer' section from your dashboard. Enter the recipient's phone number or select them from your contacts, enter the amount, and confirm with your PIN. I can also guide you through the process if you type 'I want to send money'.";
                    break;
                case 'How do I reset my PIN?':
                    response = "If you've forgotten your PIN, click on the 'Forgot PIN' option on the login screen. We'll send a verification code to your registered phone number. After verification, you'll be able to set a new PIN.";
                    break;
                default:
                    response = "I'm happy to help with your question about " + topic + ". Please provide more details so I can assist you better.";
            }
            
            // Prepare assistant response
            let assistantResponse: ChatMessage = { 
                role: 'assistant', 
                content: response,
                detectedLanguage: 'en'
            };
            
            // Always translate to Hindi if Hindi is selected
            if (language === 'hi') {
                try {
                    setIsTranslating(true);
                    const translatedResponse = await translateText(response, 'hi');
                    assistantResponse.translation = translatedResponse;
                    setIsTranslating(false);
                } catch (error) {
                    console.error('Translation error:', error);
                    // Continue without translation if it fails
                }
            }
            
            // Add assistant response
            addMessage(assistantResponse);
            
            // Speak the response in the user's preferred language
            if (language === 'hi' && assistantResponse.translation) {
                speakText(assistantResponse.translation, 'hi');
            } else {
                speakText(response, 'en');
            }
            
            setIsLoading(false);
        }, 1000);
    };
    
    const renderMessageContent = (message: ChatMessage) => {
        // If it's a user message
        if (message.role === 'user') {
            // If the message has a translation and translations are enabled
            if (message.translation && isTranslationEnabled) {
                return (
                    <div className="flex flex-col gap-1">
                        <div>{message.content}</div>
                        <div className="text-gray-300 border-t border-gray-700 pt-1 mt-1">
                            {message.detectedLanguage === 'hi' ? (
                                <span className="text-xs text-blue-400 mb-1 block">English Translation:</span>
                            ) : (
                                <span className="text-xs text-blue-400 mb-1 block">Hindi Translation:</span>
                            )}
                            {message.translation}
                        </div>
                    </div>
                );
            }
            // Otherwise just show the content
            return message.content;
        }
        
        // For assistant messages
        if (message.translation && language === 'hi') {
            // When Hindi is selected, show Hindi translation as primary content
            return (
                <div className="flex flex-col gap-1">
                    {/* Show Hindi translation as primary content */}
                    <div>{message.translation}</div>
                    {/* Show English content only if translations toggle is enabled */}
                    {isTranslationEnabled && (
                        <div className="text-gray-300 border-t border-gray-700 pt-1 mt-1">
                            <span className="text-xs text-blue-400 mb-1 block">English Original:</span>
                            {message.content}
                        </div>
                    )}
                </div>
            );
        } else if (message.translation && isTranslationEnabled) {
            // When English is selected but translations are enabled
            return (
                <div className="flex flex-col gap-1">
                    <div>{message.content}</div>
                    <div className="text-gray-300 border-t border-gray-700 pt-1 mt-1">
                        <span className="text-xs text-blue-400 mb-1 block">Hindi Translation:</span>
                        {message.translation}
                    </div>
                </div>
            );
        }
        
        // Default case: just show the content
        return message.content;
    };

    if (!open) return null;

    return (
        <div 
            className="fixed bottom-20 right-6 z-50" 
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="w-[380px] h-[560px] bg-gradient-to-br from-gray-950 to-gray-900 border border-purple-500/50 shadow-[0_0_25px_rgba(147,51,234,0.2)] rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm relative"
            >
                {/* Particle background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" ref={particleContainerRef}>
                    {particles.map((particle, index) => (
                        <div 
                            key={index}
                            className="absolute rounded-full bg-blue-500"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                opacity: particle.opacity,
                            }}
                        />
                    ))}
                </div>

                {/* Header */}
                <div className="p-4 border-b border-purple-800/50 bg-gradient-to-r from-black via-purple-950/30 to-black flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 text-white">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                {BOT_NAME}
                            </span>
                            <span className="text-xs text-gray-400">
                                {session?.user?.name ? `${session.user.name}'s Financial Assistant` : 'Financial Assistant'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <LanguageSelector />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearChat}
                            className="h-8 w-8 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white transition-colors"
                            title="Clear chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleAudio}
                            className="h-8 w-8 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white transition-colors"
                            title={audioEnabled ? "Mute" : "Unmute"}
                        >
                            {audioEnabled ? (
                                <Volume2 className="h-4 w-4 text-blue-400" />
                            ) : (
                                <VolumeX className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white transition-colors"
                            title="Close"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800 relative z-10">
                    <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full bg-transparent border-b border-gray-800">
                            <TabsTrigger 
                                value="chat"
                                className="flex-1 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent text-gray-400"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Bot className="h-4 w-4" />
                                    <span>Chat</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="help"
                                className="flex-1 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent text-gray-400"
                            >
                                <div className="flex items-center gap-1.5">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>Help</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="chat" className="p-0 m-0">
                            {/* Messages area */}
                            <div className="flex-1 p-4 overflow-y-auto h-[360px] scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent relative z-10">
                                <div className="flex flex-col gap-4">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`flex gap-2 max-w-[85%] ${
                                                    message.role === 'user'
                                                        ? 'message-fade-in-right bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl shadow-[0_0_10px_rgba(147,51,234,0.2)]'
                                                        : 'message-fade-in-left bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 text-white border border-gray-700/50 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                                                } px-4 py-3 backdrop-blur-sm`}
                                            >
                                                {message.role === 'assistant' && (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mt-1 flex-shrink-0">
                                                        <Bot className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap">
                                                    {renderMessageContent(message)}
                                                </div>
                                                {message.role === 'user' && (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center mt-1 flex-shrink-0">
                                                        <User className="h-3.5 w-3.5 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start message-fade-in-left">
                                            <div className="bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 text-white border border-gray-700/50 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-4 py-3 flex gap-2 backdrop-blur-sm">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mt-1 flex-shrink-0">
                                                    <Bot className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot mx-0.5"></div>
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot mx-0.5"></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot mx-0.5"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isTranslating && (
                                        <div className="flex justify-start message-fade-in-left">
                                            <div className="bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 text-white border border-gray-700/50 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-4 py-3 flex gap-2 backdrop-blur-sm">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mt-1 flex-shrink-0">
                                                    <Languages className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-300">Translating...</span>
                                                    <div className="flex">
                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full typing-dot mx-0.5"></div>
                                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full typing-dot mx-0.5"></div>
                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full typing-dot mx-0.5"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input area */}
                            <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950 relative z-10">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex gap-2 items-center"
                                >
                                    <div className="relative flex-1">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            placeholder={language === 'hi' ? "वित्त के बारे में कुछ भी पूछें..." : "Ask me anything about finance..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            disabled={isLoading || isListening}
                                            className="flex-1 bg-gray-800/50 border-gray-700/50 text-white focus:ring-purple-500 focus:border-purple-500 placeholder:text-gray-500 rounded-xl"
                                        />
                                        {speechError && (
                                            <div className="absolute -top-10 left-0 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs animate-fade-in">
                                                {speechError}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        {typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition) && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                disabled={isLoading}
                                                onClick={isListening ? stopListening : startListening}
                                                className={`rounded-full ${isListening ? 'bg-red-600 hover:bg-red-700 recording-pulse' : 'bg-purple-700 hover:bg-purple-800'} text-white`}
                                                title={isListening ? "Stop listening" : "Start voice input"}
                                            >
                                                <Mic className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {isListening && (
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-full text-xs text-white whitespace-nowrap animate-pulse">
                                                Listening... Speak now
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="rounded-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white shadow-md shadow-purple-700/20"
                                        title="Send message"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>

                        {/* Help Tab Content */}
                        <TabsContent value="help" className="p-0 m-0">
                            <div className="flex-1 p-4 overflow-y-auto h-[360px] scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent relative z-10">
                                <div className="mb-4">
                                    <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                                        {language === 'hi' ? "मैं आपकी कैसे मदद कर सकता हूँ?" : "How can I help you?"}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {language === 'hi' 
                                            ? "नीचे एक विषय चुनें या अपना प्रश्न पूछने के लिए चैट पर वापस जाएं।" 
                                            : "Select a topic below or return to chat to ask your question."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] backdrop-blur-sm"
                                        onClick={() => handleHelpTopicClick("How do I register?")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-800/30 flex items-center justify-center mt-1 flex-shrink-0 text-blue-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-200 mb-0.5">
                                                    {language === 'hi' ? "खाता पंजीकरण" : "Account Registration"}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    {language === 'hi' ? "नया खाता कैसे बनाएं" : "Learn how to create a new account"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] backdrop-blur-sm"
                                        onClick={() => handleHelpTopicClick("How do I check my balance?")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-purple-800/30 flex items-center justify-center mt-1 flex-shrink-0 text-purple-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                                    <line x1="2" y1="10" x2="22" y2="10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-200 mb-0.5">
                                                    {language === 'hi' ? "बैलेंस चेक करें" : "Check Balance"}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    {language === 'hi' ? "अपना वर्तमान बैलेंस कैसे देखें" : "How to view your current balance"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] backdrop-blur-sm"
                                        onClick={() => handleHelpTopicClick("How do I send money?")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-green-800/30 flex items-center justify-center mt-1 flex-shrink-0 text-green-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-200 mb-0.5">
                                                    {language === 'hi' ? "पैसे भेजें" : "Send Money"}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    {language === 'hi' ? "दूसरों को पैसे कैसे ट्रांसफर करें" : "How to transfer funds to others"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] backdrop-blur-sm"
                                        onClick={() => handleHelpTopicClick("How do I reset my PIN?")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-red-800/30 flex items-center justify-center mt-1 flex-shrink-0 text-red-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-200 mb-0.5">
                                                    {language === 'hi' ? "पिन रीसेट करें" : "Reset PIN"}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    {language === 'hi' ? "भूले हुए पिन को कैसे रीसेट करें" : "How to reset your forgotten PIN"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ChatbotDialog;