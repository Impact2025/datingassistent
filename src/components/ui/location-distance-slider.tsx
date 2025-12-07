"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/providers/user-provider";
import { MapPin } from "lucide-react";

interface LocationDistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showLocation?: boolean;
}

export function LocationDistanceSlider({
  value,
  onChange,
  min = 1,
  max = 50,
  step = 1,
  showLocation = true
}: LocationDistanceSliderProps) {
  const { userProfile } = useUser();
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentage for styling
  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pre-fill with user's location if available
  useEffect(() => {
    if (showLocation && userProfile?.location && value === 25) {
      // Keep default value if user has location
    }
  }, [userProfile, showLocation, value]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium">Maximale afstand</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-pink-600">{value} km</span>
          {showLocation && userProfile?.location && (
            <div className="text-xs text-muted-foreground">
              vanaf {userProfile.location}
            </div>
          )}
        </div>
      </div>

      {/* Custom Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />

        {/* Custom styling overlay */}
        <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg pointer-events-none"
             style={{ width: `${percentage}%` }}>
        </div>

        {/* Thumb indicator */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-pink-500 rounded-full shadow-lg transition-transform duration-150 ${
            isDragging ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `calc(${percentage}% - 12px)`,
            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
          }}
        >
          <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20"></div>
        </div>
      </div>

      {/* Distance indicators */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} km</span>
        <span className="text-center">Lokaal</span>
        <span className="text-center">Regionaal</span>
        <span className="text-center">Landelijk</span>
        <span>{max} km</span>
      </div>

      {/* Distance context */}
      <div className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-2">
        {value <= 5 && "🍽️ Perfect voor lokale restaurants en cafés"}
        {value > 5 && value <= 15 && "🏙️ Ideaal voor stedentripjes en culturele uitjes"}
        {value > 15 && value <= 30 && "🌳 Goed voor dagtrips en outdoor activiteiten"}
        {value > 30 && "✈️ Perfect voor speciale gelegenheden en verre bestemmingen"}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 0;
          width: 0;
        }

        .slider::-moz-range-thumb {
          height: 0;
          width: 0;
          border: none;
        }
      `}</style>
    </div>
  );
}