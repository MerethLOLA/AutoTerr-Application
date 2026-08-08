'use client';

import { useEffect } from 'react';

/**
 * Anime en fondu/translation les éléments `.reveal`, `.reveal-left`, `.reveal-scale` au scroll.
 * Passer `deps` (ex: [voitures.length]) pour réobserver après un rendu de contenu chargé de façon
 * asynchrone (le scan initial ne voit pas les éléments qui n'existent pas encore au montage).
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll<Element>('.reveal, .reveal-left, .reveal-scale');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
