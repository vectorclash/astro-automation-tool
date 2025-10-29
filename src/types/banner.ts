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
  [key: string]: string | undefined;
}

export interface Banner {
  id: string;
  name: string;
  sizes: BannerSize[];
  content: BannerContent;
  assets?: BannerAssets;
  clickthrough: string;
}

export interface BannerData {
  banners: Banner[];
}
