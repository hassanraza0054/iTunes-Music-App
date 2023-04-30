import { useRef } from "react";

export const useDebounce = (timeout: number = 500) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const debounce = (functionToCall: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      functionToCall();
    }, timeout);
  };

  return debounce;
};
