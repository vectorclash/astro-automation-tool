# Astro Banner Ad Automation Tool

A modular system for building and packaging banner ads from templates using Astro.

## Features

- **Modular Templates**: Define banner content once, generate multiple sizes
- **JSON-Driven**: Store banner data (eyebrow, headline, subhead, CTA) in JSON format
- **Size Variants**: Built-in support for common IAB banner sizes:
  - 300x250 (Medium Rectangle)
  - 728x90 (Leaderboard)
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
│   │   └── banner-animation.ts       # Animation system
│   ├── styles/
│   │   ├── banner-base.css           # Shared styles for all banners
│   │   └── sizes/                    # Size-specific styles
│   │       ├── 300x250.css
│   │       ├── 728x90.css
│   │       ├── 160x600.css
│   │       ├── 300x600.css
│   │       └── 320x50.css
│   └── types/
│       └── banner.ts                 # TypeScript type definitions
├── public/
│   └── images/                       # Banner assets (logos, backgrounds, etc.)
├── scripts/
│   └── package-banners.js            # Packaging script
└── packaged-banners/                 # Generated packages (after build)
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Images

Place your banner assets in `public/images/`:
- logo.png
- bg.jpg
- product.png
- (or any custom images)

### 3. Configure Your Banner

Edit `src/data/banners.json` to customize your banner content:

```json
{
  "banners": [
    {
      "id": "campaign-001",
      "name": "My Campaign",
      "content": {
        "eyebrow": "New Product Launch",
        "headline": "Experience the Future",
        "subhead": "Innovation meets design",
        "cta": "Shop Now"
      },
      "assets": {
        "logo": "/images/logo.png",
        "background": "/images/bg.jpg"
      },
      "clickthrough": "https://example.com/campaign"
    }
  ]
}
```

### 4. Preview Banners

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:4321` to preview all banner sizes.

### 5. Package Banners

Build and package all banners for deployment:

```bash
npm run package
```

This creates individual packages in `packaged-banners/` with:
- `index.html` - The banner HTML
- `styles.css` - Bundled CSS
- `animation.js` - Animation script
- `images/` - Required image assets
- `banner-info.json` - Banner metadata

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
  }
]
```

### Animation Configuration

Customize the animation timeline:

```json
"animation": {
  "duration": 3000,
  "loop": true,
  "timeline": [
    {
      "element": "eyebrow",
      "delay": 0,
      "duration": 500,
      "effect": "fadeIn"
    }
  ]
}
```

**Available effects:**
- `fadeIn`
- `fadeInUp`
- `fadeInDown`
- `slideInLeft`
- `slideInRight`
- `scale`

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

### Modifying JavaScript

The animation system is in `src/scripts/banner-animation.ts`. You can:
- Add custom animation effects
- Create size-specific animation adjustments
- Modify timing and sequencing logic

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build all banners for production
- `npm run preview` - Preview production build
- `npm run package` - Build and package individual banners

## Export Workflow

1. Design your banner template
2. Configure content in JSON
3. Preview all sizes locally
4. Run `npm run package` to generate exports
5. Each size is packaged with all dependencies
6. Upload packaged folders to your ad server

## Tips

- Keep headline text short for smaller sizes (mobile)
- Test animations at different speeds
- Optimize images before adding to `public/images/`
- Use consistent naming for campaign IDs
- The 320x50 mobile banner hides eyebrow and subhead by default
- The 728x90 leaderboard uses horizontal layout

## Technology Stack

- **Astro** - Static site generation
- **TypeScript** - Type safety
- **CSS3** - Animations and responsive design
- **Vanilla JavaScript** - Animation system

## License

MIT
