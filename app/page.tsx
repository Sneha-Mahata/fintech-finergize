"use client";
import { ArrowRight, Shield, Wallet, Users, BookOpen, TrendingUp, Building, Phone, Clock, CreditCard, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import dynamic from 'next/dynamic';

// Dynamically import the 3D logo component with no SSR
const AnimatedLogo = dynamic(() => import('@/components/AnimatedLogo'), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse flex items-center justify-center">
      <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center">
        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">F</span>
      </div>
    </div>
  )
});

// Define types for component props
interface HoverCardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface SparkProps {
  className?: string;
  color?: string;
  size?: number;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}

interface TiltCardProps {
  children: React.ReactNode;
}

interface TextGradientOnHoverProps {
  children: React.ReactNode;
  className?: string;
}

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
}

interface GlowingButtonProps {
  children: React.ReactNode;
  className?: string;
   // For additional props
}

interface FeatureItem {
  
  title: string;
  description: string;
  gradient: string;
  href: string;
}

interface BenefitItem {
  
  title: string;
  description: string;
}

interface StatItem {
  
  title: string;
  value: string;
  countValue: number;
  subtitle: string;
  color: string;
}

// Client-side only components
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) return null;
  
  return <>{children}</>;
};

// Spark component
const Spark: React.FC<SparkProps> = ({ 
  className = "", 
  color = "#4f46e5", 
  size = 3, 
  delay = 0, 
  duration = 2,
  style = {}
}) => (
  <motion.div
    className={`absolute rounded-full ${className}`}
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: color,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      ...style
    }}
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{ 
      repeat: Infinity, 
      duration, 
      delay, 
      ease: "easeInOut" 
    }}
  />
);

// Animated background particles - Only rendered on client
const ParticleBackground: React.FC = () => {
  // Initialize particles array once to prevent hydration issues
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Only create particles on the client side
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.6 
        ? "rgba(96, 165, 250, 0.7)" 
        : Math.random() > 0.3 
          ? "rgba(167, 139, 250, 0.7)" 
          : "rgba(244, 114, 182, 0.7)",
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            x: ["-10vw", "10vw"],
            y: ["-10vh", "10vh"],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Aurora effect - purely decorative, client-side only
const Aurora: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-aurora-slow"></div>
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-3xl animate-aurora-fast"></div>
    <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-aurora-medium"></div>
    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-full blur-3xl animate-aurora-medium delay-75"></div>
  </div>
);

// Hover Effect Components
const HoverCard: React.FC<HoverCardProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black/20 border border-transparent dark:border-white/[0.1] group-hover:border-slate-700/50 relative z-20",
        className
      )}>
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p className={cn("mt-4 text-zinc-400 tracking-wide leading-relaxed text-sm", className)}>
      {children}
    </p>
  );
};

// Animated 3D tilt card component - Client side only
const TiltCard: React.FC<TiltCardProps> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hasMounted) return;
    const card = cardRef.current;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const centerX = width / 2;
    const centerY = height / 2;
    const rotateXValue = (y - centerY) / 10;
    const rotateYValue = (centerX - x) / 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  // To avoid hydration mismatch, use a default style initially
  const style = hasMounted ? {
    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
    transition: "transform 0.1s ease-out",
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className="relative h-full w-full cursor-pointer perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Text Gradient Hover Effect Component
const TextGradientOnHover: React.FC<TextGradientOnHoverProps> = ({ children, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span
      className={`relative inline-block transition-all duration-300 ${className} ${
        isHovered
          ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          : "text-white"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <span
        className={`absolute bottom-0 left-0 w-full h-[2px] transform origin-left transition-transform duration-300 ${
          isHovered ? "scale-x-100" : "scale-x-0"
        } bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400`}
      />
    </span>
  );
};

// Animated counter - Client side only with proper hydration handling
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ from, to, duration = 2 }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number>(from);
  const [isInView, setIsInView] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Handle animation only on client
    if (!isInView) return;
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setValue(Math.floor(from + progress * (to - from)));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCounter);
      }
    };
    
    animationFrame = requestAnimationFrame(updateCounter);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [from, to, duration, isInView]);

  useEffect(() => {
    if (!hasMounted) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    
    return () => {
      if (nodeRef.current) {
        observer.unobserve(nodeRef.current);
      }
    };
  }, [hasMounted]);

  // Use client-rendered value, default to "from" for server
  return <span ref={nodeRef}>{hasMounted ? value : from}</span>;
};

// Glowing button effect - Client side only
const GlowingButton: React.FC<GlowingButtonProps> = ({ children, className, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const glowRef = useRef<HTMLButtonElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!glowRef.current || !hasMounted) return;
    const { left, top } = glowRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    glowRef.current.style.setProperty('--x', `${x}px`);
    glowRef.current.style.setProperty('--y', `${y}px`);
  };
  
  return (
    <button
      ref={glowRef}
      className={cn(
        "relative overflow-hidden rounded-full group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={hasMounted ? handleMouseMove : undefined}
      {...props}
    >
      {hasMounted && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(circle_500px_at_var(--x)_var(--y),rgba(79,70,229,0.3)_0%,transparent_80%)]`}></div>
        </div>
      )}
      {children}
    </button>
  );
};

// Main Home component
export default function Home(): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isCTAHovered, setIsCTAHovered] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Initialize scrollYProgress on client only
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Ensure client-side only animations
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const features: FeatureItem[] = [
    {
      icon: <Building className="w-12 h-12 text-blue-500/80" />,
      title: "Digital Banking",
      description: "Access banking services right from your community",
      gradient: "from-blue-500/20 via-transparent to-transparent",
      href: "/banking"
    },
    {
      icon: <Users className="w-12 h-12 text-purple-500/80" />,
      title: "Community Savings",
      description: "Join local savings groups and grow together",
      gradient: "from-purple-500/20 via-transparent to-transparent",
      href: "/savings"
    },
    {
      icon: <Wallet className="w-12 h-12 text-emerald-500/80" />,
      title: "Micro Loans",
      description: "Quick access to fair and transparent loans",
      gradient: "from-emerald-500/20 via-transparent to-transparent",
      href: "/loans"
    },
    {
      icon: <Shield className="w-12 h-12 text-pink-500/80" />,
      title: "Mutual Funds",
      description: "Bank-grade security for all transactions",
      gradient: "from-pink-500/20 via-transparent to-transparent",
      href: "/security"
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-orange-500/80" />,
      title: "Growth Analytics",
      description: "Track your financial progress visually",
      gradient: "from-orange-500/20 via-transparent to-transparent",
      href: "/analytics"
    },
    {
      icon: <BookOpen className="w-12 h-12 text-cyan-500/80" />,
      title: "Financial Education",
      description: "Learn about savings and investments",
      gradient: "from-cyan-500/20 via-transparent to-transparent",
      href: "/education"
    }
  ];

  const benefits: BenefitItem[] = [
    {
      icon: <Phone className="w-6 h-6 text-blue-400" />,
      title: "Mobile First",
      description: "Access all services from your phone"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      title: "24/7 Access",
      description: "Bank anytime, anywhere"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      title: "Easy Payments",
      description: "Simple digital transactions"
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-blue-400" />,
      title: "Instant Alerts",
      description: "Real-time transaction updates"
    }
  ];

  const stats: StatItem[] = [
    { 
      icon: <Users className="w-6 h-6" />,
      title: "Active Users",
      value: "10K+",
      countValue: 10,
      subtitle: "Growing community",
      color: "blue"
    },
    { 
      icon: <Wallet className="w-6 h-6" />,
      title: "Total Savings",
      value: "₹5Cr+",
      countValue: 5,
      subtitle: "Community savings",
      color: "purple"
    },
    { 
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Growth Rate",
      value: "15%",
      countValue: 15,
      subtitle: "Monthly increase",
      color: "pink"
    }
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Progress indicator - Only rendered on client */}
      {hasMounted && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 origin-left"
          style={{ scaleX }}
        />
      )}

      {/* Particle Background - Client-side only */}
      <ClientOnly>
        <ParticleBackground />
      </ClientOnly>

      {/* Aurora effects - Client-side only */}
      <ClientOnly>
        <Aurora />
      </ClientOnly>

      {/* Grid background with reduced opacity */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,26,26,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,26,0.6)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Left to right gradient light effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div 
              className="mb-4 text-2xl md:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Welcome to
              </span>
            </motion.div>

           {/* 3D Logo Section */}
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 1.2, type: "spring" }}
  className="relative mb-2 w-full"
>
  <div className="max-w-md mx-auto h-[300px]">
    <ClientOnly>
      {/* Remove the Suspense wrapper since we're handling loading states in the AnimatedLogo component */}
      <AnimatedLogo />
    </ClientOnly>
  </div>
  
  {/* Animated glows behind the logo */}
  <div className="absolute inset-0 pointer-events-none -z-10">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>
</motion.div>

            <motion.h1 
              className="font-bold mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative">
                <span className="text-7xl md:text-8xl lg:text-9xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient inline-block leading-[1.8] tracking-tighter py-3">
                  Finergize
                </span>
                
                {/* Client-side only flying sparks */}
                <ClientOnly>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Spark 
                      key={i}
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%` 
                      }}
                      color={
                        i % 3 === 0 ? "#93c5fd" : 
                        i % 3 === 1 ? "#c4b5fd" : 
                        "#f9a8d4"
                      }
                      size={Math.random() * 3 + 1}
                      delay={Math.random() * 5}
                      duration={Math.random() * 3 + 1}
                    />
                  ))}
                </ClientOnly>
              </div>
            </motion.h1>
            
            <motion.p 
              className="text-gray-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Join millions building a better financial future with secure banking, savings, and community-driven growth.
            </motion.p>

            {/* Updated Modern Button Group */}
            <motion.div 
              className="flex flex-wrap gap-4 justify-center items-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
              
              {/* Get Started Button */}
              <Link href="/register">
                <ClientOnly>
                  <GlowingButton
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    className="group overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <div className="relative flex items-center gap-2">
                      <span className="text-white font-semibold text-lg">Get Started</span>
                      <motion.div
                        animate={isButtonHovered ? { x: [0, 4, 0] } : {}}
                        transition={{ duration: 0.6, repeat: isButtonHovered ? Infinity : 0 }}
                      >
                        <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-300 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </GlowingButton>
                </ClientOnly>
                
                {/* Fallback for server rendering */}
                {!hasMounted && (
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <span className="text-white font-semibold text-lg flex items-center gap-2">
                      Get Started <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                )}
              </Link>

              {/* Learn More Button */}
              <Link href="/about">
                <ClientOnly>
                  <GlowingButton className="group overflow-hidden rounded-full px-8 py-4 bg-transparent border-2 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                      Learn More
                    </span>
                  </GlowingButton>
                </ClientOnly>
                
                {/* Fallback for server rendering */}
                {!hasMounted && (
                  <button className="px-8 py-4 bg-transparent border-2 border-white/10 rounded-full">
                    <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                      Learn More
                    </span>
                  </button>
                )}
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating elements animation - Client side only */}
        <ClientOnly>
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>
        </ClientOnly>
      </section>

      {/* Features Section with Updated Heading */}
      <section className="py-20 px-4 relative">
        {/* Radial blur background behind the section */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-purple-900/5 to-transparent opacity-70 pointer-events-none"></div>
        
        <div className="container mx-auto">
          {/* Modern Features Heading */}
          <motion.div 
            className="relative text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Animated background elements - Client side only */}
            <ClientOnly>
              <div className="absolute inset-0 flex justify-center items-center">
                <motion.div 
                  className="w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 5,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </ClientOnly>
            
            {/* Main content */}
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-4">
                <ClientOnly>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-blue-400" />
                  </motion.div>
                </ClientOnly>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text animate-gradient bg-300% py-2">
                  Revolutionary Features
                </h2>
                <ClientOnly>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </motion.div>
                </ClientOnly>
              </div>
              
              <p className="text-gray-400 text-lg">
                Everything you need to manage your finances
              </p>
              
              {/* Decorative line - Client side only */}
              <ClientOnly>
                <div className="mt-4 relative h-1 max-w-xs mx-auto overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </ClientOnly>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                key={idx}
              >
                <Link
                  href={feature.href}
                  className="relative group block p-2 h-full w-full"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.div
                        className="absolute inset-0 h-full w-full"
                        layoutId="hoverBackground"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { duration: 0.15 },
                        }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.15, delay: 0.2 },
                        }}
                      >
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/10"></div>
                        
                        {/* Animated sparkles on hover - Client side only */}
                        <ClientOnly>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Spark 
                              key={i}
                              style={{ 
                                left: `${Math.random() * 100}%`, 
                                top: `${Math.random() * 100}%` 
                              }}
                              color={
                                idx % 3 === 0 ? "#93c5fd" : 
                                idx % 3 === 1 ? "#c4b5fd" : 
                                "#f9a8d4"
                              }
                              size={Math.random() * 3 + 1}
                              delay={Math.random() * 1}
                              duration={Math.random() * 2 + 1}
                            />
                          ))}
                        </ClientOnly>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <HoverCard>
                    <ClientOnly>
                      <TiltCard>
                        <div className={`p-4 rounded-lg bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                          <motion.div
                            animate={hoveredIndex === idx ? { 
                              y: [0, -5, 0],
                              rotate: [0, 5, 0],
                            } : {}}
                            transition={{ duration: 2, repeat: hoveredIndex === idx ? Infinity : 0, ease: "easeInOut" }}
                          >
                            {feature.icon}
                          </motion.div>
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                        <div className="mt-4 text-blue-400 hover:text-blue-300 flex items-center">
                          <TextGradientOnHover>Learn more</TextGradientOnHover>
                          <motion.div
                            animate={hoveredIndex === idx ? { x: [0, 5, 0] } : {}}
                            transition={{ duration: 1, repeat: hoveredIndex === idx ? Infinity : 0 }}
                          >
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </motion.div>
                        </div>
                      </TiltCard>
                    </ClientOnly>
                    
                    {/* Fallback for server rendering */}
                    {!hasMounted && (
                      <>
                        <div className={`p-4 rounded-lg bg-gradient-to-r ${feature.gradient}`}>
                          {feature.icon}
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                        <div className="mt-4 text-blue-400 flex items-center">
                          Learn more <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </>
                    )}
                  </HoverCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative">
        {/* Animated spotlight effect - Client side only */}
        <ClientOnly>
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]"
              animate={{ 
                x: ['-25%', '25%', '-25%'],
                y: ['-25%', '25%', '-25%']
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </ClientOnly>
        
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <h2 className="text-5xl font-bold mb-6 relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 py-2">
                      Why Choose Finergize?
                    </span>
                    
                    {/* Animated underline - Client side only */}
                    <ClientOnly>
                      <motion.div 
                        className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.2 }}
                        viewport={{ once: true }}
                      />
                      
                      {/* Sparkle effects around heading */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Spark 
                          key={i}
                          style={{ 
                            left: `${5 + i * 20}%`, 
                            top: `${Math.random() * 100}%` 
                          }}
                          color="#93c5fd"
                          size={2}
                          delay={i * 0.5}
                        />
                      ))}
                    </ClientOnly>
                  </h2>
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                </motion.div>
              </div>
              
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Experience the future of rural banking with our innovative platform designed specifically for your needs.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="group relative overflow-hidden">
                      {/* Animated border gradient - Client side only */}
                      <ClientOnly>
                        <motion.div 
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: 'center' }}
                          />
                        </motion.div>
                      </ClientOnly>
                      
                      {/* Card content */}
                      <div className="relative p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] to-purple-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Icon with glow */}
                        <div className="relative">
                          <ClientOnly>
                            <motion.div 
                              className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 w-fit"
                              whileHover={{ 
                                scale: 1.1,
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              {benefit.icon}
                            </motion.div>
                          </ClientOnly>
                          
                          {/* Fallback for server rendering */}
                          {!hasMounted && (
                            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 w-fit">
                              {benefit.icon}
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        
                        <h3 className="text-white font-semibold text-lg mt-4">{benefit.title}</h3>
                        <p className="text-gray-400 mt-2 text-sm">{benefit.description}</p>
                        
                        {/* Hidden shine effect on hover - Client side only */}
                        <ClientOnly>
                          <motion.div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 duration-1500 transition-opacity"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                          </motion.div>
                        </ClientOnly>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                {/* Background card with glass effect */}
                <div className="p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-gray-800/50 relative overflow-hidden">
                  {/* Animated gradient background - Client side only */}
                  <ClientOnly>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"
                      animate={{ 
                        background: [
                          "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))",
                          "linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                          "linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))"
                        ]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                  </ClientOnly>
                  
                  <div className="relative space-y-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <ClientOnly>
                              <motion.div 
                                className={`p-2 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`}
                                whileHover={{ 
                                  rotate: [0, 10, -10, 0],
                                  scale: 1.1
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {stat.icon}
                              </motion.div>
                            </ClientOnly>
                            
                            {/* Fallback for server rendering */}
                            {!hasMounted && (
                              <div className={`p-2 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-400`}>
                                {stat.icon}
                              </div>
                            )}
                            
                            <div>
                              <p className="text-white font-medium">{stat.title}</p>
                              <p className="text-gray-400 text-sm">{stat.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-300">
                            {/* Use counter animation for stat values - Client side only */}
                            <ClientOnly>
                              {index === 0 ? (
                                <>
                                  <AnimatedCounter from={0} to={10} />K+
                                </>
                              ) : index === 1 ? (
                                <>
                                  ₹<AnimatedCounter from={0} to={5} />Cr+
                                </>
                              ) : (
                                <>
                                  <AnimatedCounter from={0} to={15} />%
                                </>
                              )}
                            </ClientOnly>
                            
                            {/* Fallback for server rendering */}
                            {!hasMounted && (
                              <>{stat.value}</>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decorative blurred circles */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
                
                {/* Flying particles - Client side only */}
                <ClientOnly>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Spark 
                      key={i}
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%` 
                      }}
                      color={
                        i % 3 === 0 ? "#93c5fd" : 
                        i % 3 === 1 ? "#c4b5fd" : 
                        "#f9a8d4"
                      }
                      size={Math.random() * 2 + 1}
                      delay={Math.random() * 3}
                    />
                  ))}
                </ClientOnly>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Animated background elements - Client side only */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <ClientOnly>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/4 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-1/4 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            />
          </ClientOnly>
        </div>

        {/* Animated particles - Client side only */}
        <ClientOnly>
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <Spark 
                key={i}
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
                color={
                  i % 3 === 0 ? "#93c5fd" : 
                  i % 3 === 1 ? "#c4b5fd" : 
                  "#f9a8d4"
                }
                size={Math.random() * 3 + 1}
                delay={Math.random() * 5}
                duration={Math.random() * 3 + 1}
              />
            ))}
          </div>
        </ClientOnly>

        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
              {/* Decorative grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl" />

              {/* Content container */}
              <div className="relative z-10 text-center space-y-8">
                {/* Heading with gradient animation */}
                <div className="relative">
                  <ClientOnly>
                    <motion.span
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="absolute h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bottom-0 left-0 right-0 rounded-full opacity-50"
                    />
                  </ClientOnly>
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white pb-4">
                    Ready to Start Your Financial Journey?
                  </h2>
                </div>

                {/* Description */}
                <motion.p 
                  className="text-lg text-gray-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Join thousands of others who have already taken control of their financial future.
                </motion.p>

                {/* Button */}
                <motion.div 
                  className="pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link href="/register">
                    <ClientOnly>
                      <GlowingButton
                        onMouseEnter={() => setIsCTAHovered(true)}
                        onMouseLeave={() => setIsCTAHovered(false)}
                        className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                      >
                        {/* Gradient background shift on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 duration-500 transition-opacity">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                            animate={isCTAHovered ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: isCTAHovered ? Infinity : 0, 
                              ease: "easeInOut" 
                            }}
                          />
                        </div>

                        {/* Button content */}
                        <span className="relative flex items-center">
                          <span className="text-white font-semibold text-lg px-2">Create Free Account</span>
                          <motion.div
                            animate={isCTAHovered ? { x: [0, 5, 0] } : {}}
                            transition={{ duration: 1, repeat: isCTAHovered ? Infinity : 0 }}
                          >
                            <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.div>
                        </span>

                        {/* Bottom highlight */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </GlowingButton>
                    </ClientOnly>
                    
                    {/* Fallback for server rendering */}
                    {!hasMounted && (
                     <button className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
                     <span className="text-white font-semibold text-lg flex items-center gap-2">
                       Create Free Account <ArrowRight className="w-5 h-5" />
                     </span>
                   </button>
                 )}
               </Link>
             </motion.div>
           </div>
         </div>

         {/* Additional decorative elements */}
         <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
         <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500" />
       </motion.div>
     </div>
   </section>
   
   {/* Add CSS Keyframes */}
   <style jsx global>{`
     @keyframes aurora-slow {
       0% { transform: rotate(0deg) translate(0, 0) scale(1); }
       50% { transform: rotate(180deg) translate(-50px, -20px) scale(1.2); }
       100% { transform: rotate(360deg) translate(0, 0) scale(1); }
     }
     
     @keyframes aurora-fast {
       0% { transform: rotate(0deg) translate(0, 0) scale(1); }
       50% { transform: rotate(-180deg) translate(50px, 20px) scale(1.2); }
       100% { transform: rotate(-360deg) translate(0, 0) scale(1); }
     }
     
     @keyframes aurora-medium {
       0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
       50% { transform: translate(-30px, 30px) scale(1.2); opacity: 0.7; }
       100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
     }
     
     .animate-aurora-slow {
       animation: aurora-slow 25s infinite linear;
     }
     
     .animate-aurora-fast {
       animation: aurora-fast 20s infinite linear;
     }
     
     .animate-aurora-medium {
       animation: aurora-medium 15s infinite ease-in-out;
     }
     
     .delay-75 {
       animation-delay: 7.5s;
     }
     
     .perspective-1000 {
       perspective: 1000px;
     }
     
     .bg-300\% {
       background-size: 300% 100%;
     }
     
     .animate-gradient {
       animation: gradient 8s infinite linear;
     }
     
     @keyframes gradient {
       0% { background-position: 0% 50%; }
       50% { background-position: 100% 50%; }
       100% { background-position: 0% 50%; }
     }
     
     .bg-gradient-radial {
       background-image: radial-gradient(var(--tw-gradient-stops));
     }
     
     @keyframes spin-slow {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
     }

     .animate-spin-slow {
       animation: spin-slow 10s linear infinite;
     }

     @keyframes float {
       0%, 100% { transform: translateY(0px); }
       50% { transform: translateY(-20px); }
     }

     .animate-float {
       animation: float 6s ease-in-out infinite;
     }
     
     /* Add more metallic/glass appearance */
     .metallic-bg {
       background: linear-gradient(45deg, #3b82f680, #8b5cf680, #6366f180);
       background-size: 200% 200%;
       animation: gradient-shift 10s ease infinite;
     }

     @keyframes gradient-shift {
       0% { background-position: 0% 50%; }
       50% { background-position: 100% 50%; }
       100% { background-position: 0% 50%; }
     }

     /* For improved reflections */
     .reflection {
       position: relative;
     }

     .reflection::after {
       content: '';
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: linear-gradient(
         135deg,
         rgba(255, 255, 255, 0.2) 0%,
         rgba(255, 255, 255, 0) 50%,
         rgba(255, 255, 255, 0.2) 100%
       );
       border-radius: inherit;
       z-index: 1;
       pointer-events: none;
     }
   `}</style>
 </main>
);
}