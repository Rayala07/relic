/**
 * landing/hooks/useScrollAnimation.ts
 *
 * Custom React hook for scroll-triggered entrance animations.
 *
 * How it works:
 *  1. You attach the returned `ref` to any HTML element.
 *  2. The hook uses the browser's IntersectionObserver API to detect
 *     when that element becomes visible in the viewport.
 *  3. Once visible, it adds the "is-visible" CSS class, which triggers
 *     the fade-up transition defined in globals.css.
 *  4. The observer disconnects after the element is shown (one-time animation).
 *
 * Usage:
 *   const ref = useScrollAnimation();
 *   <div ref={ref} className="animate-on-scroll">...</div>
 *
 * For staggered children (e.g. a grid of cards), use `useStaggeredAnimation`
 * which applies increasing delays to each child element.
 */

"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollAnimation
 * Returns a ref to attach to the element you want to animate on scroll.
 * The element must have the "animate-on-scroll" class in globals.css.
 *
 * @param threshold - How much of the element must be visible before
 *                    triggering (0.0 = any pixel, 1.0 = fully visible)
 * @param rootMargin - CSS margin around the viewport for early triggering
 *                     (negative values delay until element is further in view)
 */
export function useScrollAnimation(
  threshold = 0.15,
  rootMargin = "0px 0px -50px 0px"
) {
  // We use useRef to get a direct reference to the DOM element
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // IntersectionObserver fires a callback when the observed element
    // enters or exits the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add the class that triggers the CSS transition
            entry.target.classList.add("is-visible");
            // Stop watching — animation only plays once
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    // Cleanup: disconnect the observer when the component unmounts
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

/**
 * useStaggeredAnimation
 * Like useScrollAnimation but applies to a container whose direct children
 * each receive a staggered animation delay.
 *
 * Usage:
 *   const containerRef = useStaggeredAnimation(150); // 150ms between each card
 *   <div ref={containerRef}>
 *     <Card /> <Card /> <Card />
 *   </div>
 *
 * @param staggerMs - Delay in milliseconds between each child's animation
 */
export function useStaggeredAnimation(staggerMs = 100) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Get all direct children of the container
    const children = Array.from(container.children) as HTMLElement[];

    // Apply the animate-on-scroll class and a staggered delay to each child
    children.forEach((child, index) => {
      child.classList.add("animate-on-scroll");
      child.style.transitionDelay = `${index * staggerMs}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Make all children visible once the container enters viewport
            children.forEach((child) => child.classList.add("is-visible"));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [staggerMs]);

  return ref;
}
