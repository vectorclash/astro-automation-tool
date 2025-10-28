/**
 * Split text into lines for animation
 * This is a simple alternative to SplitText plugin
 */
function splitTextIntoLines(element) {
  const text = element.textContent;
  const words = text.trim().split(' ');
  element.innerHTML = '';

  let line = document.createElement('div');
  line.style.overflow = 'hidden';
  element.appendChild(line);

  const lines = [line];
  let currentLineHeight = 0;

  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    line.appendChild(span);

    // Add space as text node (not in span) to preserve natural spacing
    if (index < words.length - 1) {
      line.appendChild(document.createTextNode(' '));
    }

    // Check if we need a new line
    const rect = element.getBoundingClientRect();
    if (rect.height > currentLineHeight && currentLineHeight > 0) {
      // Remove last word (and the space before it if it exists)
      if (line.lastChild && line.lastChild.nodeType === 3) {
        line.removeChild(line.lastChild); // Remove space text node
      }
      line.removeChild(span);

      // Start new line with the word
      line = document.createElement('div');
      line.style.overflow = 'hidden';
      line.appendChild(span);
      element.appendChild(line);
      lines.push(line);

      // Add space after word on new line (if not last word)
      if (index < words.length - 1) {
        line.appendChild(document.createTextNode(' '));
      }
    }
    currentLineHeight = rect.height;
  });

  return lines;
}

/**
 * Initialize GSAP-based banner animation
 */
function initGSAPBannerAnimation(config) {
  const {
    containerId,
    animation,
    sizeId,
    width,
    height
  } = config;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Determine if this is a horizontal (wide) or vertical (tall) banner
  const isHorizontal = width > height;

  // Animation direction based on orientation
  const animationDirection = isHorizontal ? 'up' : 'left';

  // Get all animated elements
  const eyebrow = container.querySelector('.eyebrow');
  const headline = container.querySelector('.headline');
  const subhead = container.querySelector('.subhead');
  const cta = container.querySelector('.cta-button');

  // Split text elements into lines
  const headlineLines = headline ? splitTextIntoLines(headline) : [];
  const subheadLines = subhead ? splitTextIntoLines(subhead) : [];

  // Create GSAP timeline
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      if (animation.loop) {
        setTimeout(() => {
          tl.restart();
        }, 1000); // Wait 1 second before looping
      }
    }
  });

  // Set initial states for elements that won't be split
  if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
  if (cta) gsap.set(cta, { opacity: 0 });

  // Set initial visibility for headline and subhead parent elements
  if (headline) gsap.set(headline, { opacity: 1 });
  if (subhead) gsap.set(subhead, { opacity: 1 });

  // Animate eyebrow (simple fade)
  if (eyebrow) {
    tl.to(eyebrow, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, 0);
  }

  // Animate headline lines
  if (headlineLines.length > 0) {
    headlineLines.forEach((line, index) => {
      // Wrap content in another div for the sliding effect
      const wrapper = document.createElement('div');
      wrapper.style.display = 'block';

      while (line.firstChild) {
        wrapper.appendChild(line.firstChild);
      }
      line.appendChild(wrapper);

      const startDelay = eyebrow ? 0.3 : 0;
      const staggerDelay = index * 0.15;

      if (animationDirection === 'up') {
        gsap.set(wrapper, { y: 30, opacity: 0 });
        tl.to(wrapper, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out'
        }, startDelay + staggerDelay);
      } else {
        gsap.set(wrapper, { x: -30, opacity: 0 });
        tl.to(wrapper, {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out'
        }, startDelay + staggerDelay);
      }
    });
  }

  // Animate subhead lines
  if (subheadLines.length > 0) {
    const subheadStart = eyebrow ? 0.6 : 0.3;

    subheadLines.forEach((line, index) => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'block';

      while (line.firstChild) {
        wrapper.appendChild(line.firstChild);
      }
      line.appendChild(wrapper);

      const staggerDelay = index * 0.12;

      if (animationDirection === 'up') {
        gsap.set(wrapper, { y: 25, opacity: 0 });
        tl.to(wrapper, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        }, subheadStart + staggerDelay + (headlineLines.length * 0.15));
      } else {
        gsap.set(wrapper, { x: -25, opacity: 0 });
        tl.to(wrapper, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        }, subheadStart + staggerDelay + (headlineLines.length * 0.15));
      }
    });
  }

  // Animate CTA button
  if (cta) {
    const ctaStart = 0.9 + (headlineLines.length * 0.15) + (subheadLines.length * 0.12);

    if (animationDirection === 'up') {
      gsap.set(cta, { y: 20, opacity: 0 });
      tl.to(cta, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, ctaStart);
    } else {
      gsap.set(cta, { x: -20, opacity: 0 });
      tl.to(cta, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, ctaStart);
    }
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
