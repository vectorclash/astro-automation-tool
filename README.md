# Astro Banner Ad Automation Tool

A modular system for building and packaging banner ads from templates using Astro.

## Features

- **Modular Templates**: Define banner content once, generate multiple sizes
- **JSON-Driven**: Store banner data (eyebrow, headline, subhead, CTA) in JSON format
- **Size Variants**: Built-in support for common IAB banner sizes:
  - 300x250 (Medium Rectangle)
  - 728x90 (Leaderboard)
  - 970x250 (Billboard)
  - 160x600 (Wide Skyscraper)
  - 300x600 (Half Page)
  - 320x50 (Mobile Banner)
- **Modular CSS**: Shared base styles + size-specific overrides
- **Animation System**: Configurable timeline-based animations
- **Live Preview**: View all banner sizes simultaneously
- **Automatic Packaging**: Export individual banners with all dependencies

## Project Structure

```
astro-automation-tool/
├── src/
│   ├── components/
│   │   └── banners/
│   │       └── Banner.astro          # Main banner component
│   ├── data/
│   │   └── banners.json              # Banner content and configuration
│   ├── pages/
│   │   ├── index.astro               # Preview page (all banners)
│   │   └── banner/[bannerId]/[sizeId].astro  # Individual banner pages
│   ├── scripts/
│   │   └── banner-animation.ts       # GSAP-based animation system
│   ├── styles/
│   │   ├── banner-base.css           # Shared styles for all banners
│   │   └── sizes/                    # Size-specific styles
│   │       ├── 300x250.css
│   │       ├── 728x90.css
│   │       ├── 970x250.css
│   │       ├── 160x600.css
│   │       ├── 300x600.css
│   │       └── 320x50.css
│   └── types/
│       └── banner.ts                 # TypeScript type definitions
├── public/
│   └── images/                       # Banner assets (logos, backgrounds, etc.)
├── scripts/
│   ├── package-banners.js            # Packaging script
│   ├── post-build-cleanup.js         # Build cleanup and optimization
│   └── watch-and-serve.js            # Development server with hot reload
└── packaged-banners/                 # Generated packages (after build)
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Assets

Place your banner assets in `public/images/`:
- embrace.png (or your custom product/brand images)
- logos, backgrounds, or any other visual assets

### 3. Configure Your Banner

Edit `src/data/banners.json` to customize your banner content:

```json
{
  "banners": [
    {
      "id": "campaign-001",
      "name": "Sample Campaign",
      "sizes": [
        {
          "width": 300,
          "height": 250,
          "id": "medium-rectangle"
        },
        {
          "width": 728,
          "height": 90,
          "id": "leaderboard"
        },
        {
          "width": 970,
          "height": 250,
          "id": "billboard"
        }
      ],
      "content": {
        "eyebrow": "Learn how to get the all-new",
        "headline": "iPhone 17 Pro for $0",
        "subhead": "with eligible trade-in",
        "cta": "Shop now"
      },
      "assets": {
        "embrace": "/images/embrace.png"
      },
      "clickthrough": "https://www.example.com"
    }
  ]
}
```

### 4. Preview Banners

Start the development server with live reload:

```bash
npm run dev
```

This starts a BrowserSync server with automatic rebuilding on file changes. Visit the URL displayed in the terminal to preview all banner sizes simultaneously.

### 5. Package Banners

Build and package all banners for deployment:

```bash
npm run package
```

This creates individual packages in `packaged-banners/` with:
- `index.html` - The banner HTML
- `styles.css` - Bundled and inlined CSS
- `animation.js` - GSAP animation script
- `images/` - Required image assets
- `banner-info.json` - Banner metadata

The build process automatically cleans up unused files and optimizes the output for ad serving.

## Banner Configuration

### Content Fields

- **eyebrow**: Small text above headline (uppercase, subtle)
- **headline**: Main message (large, bold)
- **subhead**: Supporting text (medium size)
- **cta**: Call-to-action button text

### Size Configuration

Each banner can render in multiple sizes. Add or remove sizes in `banners.json`:

```json
"sizes": [
  {
    "width": 300,
    "height": 250,
    "id": "medium-rectangle"
  },
  {
    "width": 970,
    "height": 250,
    "id": "billboard"
  }
]
```

**Available sizes:**
- 300x250 (medium-rectangle)
- 728x90 (leaderboard)
- 970x250 (billboard)
- 160x600 (wide-skyscraper)
- 300x600 (half-page)
- 320x50 (mobile-banner)

### Animation Configuration

The animation system uses GSAP for smooth, performant animations. Customize timing and effects in `src/scripts/banner-animation.ts`.

Default animation sequence:
1. Logo fades in
2. Eyebrow text slides in from top
3. Headline slides in from left
4. Subhead slides in from left (staggered)
5. CTA button appears with scale effect

You can adjust timing, easing, and animation properties by modifying the GSAP timeline in the animation script.

## Customization

### Adding New Sizes

1. Create a new CSS file in `src/styles/sizes/`:
   ```css
   /* src/styles/sizes/970x250.css */
   .banner.size-970x250 {
     width: 970px;
     height: 250px;
   }
   /* Add size-specific styles... */
   ```

2. Add the size to your banner in `banners.json`:
   ```json
   {
     "width": 970,
     "height": 250,
     "id": "billboard"
   }
   ```

3. Import the CSS in `src/pages/index.astro`

### Customizing Styles

- **Global styles**: Edit `src/styles/banner-base.css`
- **Size-specific styles**: Edit files in `src/styles/sizes/`
- **Animation styles**: Modify keyframes in `banner-base.css`

### Modifying Animations

The GSAP animation system is in `src/scripts/banner-animation.ts`. You can:
- Adjust animation timing and easing functions
- Create size-specific animation adjustments
- Add custom GSAP effects and transitions
- Modify the animation timeline sequence

## Scripts

- `npm run dev` - Start development server with BrowserSync and automatic rebuilds
- `npm run build` - Build all banners for production with post-build cleanup
- `npm run package` - Build and package individual banners for ad serving

## Export Workflow

1. Design your banner template
2. Configure content in JSON
3. Preview all sizes locally
4. Run `npm run package` to generate exports
5. Each size is packaged with all dependencies
6. Upload packaged folders to your ad server

## Tips

- Keep headline text short for smaller sizes (320x50 mobile banner)
- The 320x50 mobile banner automatically hides eyebrow and subhead for space
- The 728x90 leaderboard and 970x250 billboard use horizontal layouts
- Optimize images before adding to `public/images/` for faster load times
- Use consistent naming for campaign IDs to keep packages organized
- The development server automatically refreshes when you make changes
- Each packaged banner is self-contained with all dependencies included

## Technology Stack

- **Astro** - Static site generation and build system
- **TypeScript** - Type safety and better development experience
- **GSAP** - High-performance animation library
- **CSS3** - Modular styling and layout system
- **BrowserSync** - Live reload development server
- **Archiver** - Automated packaging for ad serving

## License

MIT
