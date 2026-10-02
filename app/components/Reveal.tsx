'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getRevealTransition, revealAnimate, revealInitial, revealViewport } from './reveal-config';

const scheduleFallbackTask = (callback: () => void) => {
  if (typeof window.requestAnimationFrame === 'function') {
    const frame = window.requestAnimationFrame(callback);
    return () => {
      if (typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(frame);
    };
  }

  const timeout = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timeout);
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
};

export default function Reveal({ children, className, delay = 0, amount = revealViewport.amount }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  const [visible, setVisible] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !revealRef.current) return;

    const revealNow = () => {
      if (visibleRef.current) return;
      visibleRef.current = true;
      setVisible(true);
    };

    if (reducedMotion) {
      revealNow();
      return;
    }

    if (typeof window.IntersectionObserver === 'function') {
      const observer = new window.IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealNow();
          observer.disconnect();
        }
      }, { threshold: amount, rootMargin: revealViewport.margin });
      observer.observe(revealRef.current);
      return () => observer.disconnect();
    }

    setFallback(true);

    const revealWhenVisible = () => {
      if (visibleRef.current || !revealRef.current) return;
      const { top, bottom } = revealRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (top < viewportHeight * 0.92 && bottom > viewportHeight * 0.08) {
        revealNow();
      }
    };

    if (typeof window.addEventListener !== 'function') {
      return scheduleFallbackTask(revealNow);
    }

    const cancelInitialCheck = scheduleFallbackTask(revealWhenVisible);
    window.addEventListener('scroll', revealWhenVisible, { passive: true });
    window.addEventListener('resize', revealWhenVisible);
    return () => {
      cancelInitialCheck();
      window.removeEventListener('scroll', revealWhenVisible);
      window.removeEventListener('resize', revealWhenVisible);
    };
  }, [amount, reducedMotion]);

  const fallbackClasses = fallback && !reducedMotion ? ['reveal-fallback-ready', visible && 'reveal-fallback-visible'] : [];
  const revealClassName = [className, ...fallbackClasses].filter(Boolean).join(' ');

  return (
    <motion.div
      ref={revealRef}
      className={revealClassName}
      data-reveal-state={visible ? 'visible' : 'hidden'}
      initial={reducedMotion ? false : revealInitial}
      animate={reducedMotion || visible ? revealAnimate : revealInitial}
      transition={reducedMotion ? undefined : getRevealTransition(delay)}
    >
      {children}
    </motion.div>
  );
}
