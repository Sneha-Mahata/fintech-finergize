"use client";

import React, { useState, useEffect, useRef } from 'react';

// Import the SketchfabModel only on the client side
const AnimatedLogo: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    // Set mounted state to true when component mounts
    setMounted(true);
    
    // Clean up function to prevent memory leaks
    return () => {
      setMounted(false);
      hasInitialized.current = false;
    };
  }, []);
  
  // Lazy load the SketchfabModel component only when needed
  useEffect(() => {
    // Only run this once when mounted becomes true
    if (mounted && !hasInitialized.current && modelContainerRef.current) {
      hasInitialized.current = true;
      
      // Dynamically import the SketchfabModel component
      import('./SketchfabModel').then(({ default: SketchfabModel }) => {
        // Make sure the component is still mounted
        if (!modelContainerRef.current) return;
        
        // Create a new instance of the SketchfabModel component
        const modelPath = '/models/scene.gltf';
        
        // Render the SketchfabModel component inside the container
        const root = document.createElement('div');
        root.style.width = '100%';
        root.style.height = '100%';
        modelContainerRef.current.innerHTML = ''; // Clear any existing content
        modelContainerRef.current.appendChild(root);
        
        // Use React to render the component
        const { createRoot } = require('react-dom/client');
        const reactRoot = createRoot(root);
        reactRoot.render(<SketchfabModel modelPath={modelPath} />);
      });
    }
  }, [mounted]);
  
  // Placeholder content for server-side rendering
  if (!mounted) {
    return (
      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center">
          <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">F</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      {/* This div will hold our 3D model */}
      <div ref={modelContainerRef} className="absolute inset-0 z-10"></div>
    </div>
  );
};

export default AnimatedLogo;