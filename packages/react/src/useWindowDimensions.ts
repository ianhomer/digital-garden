import { useEffect, useState } from "react";

function getWindowDimensions() {
  if (typeof window === "undefined") {
    return { width: 200, height: 200 };
  }
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  let timer: number;

  function handleResize() {
    clearTimeout(timer);
    timer = window.setTimeout(
      () => setWindowDimensions(getWindowDimensions()),
      500
    );
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
