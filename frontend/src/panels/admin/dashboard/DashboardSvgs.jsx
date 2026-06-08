import React from 'react';

/** Animated supply-chain hero — flowing logistics network */
export const SupplyChainHeroSvg = ({ className = '' }) => (
  <svg
    viewBox="0 0 320 140"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="dashLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6A7051" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#C5A021" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#6A7051" stopOpacity="0.2" />
      </linearGradient>
      <filter id="dashGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Base grid */}
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={`v${i}`}
        x1={40 + i * 60}
        y1="20"
        x2={40 + i * 60}
        y2="120"
        stroke="#C5A021"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
    ))}

    {/* Route paths */}
    <path
      d="M 40 90 Q 100 40 160 70 T 280 50"
      stroke="url(#dashLineGrad)"
      strokeWidth="2"
      className="dash-flow-line"
      fill="none"
    />
    <path
      d="M 40 70 L 120 95 L 200 60 L 280 85"
      stroke="#C5A021"
      strokeWidth="1.5"
      strokeOpacity="0.2"
      strokeDasharray="4 6"
      className="dash-flow-line"
      fill="none"
    />

    {/* Nodes */}
    {[
      [40, 90, '#6A7051'],
      [120, 95, '#C5A021'],
      [200, 60, '#6A7051'],
      [280, 50, '#E8B4C4'],
    ].map(([cx, cy, color], i) => (
      <g key={i} filter="url(#dashGlow)">
        <circle cx={cx} cy={cy} r="10" fill={color} fillOpacity="0.15" />
        <circle cx={cx} cy={cy} r="5" fill={color} className="dash-node-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
        <circle cx={cx} cy={cy} r="2.5" fill="#fff" />
      </g>
    ))}

    {/* Animated truck icon */}
    <g className="dash-truck-move" transform="translate(175, 52)">
      <rect x="0" y="4" width="22" height="12" rx="2" fill="#6A7051" />
      <rect x="22" y="8" width="10" height="8" rx="1" fill="#C5A021" />
      <circle cx="6" cy="18" r="3" fill="#C5A021" />
      <circle cx="26" cy="18" r="3" fill="#C5A021" />
    </g>

    {/* Labels */}
    <text x="40" y="115" fill="#64748b" fontSize="8" fontWeight="700">FARM</text>
    <text x="118" y="115" fill="#64748b" fontSize="8" fontWeight="700">HUB</text>
    <text x="192" y="115" fill="#64748b" fontSize="8" fontWeight="700">FLEET</text>
    <text x="262" y="115" fill="#64748b" fontSize="8" fontWeight="700">BUYER</text>
  </svg>
);

export const KpiHarvestSvg = () => (
  <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden>
    <defs>
      <linearGradient id="leafGrad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#6A7051" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <circle cx="28" cy="28" r="22" fill="#eef1e8" stroke="#6A7051" strokeOpacity="0.15" />
    <path
      d="M28 38 V22 M28 28 Q18 18 14 28 Q18 32 28 28 Q38 18 42 28 Q38 32 28 28"
      stroke="url(#leafGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    >
      <animate attributeName="stroke-dasharray" values="0 80;80 0" dur="2s" repeatCount="indefinite" />
    </path>
    <circle cx="28" cy="38" r="2" fill="#C5A021">
      <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const KpiDispatchSvg = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
    <circle cx="22" cy="22" r="20" fill="#eef1e8" stroke="#6A7051" strokeOpacity="0.15" />
    <g className="dash-scale-swing">
      <line x1="22" y1="12" x2="22" y2="18" stroke="#6A7051" strokeWidth="1.5" />
      <line x1="11" y1="18" x2="33" y2="18" stroke="#6A7051" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 18 L11 28 L17 28 L17 18 Z" fill="#C5A021" />
      <path d="M27 18 L27 26 L33 26 L33 18 Z" fill="#6A7051" fillOpacity="0.85" />
    </g>
    <ellipse cx="22" cy="32" rx="10" ry="2.5" fill="#6A7051" fillOpacity="0.12" />
  </svg>
);

export const KpiFleetSvg = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
    <circle cx="22" cy="22" r="20" fill="#eef1e8" stroke="#6A7051" strokeOpacity="0.15" />
    <line x1="6" y1="30" x2="38" y2="30" stroke="#C5A021" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6" y1="30" x2="38" y2="30" stroke="#6A7051" strokeWidth="1.5" strokeDasharray="5 6" className="dash-flow-line" />
    <g className="dash-truck-move">
      <rect x="12" y="20" width="16" height="8" rx="1.5" fill="#6A7051" />
      <rect x="28" y="22" width="6" height="6" rx="1" fill="#C5A021" />
      <circle cx="16" cy="30" r="2.5" fill="#6A7051" />
      <circle cx="30" cy="30" r="2.5" fill="#6A7051" />
    </g>
  </svg>
);

export const KpiAuditSvg = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
    <circle cx="22" cy="22" r="20" fill="#eef1e8" stroke="#6A7051" strokeOpacity="0.15" />
    <circle cx="22" cy="22" r="7" fill="none" stroke="#6A7051" strokeWidth="1.5" className="dash-alert-ring" />
    <path d="M22 14 L23.5 18.5 L28 18.5 L24.5 21.5 L26 26 L22 23 L18 26 L19.5 21.5 L16 18.5 L20.5 18.5 Z" fill="#6A7051" fillOpacity="0.85" />
  </svg>
);

export const EmptyChartSvg = () => (
  <svg viewBox="0 0 120 80" width="120" height="80" aria-hidden className="opacity-60">
    <rect x="10" y="50" width="12" height="20" rx="2" fill="#6A7051" fillOpacity="0.2">
      <animate attributeName="height" values="8;20;12;20" dur="2s" repeatCount="indefinite" />
      <animate attributeName="y" values="62;50;58;50" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="30" y="40" width="12" height="30" rx="2" fill="#C5A021" fillOpacity="0.55">
      <animate attributeName="height" values="15;30;22;30" dur="2.2s" repeatCount="indefinite" />
      <animate attributeName="y" values="55;40;48;40" dur="2.2s" repeatCount="indefinite" />
    </rect>
    <rect x="50" y="35" width="12" height="35" rx="2" fill="#6A7051" fillOpacity="0.3">
      <animate attributeName="height" values="20;35;28;35" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="y" values="55;35;42;35" dur="1.8s" repeatCount="indefinite" />
    </rect>
    <rect x="70" y="45" width="12" height="25" rx="2" fill="#C5A021" fillOpacity="0.4">
      <animate attributeName="height" values="10;25;18;25" dur="2.4s" repeatCount="indefinite" />
      <animate attributeName="y" values="60;45;52;45" dur="2.4s" repeatCount="indefinite" />
    </rect>
    <polyline points="10,55 40,35 70,42 100,25" fill="none" stroke="#6A7051" strokeWidth="2" strokeLinecap="round" strokeDasharray="120" strokeDashoffset="120">
      <animate attributeName="stroke-dashoffset" values="120;0;120" dur="3s" repeatCount="indefinite" />
    </polyline>
  </svg>
);
