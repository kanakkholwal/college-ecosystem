import { useEffect, useRef, useState } from "react";

export function useParentOverflow<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const parent = ref.current;

    const checkOverflow = () => {
      setIsOverflowing(parent.scrollWidth > parent.clientWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(parent);

    window.addEventListener("resize", checkOverflow);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return { ref, isOverflowing };
}


export function useOverflow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const checkOverflow = () => {
      if (!ref.current) return;
      setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(ref.current);

    window.addEventListener("resize", checkOverflow);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return { ref, isOverflowing };
}
