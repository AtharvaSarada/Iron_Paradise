import React from 'react';

interface SilkBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function SilkBackground({ children, className = '' }: SilkBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Dark Base Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Silk Background Effect */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Dark Purple Silk Gradients */}
            <radialGradient id="silk-gradient-1" cx="0.3" cy="0.2" r="0.6">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.8)" />
              <stop offset="30%" stopColor="rgba(126, 34, 206, 0.6)" />
              <stop offset="70%" stopColor="rgba(88, 28, 135, 0.4)" />
              <stop offset="100%" stopColor="rgba(17, 24, 39, 0.2)" />
            </radialGradient>
            
            <radialGradient id="silk-gradient-2" cx="0.7" cy="0.8" r="0.5">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.7)" />
              <stop offset="40%" stopColor="rgba(147, 51, 234, 0.5)" />
              <stop offset="80%" stopColor="rgba(79, 70, 229, 0.3)" />
              <stop offset="100%" stopColor="rgba(17, 24, 39, 0.1)" />
            </radialGradient>
            
            <radialGradient id="silk-gradient-3" cx="0.1" cy="0.6" r="0.7">
              <stop offset="0%" stopColor="rgba(126, 34, 206, 0.6)" />
              <stop offset="50%" stopColor="rgba(88, 28, 135, 0.4)" />
              <stop offset="100%" stopColor="rgba(30, 41, 59, 0.2)" />
            </radialGradient>
            
            <radialGradient id="silk-gradient-4" cx="0.9" cy="0.1" r="0.4">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.5)" />
              <stop offset="60%" stopColor="rgba(67, 56, 202, 0.3)" />
              <stop offset="100%" stopColor="rgba(17, 24, 39, 0.1)" />
            </radialGradient>
            
            {/* Silk Blur Filter */}
            <filter id="silk-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="60" />
            </filter>
            
            {/* Silk Texture Filter */}
            <filter id="silk-texture" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="80" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.2 0"/>
            </filter>
          </defs>
          
          {/* Large Silk Waves */}
          <g filter="url(#silk-texture)">
            <ellipse
              cx="300"
              cy="200"
              rx="400"
              ry="200"
              fill="url(#silk-gradient-1)"
              opacity="0.9"
              transform="rotate(-15 300 200)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-15 300 200; -10 300 200; -15 300 200"
                dur="25s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            <ellipse
              cx="700"
              cy="800"
              rx="350"
              ry="180"
              fill="url(#silk-gradient-2)"
              opacity="0.8"
              transform="rotate(20 700 800)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="20 700 800; 25 700 800; 20 700 800"
                dur="30s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            <ellipse
              cx="100"
              cy="600"
              rx="300"
              ry="150"
              fill="url(#silk-gradient-3)"
              opacity="0.7"
              transform="rotate(-30 100 600)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-30 100 600; -25 100 600; -30 100 600"
                dur="35s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            <ellipse
              cx="900"
              cy="100"
              rx="250"
              ry="120"
              fill="url(#silk-gradient-4)"
              opacity="0.6"
              transform="rotate(45 900 100)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="45 900 100; 50 900 100; 45 900 100"
                dur="20s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
          
          {/* Additional Silk Layers */}
          <g filter="url(#silk-blur)">
            <ellipse
              cx="500"
              cy="400"
              rx="200"
              ry="100"
              fill="url(#silk-gradient-1)"
              opacity="0.4"
              transform="rotate(10 500 400)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="10 500 400; 15 500 400; 10 500 400"
                dur="40s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            <ellipse
              cx="200"
              cy="300"
              rx="180"
              ry="90"
              fill="url(#silk-gradient-2)"
              opacity="0.3"
              transform="rotate(-20 200 300)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-20 200 300; -15 200 300; -20 200 300"
                dur="45s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        </svg>
      </div>
      
      {/* Dark Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}