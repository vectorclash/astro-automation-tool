import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initAnimation(config) {
  const {
    containerId,
    sizeId,
    width,
    height
  } = config;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  gsap.registerPlugin(SplitText);

  // Get all animated elements
  const eyebrow = container.querySelector('.eyebrow');
  const headline = container.querySelector('.headline');
  const subhead = container.querySelector('.subhead');
  const cta = container.querySelector('.cta-button');

  // Create GSAP timeline
  const tl = gsap.timeline({
    paused: true
  });

  tl.set(".banner-container", { visibility: 'visible' });

  // Animate eyebrow
  if (eyebrow) {
    let eyebrowSplit = SplitText.create(eyebrow, { type: "lines" });

    tl.from(eyebrowSplit.lines, {
      x: -width,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1
    });
  }

  // Animate headline
  if (headline) {
    let headlineSplit = SplitText.create(headline, { type: "lines" });

    tl.from(headlineSplit.lines, {
      x: -width,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1
    });
  }

  if (subhead) {
    let subheadSplit = SplitText.create(subhead, { type: "lines" });

    tl.from(subheadSplit.lines, {
      x: -width,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1
    });
  }

  // Animate CTA button
  if (cta) {
    tl.from(cta, {
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out'
    });
  }

  // Start animation when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => tl.play(), 100);
    });
  } else {
    setTimeout(() => tl.play(), 100);
  }

  return tl;
}