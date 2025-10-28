export interface BannerSize {
  width: number;
  height: number;
  id: string;
}

export interface BannerContent {
  eyebrow: string;
  headline: string;
  subhead: string;
  cta: string;
}

export interface BannerAssets {
  logo?: string;
  background?: string;
  product?: string;
  [key: string]: string | undefined;
}

export interface AnimationStep {
  element: string;
  delay: number;
  duration: number;
  effect: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'scale';
}

export interface BannerAnimation {
  duration: number;
  loop: boolean;
  timeline: AnimationStep[];
}

export interface Banner {
  id: string;
  name: string;
  sizes: BannerSize[];
  content: BannerContent;
  assets: BannerAssets;
  clickthrough: string;
  animation: BannerAnimation;
}

export interface BannerData {
  banners: Banner[];
}
