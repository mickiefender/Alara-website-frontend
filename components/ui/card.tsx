import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card/60 supports-[backdrop-filter]:bg-card/50 backdrop-blur-xl text-card-foreground flex flex-col gap-6 rounded-2xl border border-white/45 dark:border-white/10 py-6',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_1px_1px_rgba(20,20,20,0.03),0_8px_24px_-12px_rgba(20,20,20,0.18)]',
        'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_1px_1px_rgba(0,0,0,0.2),0_12px_32px_-12px_rgba(0,0,0,0.55)]',
        'transition-[box-shadow,border-color,transform] duration-300 ease-out',
        'hover:border-white/60 dark:hover:border-white/15 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_4px_rgba(20,20,20,0.04),0_16px_40px_-12px_rgba(20,20,20,0.24)]',
        'dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),0_2px_4px_rgba(0,0,0,0.25),0_20px_48px_-12px_rgba(0,0,0,0.65)]',
        'animate-glass-in',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
