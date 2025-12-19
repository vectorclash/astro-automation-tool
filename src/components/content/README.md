# Content Templates

This directory contains reusable content templates for banners. Each template defines a different layout/structure for banner content.

## How It Works

1. **Create a Content Template**: Each template is an Astro component in this directory
2. **Specify in JSON**: Add `contentTemplate` field to your banner configuration
3. **Automatic Loading**: The system will load and render your specified template

## Available Templates

### DefaultContent.astro
The standard layout used when no template is specified.

**Structure:**
- Eyebrow text (optional)
- Headline
- Subhead
- CTA button

**Special handling:**
- Leaderboard/mobile formats use a text-group wrapper
- Mobile banner hides eyebrow and subhead

### SimpleContent.astro
A minimal layout with just the essentials.

**Structure:**
- Headline
- CTA button

## Creating a New Template

1. Create a new `.astro` file in this directory (e.g., `MyCustomContent.astro`)

```astro
---
/**
 * My Custom Content Template
 * Description of what makes this template unique
 */
interface Props {
  banner: any;
  size: any;
  sizeId: string;
}

const { banner, size, sizeId } = Astro.props;
---

<!-- Your custom HTML structure here -->
<div class="custom-wrapper">
  <h1 class="big-headline">{banner.content.headline}</h1>
  <p class="description">{banner.content.subhead}</p>
  <button class="cta-button">{banner.content.cta}</button>
</div>
```

2. Import it in `src/pages/[bannerId]/[sizeId].astro`:

```typescript
import MyCustomContent from '../../components/content/MyCustomContent.astro';

const contentTemplates = {
  'DefaultContent': DefaultContent,
  'SimpleContent': SimpleContent,
  'MyCustomContent': MyCustomContent, // Add your template
};
```

3. Use it in your banner JSON:

```json
{
  "id": "my-campaign",
  "name": "My Campaign",
  "contentTemplate": "MyCustomContent",
  "content": {
    "headline": "Amazing Product",
    "subhead": "Get it now",
    "cta": "Shop"
  }
}
```

## Available Data

Templates receive these props:

- `banner` - Full banner configuration object
  - `banner.id` - Banner ID
  - `banner.name` - Banner name
  - `banner.content` - Content object (headline, subhead, cta, eyebrow, etc.)
  - `banner.assets` - Global asset URLs (shared across all sizes)

- `size` - Size configuration object
  - `size.width` - Banner width
  - `size.height` - Banner height

- `sizeId` - String format of size (e.g., '300x250')

- `sizeAssets` - Size-specific assets for the current banner size
  - Contains assets unique to this particular size
  - Example: `sizeAssets.product`, `sizeAssets.background`

## Using Size-Specific Assets

Size-specific assets allow you to have different images for each banner size. This is useful when you need uniquely cropped or formatted images for different dimensions.

### In your JSON:

```json
{
  "id": "campaign-001",
  "name": "My Campaign",
  "assets": {
    "embrace": "/images/embrace.png"
  },
  "sizeAssets": {
    "300x250": {
      "product": "/images/campaign-001/product-300x250.png",
      "background": "/images/campaign-001/bg-300x250.jpg"
    },
    "728x90": {
      "product": "/images/campaign-001/product-728x90.png"
    }
  }
}
```

### In your template:

```astro
---
interface Props {
  banner: any;
  size: any;
  sizeId: string;
  sizeAssets?: any;
}

const { banner, size, sizeId, sizeAssets = {} } = Astro.props;
---

{sizeAssets.background && (
  <img src={sizeAssets.background} alt="" class="background-image" />
)}

{sizeAssets.product && (
  <img src={sizeAssets.product} alt="Product" class="product-image" />
)}

<p class="headline">{banner.content.headline}</p>
<button class="cta-button">{banner.content.cta}</button>
```

## Tips

- Use semantic HTML elements (`<p>`, `<h1>`, etc.) for better text measurement with SplitText
- Classes like `cta-button`, `headline`, `subhead` are styled in base CSS
- You can add custom classes and style them in size-specific CSS files
- Access any custom content fields via `banner.content.yourField`
- Use conditional rendering based on dimensions for size-specific layouts:
  ```javascript
  const isMobile = size.height === 50;
  const isLeaderboard = size.width === 728 && size.height === 90;
  ```
- **Global vs Size-Specific Assets:**
  - Use `banner.assets` for images shared across all sizes (like logos)
  - Use `sizeAssets` for images unique to each size (like cropped product shots)
