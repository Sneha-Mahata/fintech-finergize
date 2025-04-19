"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface SketchfabModelProps {
  modelPath: string;
}

const SketchfabModel: React.FC<SketchfabModelProps> = ({ modelPath }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to match the page
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Ensure transparency is enabled
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Add tone mapping for better lighting
    renderer.toneMappingExposure = 1.2; // Increase exposure slightly
    containerRef.current.appendChild(renderer.domElement);
    
    // Enhanced lighting setup
    // Increase ambient light intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased from 0.5 to 0.8
    scene.add(ambientLight);
    
    // Make directional lights brighter
    const directionalLight1 = new THREE.DirectionalLight(0x4f46e5, 1.5); // Increased from 1 to 1.5
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xa855f7, 1.5); // Increased from 1 to 1.5
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // Add point lights with higher intensity for extra highlights
    const pointLight1 = new THREE.PointLight(0x3b82f6, 1.5, 10); // Increased from 1 to 1.5
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.5, 10); // Increased from 1 to 1.5
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xec4899, 1.5, 10); // Increased from 1 to 1.5
    pointLight3.position.set(0, 2, -2);
    scene.add(pointLight3);
    
    // Add a new front-facing light to illuminate the model better
    const frontLight = new THREE.PointLight(0xffffff, 1.2, 15);
    frontLight.position.set(0, 0, 5); // Positioned in front of the model
    scene.add(frontLight);
    
    // Add enhanced OrbitControls for better interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true; // Enable zooming for interactivity
    controls.enablePan = true; // Enable panning
    controls.autoRotate = true; // Auto-rotate when not interacting
    controls.autoRotateSpeed = 1.0; // Set auto-rotation speed
    controls.minDistance = 2; // Prevent zooming too close
    controls.maxDistance = 10; // Prevent zooming too far out
    
    // Load the model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        
        gltf.scene.position.x = -center.x * scale;
        gltf.scene.position.y = -center.y * scale;
        gltf.scene.position.z = -center.z * scale;
        gltf.scene.scale.multiplyScalar(scale);
        
        // Enhance materials to make them more responsive to lighting
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // If the material is standard material, adjust its properties
            if (child.material.type === 'MeshStandardMaterial') {
              child.material.metalness = 0.4; // Slightly increase metalness
              child.material.roughness = 0.5; // Decrease roughness for more shine
              child.material.envMapIntensity = 1.2; // Enhance environment map reflection
            }
            
            // Make materials receive shadows
            child.material.needsUpdate = true;
            child.receiveShadow = true;
            child.castShadow = true;
          }
        });
        
        // Add model to scene
        scene.add(gltf.scene);
        
        // Hide loading indicator once model is loaded
        setIsLoading(false);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the model:', error);
        setIsLoading(false); // Hide loading indicator even if there's an error
      }
    );
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Required for damping and auto-rotation
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Fallback for loading indicator
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [modelPath]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] relative"
    >
      {/* Loading indicator - for loading*/}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SketchfabModel;