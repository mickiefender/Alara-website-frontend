"use client"

import Image from "next/image"
import { useAuthContext } from "@/lib/auth-context"
import { resolveImageUrl } from "@/lib/api"

interface ProfileAvatarProps {
  src?: string | null
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  schoolLogo?: string | null
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
}

const sizeClassesImage = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function ProfileAvatar({ src, alt, size = "md", className = "", schoolLogo }: ProfileAvatarProps) {
  const { school } = useAuthContext()
  
  // Use provided schoolLogo or get from auth context
  const logoUrl = schoolLogo || school?.logo_url || school?.logo_url_computed
  
  const resolvedSrc = resolveImageUrl(src)
  const resolvedLogoUrl = resolveImageUrl(logoUrl)
  const hasImage = resolvedSrc.length > 0
  
  // Get initials from alt text (name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return (parts[0]?.[0] || "?").toUpperCase()
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        relative rounded-full overflow-hidden flex-shrink-0
        ${hasImage ? "bg-transparent" : "bg-gradient-to-br from-purple-400 to-blue-500"}
        ${className}
      `}
    >
      {hasImage ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          width={sizeClassesImage[size]}
          height={sizeClassesImage[size]}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : resolvedLogoUrl ? (
        <Image
          src={resolvedLogoUrl}
          alt={alt}
          width={sizeClassesImage[size]}
          height={sizeClassesImage[size]}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-medium">
          {getInitials(alt)}
        </div>
      )}
    </div>
  )
}

