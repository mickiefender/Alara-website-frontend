'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BookOpeningLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

const sizeClasses = {
  sm: { wrapper: 'w-24 h-20', book: 'w-16 h-24' },
  md: { wrapper: 'w-36 h-28', book: 'w-22 h-32' },
  lg: { wrapper: 'w-48 h-36', book: 'w-28 h-40' },
} as const

export function BookOpeningLoader({ 
  size = 'sm', 
  className = '', 
  fullPage = false 
}: BookOpeningLoaderProps) {
  return (
    <div 
      className={cn(
        fullPage 
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm' 
          : 'relative flex justify-center items-center',
        sizeClasses[size].wrapper,
        className
      )}
      style={{ perspective: '1000px' }}
    >
      {/* Book container */}
      <div 
        className={cn(
          'relative',
          sizeClasses[size].book
        )}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: 'rotateX(10deg)',
        }}
      >
        {/* Back cover */}
        <div 
          className="absolute inset-0 rounded-r-sm"
          style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #4a2c17 100%)',
            transform: 'translateZ(-6px)',
            boxShadow: 'inset 1px 0 3px rgba(0,0,0,0.3)',
          }}
        />

        {/* Pages stack */}
        <div 
          className="absolute rounded-r-sm"
          style={{
            left: '3px',
            top: '2px',
            right: '1px',
            bottom: '2px',
            background: 'linear-gradient(90deg, #f5f0e6 0%, #fffef9 10%, #f8f4eb 100%)',
            transform: 'translateZ(-4px)',
            boxShadow: '1px 0 2px rgba(0,0,0,0.1)',
          }}
        >
          {/* Page lines */}
          <div className="absolute right-1 top-3 bottom-3 w-px opacity-20"
            style={{ background: 'repeating-linear-gradient(to bottom, #999 0px, #999 1px, transparent 1px, transparent 3px)' }}
          />
        </div>

        {/* Spine */}
        <div 
          className="absolute top-0 bottom-0 w-2 left-0"
          style={{
            background: 'linear-gradient(90deg, #4a2c17 0%, #654321 50%, #8B4513 100%)',
            transform: 'rotateY(-90deg) translateX(-4px)',
            transformOrigin: 'left center',
            boxShadow: '0 0 5px rgba(0,0,0,0.5)',
          }}
        />

        {/* Animated flipping pages */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-r-sm page-flip"
            style={{
              left: '4px',
              top: '3px',
              right: '2px',
              bottom: '3px',
              background: 'linear-gradient(90deg, #f0ebe0 0%, #fffef9 20%, #f8f4eb 100%)',
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              animation: `pageFlip 2.4s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              zIndex: 3 - i,
            }}
          >
            {/* Page content lines */}
            <div className="absolute inset-3 flex flex-col gap-1.5 opacity-30">
              {Array.from({ length: 8 }).map((_, j) => (
                <div 
                  key={j} 
                  className="h-0.5 bg-neutral-400 rounded-full"
                  style={{ width: `${60 + Math.random() * 35}%` }}
                />
              ))}
            </div>
            {/* Page back side */}
            <div 
              className="absolute inset-0 rounded-r-sm"
              style={{
                background: 'linear-gradient(270deg, #e8e3d8 0%, #f5f0e6 100%)',
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
        ))}

        {/* Front cover */}
        <div 
          className="absolute inset-0 rounded-r-sm front-cover"
          style={{
            background: 'linear-gradient(135deg, #a0522d 0%, #8B4513 30%, #654321 100%)',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            animation: 'coverOpen 2.4s ease-in-out infinite',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Cover texture */}
          <div 
            className="absolute inset-0 rounded-r-sm opacity-20"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 50%)
              `,
            }}
          />
          {/* Cover border/frame */}
          <div 
            className="absolute rounded-r-sm"
            style={{
              inset: '6px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '2px',
            }}
          />
          {/* Title area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-8 h-1 rounded-full opacity-40"
              style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
            />
          </div>
          {/* Cover back */}
          <div 
            className="absolute inset-0 rounded-r-sm"
            style={{
              background: 'linear-gradient(135deg, #f5f0e6 0%, #e8e3d8 100%)',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          />
        </div>

        {/* Shadow under book */}
        <div 
          className="absolute left-1/2 -bottom-4 w-3/4 h-4 -translate-x-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(4px)',
            animation: 'shadowPulse 2.4s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes coverOpen {
          0%, 100% {
            transform: rotateY(0deg);
          }
          30%, 70% {
            transform: rotateY(-160deg);
          }
        }

        @keyframes pageFlip {
          0%, 15% {
            transform: rotateY(0deg);
          }
          35%, 65% {
            transform: rotateY(-150deg);
          }
          85%, 100% {
            transform: rotateY(0deg);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(-50%) scaleX(1);
          }
          30%, 70% {
            opacity: 0.3;
            transform: translateX(-50%) scaleX(1.3);
          }
        }
      `}</style>
    </div>
  )
}
