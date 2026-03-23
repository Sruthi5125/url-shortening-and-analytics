import { useState, useEffect } from 'react';

export const useTypewriter = (phrases, typingSpeed = 150, deletingSpeed = 50, pauseDuration = 2000) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timer;
    const currentPhrase = phrases[loopNum % phrases.length];
    
    const tick = () => {
      setText(prev => {
        if (isDeleting) {
          return currentPhrase.substring(0, prev.length - 1);
        }
        return currentPhrase.substring(0, prev.length + 1);
      });
    };

    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setLoopNum(prev => prev + 1);
        timer = setTimeout(tick, typingSpeed);
      } else {
        timer = setTimeout(tick, deletingSpeed);
      }
    } else {
      if (text === currentPhrase) {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else {
        timer = setTimeout(tick, typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
};
