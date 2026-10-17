import { useState, useRef, useCallback } from 'react';

const CHARS = 'ABCDEF0123456789✦_—$#*';

export function useScramble(text) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef(null);

  const trigger = useCallback(() => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (letter === ' ') return ' ';
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 2;
    }, 28);
  }, [text]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setDisplayText(text);
  }, [text]);

  return { displayText, trigger, reset };
}
