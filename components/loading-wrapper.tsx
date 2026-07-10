"use client"

import React from 'react'

interface LoadingWrapperProps {
  isLoading: boolean
  children: React.ReactNode
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  return <>{children}</>
}

export default LoadingWrapper

