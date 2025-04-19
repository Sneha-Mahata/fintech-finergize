'use client';

import {  useState } from 'react';
import { motion } from 'framer-motion';

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

interface SparkleProps {
  delay: number;
}

const Sparkle = ({ delay }: SparkleProps) => {
  const size = random(2, 4);
  const left = random(0, 100);
  const top = random(0, 100);
  const opacity = Math.random() * 0.5 + 0.2; // Random opacity between 0.2 and 0.7

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'white',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, opacity, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: random(2, 8),
      }}
    />
  );
};

export const SparklesBackground = () => {
  const [sparkles] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: random(0, 10),
    }))
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Grid background with dark gradient overlay */}
      <div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-20"
        style={{
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 70%, transparent 100%)',
        }}
      />
      
      {/* Sparkles container */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} delay={sparkle.delay} />
        ))}
      </div>

      {/* Color overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-purple-900/30 to-pink-900/30 animate-gradient-slow"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-black opacity-80"></div>
    </div>
  );
};

export default SparklesBackground;