import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'apologetic' | 'thinking';
}

export const Mascot: React.FC<MascotProps> = ({ className = '', size = 56, mood = 'happy' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        {/* Soft Shadow */}
        <ellipse cx="50" cy="88" rx="32" ry="7" fill="#000000" fillOpacity="0.08" />

        {/* Mascot Body - Coral Red rounded blob */}
        <path
          d="M50 10C28 10 16 30 16 56C16 76 30 86 50 86C70 86 84 76 84 56C84 30 72 10 50 10Z"
          fill="url(#mascotGradient)"
        />

        {/* Subtle Top Highlight */}
        <ellipse cx="44" cy="24" rx="14" ry="7" fill="#ffffff" fillOpacity="0.22" transform="rotate(-15 44 24)" />

        {mood === 'apologetic' ? (
          <>
            {/* Sad Eyebrows slanted inward/upward */}
            <path d="M30 36C34 38 38 41 42 41" stroke="#7f1d1d" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M70 36C66 38 62 41 58 41" stroke="#7f1d1d" strokeWidth="2.2" strokeLinecap="round" />

            {/* Droopy/Gentle Eyes */}
            <ellipse cx="38" cy="48" rx="8" ry="7.5" fill="#ffffff" />
            <ellipse cx="38" cy="49" rx="4.5" ry="4.5" fill="#1c1917" />
            <circle cx="36" cy="47" r="1.6" fill="#ffffff" />

            <ellipse cx="62" cy="48" rx="8" ry="7.5" fill="#ffffff" />
            <ellipse cx="62" cy="49" rx="4.5" ry="4.5" fill="#1c1917" />
            <circle cx="60" cy="47" r="1.6" fill="#ffffff" />

            {/* Apologetic sweat / tear drop */}
            <path
              d="M74 38C75.5 35 77 34 78 35.5C79 37 78.5 40 76.5 41C74.5 42 73 40 74 38Z"
              fill="#60a5fa"
              fillOpacity="0.9"
            />

            {/* Apologetic / Troubled Mouth */}
            <path
              d="M45 61C48 58 52 58 55 61"
              stroke="#7f1d1d"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Left Eye */}
            <ellipse cx="38" cy="46" rx="8.5" ry="9" fill="#ffffff" />
            <ellipse cx="39" cy="46" rx="4.5" ry="5" fill="#1c1917" />
            <circle cx="41" cy="43.5" r="1.8" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="62" cy="46" rx="8.5" ry="9" fill="#ffffff" />
            <ellipse cx="63" cy="46" rx="4.5" ry="5" fill="#1c1917" />
            <circle cx="65" cy="43.5" r="1.8" fill="#ffffff" />

            {/* Cute Tiny Smile */}
            <path
              d="M46 56C48 58 52 58 54 56"
              stroke="#7f1d1d"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="28" cy="56" rx="4.5" ry="2.5" fill="#f43f5e" fillOpacity="0.35" />
        <ellipse cx="72" cy="56" rx="4.5" ry="2.5" fill="#f43f5e" fillOpacity="0.35" />

        <defs>
          <linearGradient id="mascotGradient" x1="20" y1="12" x2="80" y2="86" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff6554" />
            <stop offset="0.6" stopColor="#ff5240" />
            <stop offset="1" stopColor="#f03e2c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
