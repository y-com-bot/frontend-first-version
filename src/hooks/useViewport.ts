import { useEffect } from 'react';

export function useViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    let largestHeight = window.innerHeight;
    let previousWidth = window.innerWidth;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The app occupies the visible viewport, including when an OS keyboard reduces it.
        const height = viewport?.height ?? window.innerHeight;
        const offset = viewport?.offsetTop ?? 0;
        if (previousWidth !== window.innerWidth) {
          largestHeight = window.innerHeight;
          previousWidth = window.innerWidth;
        }
        largestHeight = Math.max(largestHeight, window.innerHeight, height);
        const editing =
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLInputElement;
        document.documentElement.classList.toggle(
          'keyboard-open',
          window.innerWidth <= 600 &&
            editing &&
            largestHeight - height > 120 &&
            (viewport?.scale ?? 1) === 1,
        );
        document.documentElement.style.setProperty('--viewport-height', `${height}px`);
        document.documentElement.style.setProperty('--viewport-offset', `${offset}px`);
      });
    }
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      document.documentElement.classList.remove('keyboard-open');
    };
  }, []);
}
