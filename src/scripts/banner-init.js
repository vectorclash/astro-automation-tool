/**
 * Unified banner initialization system
 * Handles preloading of DOM, fonts, and images before starting animation
 */
(function() {
  // Track loading state
  const loadingState = {
    dom: false,
    fonts: false,
    images: false
  };

  // Configuration will be set by the template
  let config = {};

  // Initialize the system with configuration
  window.initBanner = function(bannerConfig) {
    config = bannerConfig;

    // Start loading assets
    loadFonts();
    waitForDOM();
  };

  // Check if everything is ready
  function checkReady() {
    if (loadingState.dom && loadingState.fonts && loadingState.images) {
      console.log('All assets ready, initializing banner');
      startBanner();
    }
  }

  // Preload all images within the banner container
  function preloadImages() {
    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error('Banner container not found');
      loadingState.images = true;
      checkReady();
      return;
    }

    const images = container.querySelectorAll('img');

    if (images.length === 0) {
      console.log('No images to preload');
      loadingState.images = true;
      checkReady();
      return;
    }

    console.log(`Preloading ${images.length} image(s)...`);
    let loadedCount = 0;
    const totalImages = images.length;

    function imageLoaded() {
      loadedCount++;
      console.log(`Image ${loadedCount}/${totalImages} loaded`);
      if (loadedCount === totalImages) {
        console.log('All images loaded');
        loadingState.images = true;
        checkReady();
      }
    }

    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded); // Still resolve on error to prevent hanging
      }
    });
  }

  // Start banner animation and setup click handler
  function startBanner() {
    // Give browser time to render fonts before measuring text
    // This prevents SplitText measurement issues
    setTimeout(() => {
      console.log('Fonts rendered and ready');

      // Initialize animation - all assets are now loaded
      initAnimation({
        containerId: config.containerId,
        width: config.width,
        height: config.height
      });

      // Setup click handler
      const banner = document.getElementById(config.containerId);
      if (banner) {
        banner.style.cursor = 'pointer';
        banner.addEventListener('click', () => {
          if (window.clickTag) {
            window.open(window.clickTag, '_blank');
          }
        });
      }
    }, 50);
  }

  // Load fonts
  function loadFonts() {
    WebFont.load({
      google: {
        families: ['Roboto:300,400,700']
      },
      active: () => {
        console.log('Fonts loaded');
        loadingState.fonts = true;
        checkReady();
      },
      inactive: () => {
        console.log('Fonts failed to load, continuing anyway');
        loadingState.fonts = true;
        checkReady();
      }
    });
  }

  // Wait for DOM
  function waitForDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM ready');
        loadingState.dom = true;
        preloadImages();
      });
    } else {
      console.log('DOM ready');
      loadingState.dom = true;
      preloadImages();
    }
  }
})();
