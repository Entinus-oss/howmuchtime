import React, { useState, useContext, createContext, useEffect } from 'react'
import { motion } from 'framer-motion'

// Define secret colors for each letter - evenly spaced across color spectrum
const LETTER_COLORS = {
  'H': 'hsl(0, 100%, 50%)',     // Red
  'o': 'hsl(32, 100%, 50%)',    // Orange
  'w': 'hsl(64, 100%, 50%)',    // Yellow
  'M': 'hsl(96, 100%, 50%)',    // Lime Green
  'u': 'hsl(128, 100%, 50%)',   // Green
  'c': 'hsl(160, 100%, 50%)',   // Teal
  'h': 'hsl(192, 100%, 50%)',   // Sky Blue
  'T': 'hsl(224, 100%, 50%)',   // Blue
  'i': 'hsl(256, 100%, 50%)',   // Purple
  'm': 'hsl(288, 100%, 50%)',   // Magenta
  'e': 'hsl(320, 100%, 50%)'    // Pink
}

// Convert HSL to CSS custom property format
const hslToCssVar = (hsl: string) => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (match) {
    return `${match[1]} ${match[2]}% ${match[3]}%`
  }
  return '180 100% 50%' // fallback
}

// Theme context
interface ThemeContextType {
  changeTheme: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const changeTheme = (color: string) => {
    const root = document.documentElement
    const cssVarColor = hslToCssVar(color)
    
    // Update all theme colors based on the new primary color
    root.style.setProperty('--primary', cssVarColor)
    root.style.setProperty('--accent', cssVarColor)
    root.style.setProperty('--chart-1', cssVarColor)
    root.style.setProperty('--ring', cssVarColor)
  }

  return (
    <ThemeContext.Provider value={{ changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface InteractiveTitleProps {
  className?: string
}

export const InteractiveTitle: React.FC<InteractiveTitleProps> = ({ className = '' }) => {
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null)
  const { changeTheme } = useTheme()
  
  const title = 'HowMuchTime'
  const letters = title.split('')

  const handleLetterClick = (letter: string) => {
    const color = LETTER_COLORS[letter as keyof typeof LETTER_COLORS]
    if (color) {
      changeTheme(color)
    }
  }

  return (
    <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${className}`}>
      {letters.map((letter, index) => {
        const isHovered = hoveredLetter === `${letter}-${index}`
        const secretColor = LETTER_COLORS[letter as keyof typeof LETTER_COLORS]
        
        return (
          <motion.span
            key={`${letter}-${index}`}
            className="inline-block cursor-pointer"

            onMouseEnter={() => setHoveredLetter(`${letter}-${index}`)}
            onMouseLeave={() => setHoveredLetter(null)}
            onClick={() => handleLetterClick(letter)}
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.05, ease: "easeOut" }
            }}
            whileTap={{ 
              scale: 0.9,
              transition: { duration: 0.05, ease: "easeOut" }
            }}
            animate={{
              opacity: 1,
              y: 0,
              color: isHovered ? secretColor : 'hsl(var(--primary))',
              textShadow: isHovered 
                ? `0 0 20px ${secretColor}, 0 0 40px ${secretColor}` 
                : '0 0 10px currentColor',
            }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              opacity: { duration: 0.5, delay: index * 0.1, ease: "easeOut" },
              y: { duration: 0.5, delay: index * 0.1, ease: "easeOut" },
              color: { duration: 0.05, ease: "easeOut" },
              textShadow: { duration: 0.05, ease: "easeOut" }
            }}
          >
            {letter}
          </motion.span>
        )
      })}
    </h1>
  )
} 