import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatsCardProps {
  icon: ReactNode
  title: string
  value: string
  subtitle: string
  onClick?: () => void
  showIndicator?: boolean
}

export function StatsCard({ icon, title, value, subtitle, onClick, showIndicator = false }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={`crypto-card group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary group-hover:animate-pulse">
          {icon}
        </div>
        {showIndicator && (
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Border Animation */}
      <div className="absolute inset-0 border border-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
} 