"use client"

import React from 'react'
import { CircularLoader, FullScreenLoader } from '@/components/circular-loader'

interface LoadingWrapperProps {
  isLoading: boolean
  children: React.ReactNode
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  isLoading, 
  children 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary/10 to-secondary/5">
        <FullScreenLoader />
      </div>
    )
  }

  return <>{children}</>
}

export default LoadingWrapper

