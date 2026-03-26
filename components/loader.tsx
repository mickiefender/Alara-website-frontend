'use client'

import React, { useState, useEffect } from 'react'

const Loader = ({ size = 'md', color = '#3b82f6' }) => {
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
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover rounded-2xl shadow-2xl ring-2 ring-white/50"
          style={{ borderColor: color }}
          src="/loader.mp4"
          poster="/placeholder.svg"
        >
          <source src="/loader.mp4" type="video/mp4" />
          Loading...
        </video>
      </div>
    </div>
  )
}

export default Loader
