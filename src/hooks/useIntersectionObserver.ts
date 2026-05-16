import { useEffect, useState, useRef, type RefObject } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  freezeOnceVisible = true,
}: UseIntersectionObserverProps = {}): [RefObject<HTMLDivElement | null>, boolean] {
  const [isIntersecting, setIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIntersecting(isElementIntersecting);

        if (isElementIntersecting && freezeOnceVisible) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, freezeOnceVisible]);

  return [elementRef, isIntersecting];
}
