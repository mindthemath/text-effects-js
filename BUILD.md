# Building and Bundling Word Rotator

This document explains how to bundle and distribute the Word Rotator component for use in other websites.

## Distribution Options

### Option 1: Standalone Files (Simplest)

The component can be used directly with the provided files:

- `word-rotator.js` - The main component class
- `styles.css` - All required styles

**Pros:**
- No build step required
- Easy to understand and debug
- Works immediately

**Cons:**
- Larger file sizes (not minified)
- No tree-shaking
- Manual dependency management

### Option 2: Bundled & Minified (Recommended for Production)

Create optimized, minified versions for production use.

#### Using esbuild (Fast & Simple)

1. Install esbuild:
```bash
npm install --save-dev esbuild
```

2. Create a build script in `package.json`:
```json
{
  "scripts": {
    "build": "npm run build:js && npm run build:css",
    "build:js": "esbuild word-rotator.js --bundle --minify --format=iife --global-name=WordRotator --outfile=dist/word-rotator.min.js",
    "build:css": "esbuild styles.css --minify --outfile=dist/styles.min.css"
  }
}
```

3. Run the build:
```bash
npm run build
```

This creates:
- `dist/word-rotator.min.js` - Minified JavaScript bundle
- `dist/styles.min.css` - Minified CSS

#### Using Rollup (More Control)

1. Install Rollup and plugins:
```bash
npm install --save-dev rollup @rollup/plugin-terser
```

2. Create `rollup.config.js`:
```javascript
import { terser } from '@rollup/plugin-terser';

export default {
  input: 'word-rotator.js',
  output: {
    file: 'dist/word-rotator.min.js',
    format: 'iife',
    name: 'WordRotator'
  },
  plugins: [terser()]
};
```

3. Run:
```bash
npx rollup -c
```

### Option 3: ES Module Bundle

Create an ES module version for modern bundlers:

```bash
esbuild word-rotator.js --bundle --format=esm --outfile=dist/word-rotator.esm.js
```

### Option 4: UMD Bundle (Universal Module Definition)

For maximum compatibility:

```bash
esbuild word-rotator.js --bundle --format=umd --global-name=WordRotator --outfile=dist/word-rotator.umd.js
```

## Complete Build Setup

Here's a complete `package.json` setup for building all formats:

```json
{
  "name": "word-rotator",
  "version": "1.0.0",
  "description": "Animated word rotation component",
  "main": "dist/word-rotator.min.js",
  "module": "dist/word-rotator.esm.js",
  "files": [
    "dist",
    "word-rotator.js",
    "styles.css"
  ],
  "scripts": {
    "build": "npm run build:js && npm run build:css",
    "build:js": "npm run build:js:iife && npm run build:js:esm && npm run build:js:umd",
    "build:js:iife": "esbuild word-rotator.js --bundle --minify --format=iife --global-name=WordRotator --outfile=dist/word-rotator.min.js",
    "build:js:esm": "esbuild word-rotator.js --bundle --minify --format=esm --outfile=dist/word-rotator.esm.js",
    "build:js:umd": "esbuild word-rotator.js --bundle --minify --format=umd --global-name=WordRotator --outfile=dist/word-rotator.umd.js",
    "build:css": "esbuild styles.css --minify --outfile=dist/styles.min.css",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "esbuild": "^0.19.0"
  }
}
```

## File Structure After Build

```
word-rotator/
├── dist/
│   ├── word-rotator.min.js    # IIFE bundle (browser script tag)
│   ├── word-rotator.esm.js    # ES module (modern bundlers)
│   ├── word-rotator.umd.js    # UMD bundle (universal)
│   └── styles.min.css         # Minified CSS
├── word-rotator.js            # Source (for development)
├── styles.css                 # Source (for development)
├── package.json
└── README.md
```

## Usage After Building

### Browser Script Tag (IIFE)

```html
<link rel="stylesheet" href="dist/styles.min.css">
<script src="dist/word-rotator.min.js"></script>
<script>
  const rotator = new WordRotator({
    elementId: 'rotator',
    words: ['One', 'Two', 'Three']
  });
</script>
```

### ES Module Import

```javascript
import WordRotator from './dist/word-rotator.esm.js';
import './dist/styles.min.css';

const rotator = new WordRotator({
  elementId: 'rotator',
  words: ['One', 'Two', 'Three']
});
```

### CommonJS/Require (UMD)

```javascript
const WordRotator = require('./dist/word-rotator.umd.js');
require('./dist/styles.min.css');
```

## Publishing to NPM

1. Update `package.json` with proper metadata:
```json
{
  "name": "word-rotator",
  "version": "1.0.0",
  "description": "Animated word rotation component",
  "keywords": ["animation", "rotator", "text", "ui"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/word-rotator.git"
  }
}
```

2. Build the project:
```bash
npm run build
```

3. Publish:
```bash
npm publish
```

## CDN Distribution

After building, you can host the files on a CDN:

1. Upload `dist/word-rotator.min.js` and `dist/styles.min.css` to your CDN
2. Users can include via:
```html
<link rel="stylesheet" href="https://cdn.example.com/word-rotator/styles.min.css">
<script src="https://cdn.example.com/word-rotator/word-rotator.min.js"></script>
```

## Source Maps (Optional)

For debugging, include source maps:

```bash
esbuild word-rotator.js --bundle --minify --sourcemap --format=iife --global-name=WordRotator --outfile=dist/word-rotator.min.js
```

This creates `dist/word-rotator.min.js.map` for debugging.

## Size Optimization Tips

1. **Minify CSS**: Already handled by esbuild
2. **Remove unused CSS**: Consider using PurgeCSS if you have demo-specific styles
3. **Tree-shaking**: Use ES module format for bundlers that support it
4. **Gzip**: Enable gzip compression on your server/CDN

## Testing the Build

After building, test all formats:

1. **IIFE**: Open `index.html` with script tag pointing to `dist/word-rotator.min.js`
2. **ESM**: Use a bundler like Vite or Webpack
3. **UMD**: Test with both browser and Node.js environments

