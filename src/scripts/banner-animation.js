import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/**
 * Preload all images within a container
 * @param {HTMLElement} container - The container element to search for images
 * @returns {Promise} - Resolves when all images are loaded
 */
function preloadImages(container) {
  return new Promise((resolve) => {
    const images = container.querySelectorAll('img');

    if (images.length === 0) {
      console.log('No images to preload');
      resolve();
      return;
    }

    console.log(`Preloading ${images.length} image(s)...`);
    let loadedCount = 0;
    const totalImages = images.length;

    const imageLoaded = () => {
      loadedCount++;
      console.log(`Image ${loadedCount}/${totalImages} loaded`);
      if (loadedCount === totalImages) {
        console.log('All images loaded');
        resolve();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded); // Still resolve on error to prevent hanging
      }
    });
  });
}

/**
 * Wait for fonts to be fully rendered and measured
 * Ensures accurate text measurements for SplitText
 * @returns {Promise} - Resolves after fonts are rendered
 */
function waitForFontsRendered() {
  return new Promise((resolve) => {
    // Give browser time to render fonts after they're loaded
    // This prevents SplitText measurement issues
    setTimeout(() => {
      console.log('Fonts rendered and ready');
      resolve();
    }, 50);
  });
}

/**
 * Initialize and play banner animation
 * Called only after fonts and images are loaded
 */
export async function initAnimation(config) {
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

  // Wait for fonts to be fully rendered before measuring text
  await waitForFontsRendered();

  // Preload images
  await preloadImages(container);

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