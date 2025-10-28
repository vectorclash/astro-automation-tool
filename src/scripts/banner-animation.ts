import type { BannerAnimation, AnimationStep } from '../types/banner';

export interface BannerAnimationConfig {
  animation: BannerAnimation;
  sizeId: string;
  width: number;
  height: number;
}

export class BannerAnimator {
  private container: HTMLElement;
  private config: BannerAnimationConfig;
  private animationTimeouts: number[] = [];

  constructor(container: HTMLElement, config: BannerAnimationConfig) {
    this.container = container;
    this.config = config;
  }

  /**
   * Start the banner animation sequence
   */
  public start(): void {
    this.reset();
    this.playTimeline();

    if (this.config.animation.loop) {
      this.setupLoop();
    }
  }

  /**
   * Stop all animations and clear timeouts
   */
  public stop(): void {
    this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.animationTimeouts = [];
  }

  /**
   * Reset all elements to initial state
   */
  private reset(): void {
    this.config.animation.timeline.forEach((step: AnimationStep) => {
      const element = this.container.querySelector(`.${step.element}`) as HTMLElement;
      if (element) {
        element.style.opacity = '0';
        element.className = element.className.replace(/\s?(fade-in|fade-in-up|fade-in-down|slide-in-left|slide-in-right|scale)/g, '');
      }
    });
  }

  /**
   * Play through the animation timeline
   */
  private playTimeline(): void {
    this.config.animation.timeline.forEach((step: AnimationStep) => {
      const timeout = window.setTimeout(() => {
        this.animateElement(step);
      }, step.delay);

      this.animationTimeouts.push(timeout);
    });
  }

  /**
   * Animate a single element
   */
  private animateElement(step: AnimationStep): void {
    const element = this.container.querySelector(`.${step.element}`) as HTMLElement;
    if (!element) return;

    // Remove any existing animation classes
    element.className = element.className.replace(/\s?(fade-in|fade-in-up|fade-in-down|slide-in-left|slide-in-right|scale)/g, '');

    // Add the animation class based on effect
    const animationClass = this.getAnimationClass(step.effect);
    element.classList.add(animationClass);

    // Set animation duration
    element.style.animationDuration = `${step.duration}ms`;
  }

  /**
   * Convert effect name to CSS class
   */
  private getAnimationClass(effect: AnimationStep['effect']): string {
    const effectMap: Record<AnimationStep['effect'], string> = {
      'fadeIn': 'fade-in',
      'fadeInUp': 'fade-in-up',
      'fadeInDown': 'fade-in-down',
      'slideInLeft': 'slide-in-left',
      'slideInRight': 'slide-in-right',
      'scale': 'scale'
    };

    return effectMap[effect] || 'fade-in';
  }

  /**
   * Set up animation loop
   */
  private setupLoop(): void {
    const timeout = window.setTimeout(() => {
      this.start();
    }, this.config.animation.duration);

    this.animationTimeouts.push(timeout);
  }

  /**
   * Get size-specific animation adjustments
   * Some sizes might need different timing or effects
   */
  public static getSizeAdjustments(sizeId: string): Partial<BannerAnimationConfig> {
    const adjustments: Record<string, Partial<BannerAnimationConfig>> = {
      'mobile-banner': {
        // Mobile banners might need faster animations
        animation: {
          duration: 2500,
          loop: true,
          timeline: []
        }
      },
      'leaderboard': {
        // Leaderboard might need side-to-side animations
        animation: {
          duration: 3000,
          loop: true,
          timeline: []
        }
      }
    };

    return adjustments[sizeId] || {};
  }
}

/**
 * Initialize banner animation on page load
 */
export function initBannerAnimation(
  containerId: string,
  config: BannerAnimationConfig
): BannerAnimator | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Banner container not found: ${containerId}`);
    return null;
  }

  const animator = new BannerAnimator(container, config);

  // Start animation when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => animator.start());
  } else {
    animator.start();
  }

  return animator;
}
