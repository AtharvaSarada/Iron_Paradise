import React from 'react';

interface SilkBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function SilkBackground({ children, className = '' }: SilkBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Simple Dark Background with CSS Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Simplified Silk Effect with CSS */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute top-1/4 left-1/4 w-96 h-48 bg-purple-600/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-40 bg-blue-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-72 h-36 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}