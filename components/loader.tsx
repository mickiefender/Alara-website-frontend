'use client'

import React, { useState, useEffect } from 'react'
import { BookOpeningLoader } from './BookOpeningLoader'

const Loader = ({ size = 'md', color = 'var(--school-primary)' }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  const sizeStyles = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  } as Record<string, string>

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className={`relative ${sizeStyles[size] || sizeStyles.md} mx-auto`}>
        <BookOpeningLoader size={size as any} color={color} />
      </div>
    </div>
  )
}

export default Loader
