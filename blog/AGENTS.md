# Personal Blog System

This is a client-side blog system built for the personal website that supports markdown rendering, LaTeX math, and rich content formatting.

## Features

- 📝 **Markdown Support**: Full markdown rendering with syntax highlighting
- 🧮 **LaTeX Math**: Support for inline and display math using KaTeX
- 🏷️ **Tag Filtering**: Filter blog posts by tags
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Consistent Styling**: Matches the main website design
- 🔗 **Direct Links**: Each post has a shareable URL

## File Structure

```
blog/
├── index.html          # Blog listing page
├── post.html           # Individual blog post viewer
├── manifest.json       # Blog metadata and configuration
├── blog-script.js      # JavaScript functionality
├── blog-style.css      # Blog-specific styles
├── AGENTS.md           # This file
├── images/             # Thumbnail images
│   └── .gitkeep       # Ensures directory is tracked
└── posts/              # Markdown blog posts
    ├── machine-learning-in-transit.md
    ├── aws-sagemaker-journey.md
    ├── nyc-data-science-insights.md
    └── kernel-machines-neural-networks.md
```

## How It Works

### 1. Blog Listing (`/blog/`)
- Loads `manifest.json` to get blog metadata
- Displays posts sorted by date (most recent first)
- Provides tag-based filtering
- Each post card shows title, subheading, date, and tags

### 2. Blog Posts (`/blog/post.html?id=POST_ID`)
- Uses URL parameter to identify which post to load
- Fetches markdown content and renders it with syntax highlighting
- Renders LaTeX math using KaTeX
- Shows post metadata (title, date, tags)

### 3. Manifest System
The `manifest.json` file contains metadata for all blog posts:

```json
{
  "id": "unique-post-id",
  "title": "Post Title",
  "subheading": "Two-line description of the post",
  "date": "YYYY-MM-DD",
  "path": "posts/filename.md",
  "thumbnail": "images/thumbnail.jpg",
  "tags": ["tag1", "tag2"]
}
```

## Adding New Blog Posts

### Step 1: Create the Markdown File
Create a new `.md` file in the `posts/` directory:

```bash
touch blog/posts/my-new-post.md
```

### Step 2: Write Your Content
Use standard markdown with optional LaTeX math:

```markdown
# My New Blog Post

This is a regular paragraph with **bold** and *italic* text.

## Math Example
Inline math: $E = mc^2$

Display math:
$$\sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}$$

## Code Example
```python
def hello_world():
    print("Hello, World!")
```

![Image description](../images/my-image.jpg)
```

### Step 3: Add Entry to Manifest
Add a new entry to `manifest.json`:

```json
{
  "id": "my-new-post",
  "title": "My New Blog Post",
  "subheading": "A brief description of what this post is about, spanning at most two lines.",
  "date": "2024-12-15T00:00:00",
  "path": "posts/my-new-post.md",
  "thumbnail": "images/my-thumbnail.jpg",
  "thumbnailCredit": "Credit to whoever made/took the thumbnail pic",
  "tags": ["tag1", "tag2"]
}
```
Make sure to include the "T00:00:00" part of the date so that JavaScript knows to format the date in local time, not in UTC (else it gives you the day before).

### Step 4: Add Thumbnail (Optional)
If you want a thumbnail image:
1. Add the image to `blog/images/`
2. Update the `thumbnail` field in the manifest
3. If no thumbnail, set `thumbnail` to `""` or `null`
4. Set `thumbnailCredit` to the credit for the thumbnail image

## Supported Markdown Features

- **Headers**: `# H1`, `## H2`, `### H3`
- **Emphasis**: `**bold**`, `*italic*`
- **Lists**: Numbered and bullet lists
- **Links**: `[text](url)`
- **Images**: `![alt](src)`
- **Code**: Inline `code` and fenced code blocks
- **Blockquotes**: `> quote text`
- **Tables**: Standard markdown tables

## LaTeX Math Support

### Inline Math
Use single dollar signs: `$equation$`

Examples:
- `$x^2 + y^2 = z^2$`
- `$\alpha + \beta = \gamma$`

### Display Math
Use double dollar signs: `$$equation$$`

Examples:
```
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$
```

## Styling Guidelines

The blog inherits the main site's styling and uses:
- **Font**: Noto Serif (same as main site)
- **Colors**: Consistent with main site palette
- **Spacing**: Follows Bootstrap grid system
- **Tags**: Use the same color scheme as timeline tags

## Technical Details

### Dependencies
- **jQuery 3.5.1**: DOM manipulation
- **Bootstrap 5.3**: Responsive styling
- **Marked.js**: Markdown parsing
- **KaTeX**: LaTeX math rendering

### Browser Support
- Modern browsers with ES6 support
- Mobile browsers
- Graceful degradation for older browsers

## Customization

### Adding New Tag Colors
Tags automatically get colors, but you can customize them in `blog-script.js` by modifying the color generation function.

### Changing Layout
Modify `blog-style.css` to customize:
- Card layouts
- Typography
- Spacing
- Mobile responsiveness

### Adding New Features
The JavaScript is modular and can be extended to add:
- Search functionality
- RSS feed generation
- Social sharing buttons
- Comment systems

## Deployment

The blog is fully client-side and works with GitHub Pages:
1. Push changes to your repository
2. Blog will be available at `username.github.io/blog/`
3. Individual posts at `username.github.io/blog/post.html?id=POST_ID`

## Troubleshooting

### Post Not Showing
- Check that the post is added to `manifest.json`
- Verify the file path is correct
- Ensure the markdown file exists

### Math Not Rendering
- Check that KaTeX is loaded
- Verify math syntax (use `$$` for display math)
- Check browser console for errors

### Images Not Loading
- Use relative paths from the blog directory
- Ensure images are in the correct directory
- Check image file names and extensions

## Performance

- Manifest loads once and caches post metadata
- Individual markdown files loaded on demand
- Images lazy-loaded where possible
- Minimal JavaScript footprint
