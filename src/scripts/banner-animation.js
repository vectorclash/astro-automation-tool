import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/**
 * Initialize and play banner animation
 * Should be called only after all assets (DOM, fonts, images) are loaded
 */
export async function initAnimation(config) {
  const {
    containerId,
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
  const copy = container.querySelectorAll('p');
  const cta = container.querySelector('.cta-button');

  const globalStagger = 0.1;

  // Create GSAP timeline
  const tl = gsap.timeline({
    paused: true
  });

  tl.set(".banner-container", { visibility: 'visible' });

  // Now safe to split text - fonts are fully rendered
  let copySplit = new SplitText(copy, "lines");

  tl.from(copySplit.lines, {
    x: -width,
    duration: 0.5,
    ease: 'power3.out',
    stagger: globalStagger
  });

  tl.from(cta, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out'
  });

  // Play animation with small delay for stability
  console.log('Starting animation');
  setTimeout(() => tl.play(), 100);

  return tl;
}