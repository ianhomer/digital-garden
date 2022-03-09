import { useEffect } from "react";

export function useKey(callback: (key) => void, keys: string[]): void {
  const keyHandler = ({ key }: KeyboardEvent) => {
    if (keys.includes(key)) {
      callback(key);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);
}
