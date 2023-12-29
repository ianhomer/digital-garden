import { useEffect } from "react";

export default function useKey(
  callback: (key: string) => void,
  keys: string[],
): void {
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
