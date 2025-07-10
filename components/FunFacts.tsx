import { motion, AnimatePresence } from 'framer-motion'
import { X, Book, Plane, Cookie, Music, Film, Coffee, Gamepad2, Clock, Footprints, Car, Utensils } from 'lucide-react'
import { useMemo, memo } from 'react'

interface FunFactsProps {
  isOpen: boolean
  onClose: () => void
  totalMinutes: number
  isVisible?: boolean
}

interface FunFact {
  icon: React.ReactNode
  title: string
  number: string
  description: string
  calculation: string
  color: string
}

export const FunFacts = memo(function FunFacts({ isOpen, onClose, totalMinutes, isVisible = true }: FunFactsProps) {
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const funFacts = useMemo((): FunFact[] => {
    return [
      {
        icon: <Book className="w-5 h-5" />,
        title: "Books you could have read",
        number: Math.floor(totalHours / 10).toLocaleString(),
        description: "",
        calculation: "~10 hours per book",
        color: "text-blue-400"
      },
      {
        icon: <Plane className="w-5 h-5" />,
        title: "Flights across the US",
        number: Math.floor(totalHours / 12).toLocaleString(),
        description: "",
        calculation: "~12 hours per round-trip",
        color: "text-cyan-400"
      },
      {
        icon: <Cookie className="w-5 h-5" />,
        title: "Batches of cookies baked",
        number: Math.floor(totalMinutes / 30).toLocaleString(),
        description: "",
        calculation: "~30 minutes per batch",
        color: "text-amber-400"
      },
      {
        icon: <Music className="w-5 h-5" />,
        title: "Songs you could have heard",
        number: Math.floor(totalMinutes / 3.5).toLocaleString(),
        description: "",
        calculation: "~3.5 minutes per song",
        color: "text-green-400"
      },
      {
        icon: <Film className="w-5 h-5" />,
        title: "Movies you could have seen",
        number: Math.floor(totalMinutes / 120).toLocaleString(),
        description: "",
        calculation: "~2 hours per movie",
        color: "text-purple-400"
      },
      {
        icon: <Coffee className="w-5 h-5" />,
        title: "Cups of coffee brewed",
        number: Math.floor(totalMinutes / 5).toLocaleString(),
        description: "",
        calculation: "~5 minutes per cup",
        color: "text-orange-400"
      },
      {
        icon: <Footprints className="w-5 h-5" />,
        title: "Marathons you could have run",
        number: Math.floor(totalHours / 4).toLocaleString(),
        description: "",
        calculation: "~4 hours per marathon",
        color: "text-red-400"
      },
      {
        icon: <Car className="w-5 h-5" />,
        title: "Road trips across the country",
        number: Math.floor(totalHours / 45).toLocaleString(),
        description: "",
        calculation: "~45 hours of driving",
        color: "text-indigo-400"
      },
      {
        icon: <Utensils className="w-5 h-5" />,
        title: "Elaborate meals prepared",
        number: Math.floor(totalMinutes / 45).toLocaleString(),
        description: "",
        calculation: "~45 minutes per meal",
        color: "text-pink-400"
      },
      {
        icon: <Clock className="w-5 h-5" />,
        title: "Months of sleep",
        number: Math.floor(totalDays / 3).toLocaleString(),
        description: "",
        calculation: "~8 hours per night",
        color: "text-slate-400"
      }
    ]
  }, [totalMinutes, totalHours, totalDays])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="crypto-card w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {isVisible ? 'Visible' : 'Total'} Playtime Fun Facts
                  </h2>
                  <p className="text-muted-foreground">
                    {totalHours.toLocaleString()} hours ({totalDays.toLocaleString()} days) of gaming
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted/20 rounded-lg transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {funFacts.map((fact, index) => (
                  <div
                    key={index}
                    className="crypto-card group p-4 fun-fact-card"
                    style={{ 
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-background/50 ${fact.color}`}>
                        {fact.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-3xl font-bold mb-2 ${fact.color}`}>
                          {fact.number}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {fact.title}
                        </h3>
                        {fact.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {fact.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/80 italic">
                          {fact.calculation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20"
              >
                <h3 className="font-semibold text-primary mb-2">Time Perspective</h3>
                <p className="text-sm text-muted-foreground">
                  Your gaming time represents a significant investment in entertainment and skill development. 
                  That's approximately <strong>{Math.floor(totalDays / 30)} months</strong> of continuous gaming!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
})