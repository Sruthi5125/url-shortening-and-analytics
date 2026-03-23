import { useState, useEffect } from 'react';

export const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = parseInt(end, 10);
    
    if (isNaN(endValue) || endValue === 0) {
      setCount(endValue || 0);
      return;
    }

    const easeOutQuad = (t) => t * (2 - t);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easedProgress = easeOutQuad(progress);
      
      setCount(Math.floor(easedProgress * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};
