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
        console.log('All images loaded, starting animation');
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
  const copy = container.querySelectorAll('p');
  const cta = container.querySelector('.cta-button');

  const globalStagger = 0.1;

  // Create GSAP timeline
  const tl = gsap.timeline({
    paused: true
  });

  tl.set(".banner-container", { visibility: 'visible' });

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

  // Start animation when ready and all images are loaded
  const startAnimation = async () => {
    await preloadImages(container);
    setTimeout(() => tl.play(), 100);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAnimation);
  } else {
    startAnimation();
  }

  return tl;
}