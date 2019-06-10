import { useEffect, useState, useRef } from "react";

// Courtesy of Dan Abramov
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export function useDebounce(value, interval) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useInterval(() => {
    setDebouncedValue(value);
  }, interval);

  return debouncedValue;
}

export function useRAFThrottle(value) {
  const [throttledValue, setThrottledValue] = useState(value);
  const animationFrameId = useRef(0);

  useEffect(() => {
    // This is safe on first call with animationFrameId.current = 0, as RAF callback ids are nonzero
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() =>
      setThrottledValue(value)
    );
  }, [value]);

  return throttledValue;
}

export function useRAFThrottledState(initialValue) {
  const [throttledState, setThrottledState] = useState(initialValue);
  const animationFrameId = useRef(0);

  const throttledSetter = newState => {
    // This is safe on first call with animationFrameId.current = 0, as RAF callback ids are nonzero
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() =>
      setThrottledState(newState)
    );
  };

  return [throttledState, throttledSetter];
}
