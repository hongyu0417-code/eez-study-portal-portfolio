export const revealInitial = { opacity: 0, y: 46, scale: 0.965, filter: 'blur(10px)' } as const;
export const revealAnimate = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } as const;
export const revealViewport = { once: true, amount: 0.2, margin: '0px 0px -10% 0px' } as const;

export function getRevealTransition(delay = 0) {
  return { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const };
}
