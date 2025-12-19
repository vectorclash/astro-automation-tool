export interface BannerSize {
  width: number;
  height: number;
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
  sizeAssets?: {
    [sizeId: string]: BannerAssets; // e.g., "300x250": { product: "...", background: "..." }
  };
  contentTemplate?: string; // Optional: specify which content component to use (defaults to 'DefaultContent')
}

export interface BannerData {
  banners: Banner[];
}
