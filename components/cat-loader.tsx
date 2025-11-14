"use client"

export function CatLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 animate-spin">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="70 200"
              className="text-cyan-500"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🐱</div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Washing your laundry...</p>
    </div>
  )
}
