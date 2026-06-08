import React, { useEffect, useState } from 'react';

export const AnimatedNumber = ({ value, suffix = '', decimals = 0, duration = 900 }) => {
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = 0;
    const to = numeric;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(from + (to - from) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <span className="dash-kpi-value">
      {formatted}
      {suffix}
    </span>
  );
};
