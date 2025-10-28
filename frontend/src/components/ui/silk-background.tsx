import React from 'react';

interface SilkBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function SilkBackground({ children, className = '' }: SilkBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Silk Background */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="silk-gradient-1" cx="0.5" cy="0.5" r="0.8">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
            </radialGradient>
            <radialGradient id="silk-gradient-2" cx="0.2" cy="0.8" r="0.6">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </radialGradient>
            <radialGradient id="silk-gradient-3" cx="0.8" cy="0.2" r="0.7">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.2)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
            </radialGradient>
            <filter id="silk-blur">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          
          {/* Animated silk layers */}
          <g filter="url(#silk-blur)">
            <circle
              cx="500"
              cy="300"
              r="200"
              fill="url(#silk-gradient-1)"
              opacity="0.8"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 50,30; 0,0"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle
              cx="200"
              cy="700"
              r="150"
              fill="url(#silk-gradient-2)"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -30,50; 0,0"
                dur="25s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle
              cx="800"
              cy="200"
              r="180"
              fill="url(#silk-gradient-3)"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 40,-20; 0,0"
                dur="30s"
                repeatCount="indefinite"
              />
            </circle>
            
            <ellipse
              cx="600"
              cy="800"
              rx="120"
              ry="80"
              fill="url(#silk-gradient-1)"
              opacity="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -40,20; 0,0"
                dur="18s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        </svg>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-900/30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}