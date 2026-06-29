import React from 'react';

const Logo28 = ({ size = 32, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="grad28" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1f95c8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#81cd29', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect 
      x="0" 
      y="0" 
      width="100" 
      height="100" 
      rx="28" 
      fill="url(#grad28)" 
    />
    <text 
      x="50" 
      y="54" 
      fontFamily="'Arial Black', 'Inter', system-ui, sans-serif" 
      fontWeight="900" 
      fontSize="52" 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="middle"
      letterSpacing="-1"
    >
      28
    </text>
  </svg>
);

export default Logo28;
