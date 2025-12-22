"use client"

export default function GoldLine({ className = "", variant = "horizontal" }: { className?: string; variant?: "horizontal" | "vertical" }) {
  const uniqueId = `gold-line-${Math.random().toString(36).substr(2, 9)}`
  
  if (variant === "vertical") {
    return (
      <div className={`relative h-full w-1 overflow-hidden ${className}`}>
        <svg
          className="w-1 h-full"
          viewBox="0 0 4 1200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`goldGradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a98736" stopOpacity="0.5" />
              <stop offset="25%" stopColor="#a98736" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#e4ca6b" stopOpacity="1" />
              <stop offset="75%" stopColor="#a98736" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a98736" stopOpacity="0.5" />
            </linearGradient>
            <filter id={`glow-${uniqueId}`}>
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 2,0 Q 0,150 2,300 T 2,600 T 2,900 T 2,1200"
            stroke={`url(#goldGradient-${uniqueId})`}
            strokeWidth="2"
            fill="none"
            filter={`url(#glow-${uniqueId})`}
            className="animate-pulse"
          />
        </svg>
      </div>
    )
  }
  
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg
        className="w-full h-1"
        viewBox="0 0 1200 4"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`goldGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a98736" stopOpacity="0.5" />
            <stop offset="25%" stopColor="#a98736" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#e4ca6b" stopOpacity="1" />
            <stop offset="75%" stopColor="#a98736" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a98736" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`shimmer-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a98736" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#e4ca6b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a98736" stopOpacity="0.3" />
          </linearGradient>
          <filter id={`glow-${uniqueId}`}>
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Main flowing path - creates a gentle snake/wave pattern */}
        <path
          d="M 0,2 Q 150,0 300,2 T 600,2 T 900,2 T 1200,2"
          stroke={`url(#goldGradient-${uniqueId})`}
          strokeWidth="2"
          fill="none"
          filter={`url(#glow-${uniqueId})`}
        />
        
        {/* Shimmer overlay with animation */}
        <path
          d="M 0,2 Q 150,0 300,2 T 600,2 T 900,2 T 1200,2"
          stroke={`url(#shimmer-${uniqueId})`}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-1200,0; 1200,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  )
}

