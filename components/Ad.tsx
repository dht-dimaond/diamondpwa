import { useState, useEffect } from 'react'

interface TimedAdProps {
  children?: React.ReactNode
  duration?: number 
}

const TimedAd = ({ children, duration = 10000 }: TimedAdProps) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
      <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <button 
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-gray-200"
        >
          ✕
        </button>
        <div className="pr-6">
          {children || "Advertisement content here"}
        </div>
      </div>
    </div>
  )
}

export default TimedAd