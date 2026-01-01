# Text Effects JS

An animated word rotation component with two display modes: **Wheel** (vertical scrolling) and **Flip** (airport-style split-flap display). Perfect for hero sections, landing pages, and dynamic text displays.

## Features

- 🎡 **Wheel Mode**: Smooth vertical scrolling word rotation
- 🎫 **Flip Mode**: Authentic split-flap display board animation (like airport departure boards)
- ⚙️ **Highly Configurable**: Customizable timing, colors, fonts, and more
- 🎨 **Styling Options**: Multiple board backgrounds and font choices for flip mode
- 📱 **Responsive**: Works on all screen sizes
- 🚀 **Zero Dependencies**: Pure vanilla JavaScript and CSS

## Installation

### Option 1: Direct File Inclusion (Simplest)

1. Copy the following files to your project:
   - `text-effects.js`
   - `styles.css`

2. Include them in your HTML:

```html
<link rel="stylesheet" href="path/to/styles.css">
<script src="path/to/text-effects.js"></script>
```

### Option 2: NPM Package (Recommended for Production)

```bash
npm install text-effects-js
```

Then import in your JavaScript:

```javascript
import WordRotator from 'text-effects-js';
```

And include the CSS:

```css
@import 'text-effects-js/dist/styles.css';
```

### Option 3: CDN (Quick Testing)

```html
<!-- Text Effects CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mindthemath/text-effects-js@main/styles.css">

<!-- Web Fonts (optional - for flip mode fonts) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@900&family=Roboto+Mono:wght@900&family=Source+Code+Pro:wght@900&family=Space+Mono:wght@700&display=swap" rel="stylesheet">

<!-- Text Effects JS -->
<script src="https://cdn.jsdelivr.net/gh/mindthemath/text-effects-js@main/text-effects.js"></script>
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>
    <span>MIND THE</span>
    <span id="wordRotator"></span>
  </h1>

  <script src="text-effects.js"></script>
  <script>
    const rotator = new WordRotator({
      elementId: 'wordRotator',
      words: ['Math', 'Art', 'Engineering', 'Design'],
      mode: 'wheel'
    });
  </script>
</body>
</html>
```

## Configuration Options

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `elementId` | `string` | **required** | The ID of the HTML element where the rotator will be rendered |
| `words` | `string[]` | `["Math"]` | Array of words to rotate through |
| `mode` | `'wheel'` \| `'flip'` | `'wheel'` | Display mode: `'wheel'` for vertical scrolling, `'flip'` for split-flap board |
| `firstWordInterval` | `number` | `3000` | Duration (in milliseconds) to display the first word before rotating |
| `otherWordInterval` | `number` | `500` | Duration (in milliseconds) to display other words before rotating |
| `timingMode` | `'fixed'` \| `'pause'` | `'pause'` | Timing behavior: `'fixed'` = interval from start, `'pause'` = wait after animation completes |
| `onRotate` | `function` | `null` | Callback fired when rotation completes: `(index, isFinished) => {}` |
| `onLetterLand` | `function` | `null` | Callback fired when each letter lands (flip mode only): `(letterIndex, letter, wordIndex, isAccent) => {}` |

### Example with All Options

```javascript
const rotator = new WordRotator({
  elementId: 'wordRotator',
  words: ['Math', 'Art', 'Engineering', 'Computation', 'Design'],
  mode: 'flip',
  firstWordInterval: 3000,
  otherWordInterval: 500,
  timingMode: 'pause',
  onRotate: (index, isFinished) => {
    console.log(`Rotated to word ${index}, finished: ${isFinished}`);
  },
  onLetterLand: (letterIndex, letter, wordIndex, isAccent) => {
    // Customize letter colors when they land
    if (isAccent) {
      // First word letters get special treatment
    }
  }
});
```

## Display Modes

### Wheel Mode

Smooth vertical scrolling animation where words slide up and out, with the next word entering from below.

**Best for:**
- Modern, minimalist designs
- Fast-paced content
- When you want a subtle animation

**Example:**
```javascript
const rotator = new WordRotator({
  elementId: 'wordRotator',
  words: ['Innovation', 'Creativity', 'Excellence'],
  mode: 'wheel'
});
```

### Flip Mode

Authentic split-flap display board animation (like vintage airport departure boards). Each letter flips through characters to reach the target letter.

**Best for:**
- Retro/vintage aesthetics
- Technical or industrial themes
- When you want a more dramatic, attention-grabbing effect

**Flip Mode Specific Options:**

After initialization, you can customize flip mode appearance:

```javascript
// Set board background color
const rotatorElement = document.getElementById('wordRotator');
rotatorElement.setAttribute('data-board-bg', 'black'); // 'black', 'white', or 'invisible'

// Customize font (must be done via CSS)
const letterFlaps = document.querySelectorAll('.letter-flap');
letterFlaps.forEach(flap => {
  flap.style.fontFamily = "'Source Code Pro', monospace";
});
```

**Example:**
```javascript
const rotator = new WordRotator({
  elementId: 'wordRotator',
  words: ['MATH', 'ART', 'ENGINEERING'],
  mode: 'flip',
  firstWordInterval: 3000,
  otherWordInterval: 500
});

// Set white board background
document.getElementById('wordRotator').setAttribute('data-board-bg', 'white');
```

## Methods

### `setMode(newMode)`

Switch between `'wheel'` and `'flip'` modes dynamically.

```javascript
rotator.setMode('flip');
```

### `setWords(newWords)`

Update the word list. The rotator will reset to the first word.

```javascript
rotator.setWords(['New', 'Word', 'List']);
```

### `setIntervals(firstWordInterval, otherWordInterval)`

Update timing intervals dynamically.

```javascript
rotator.setIntervals(5000, 1000); // 5s for first word, 1s for others
```

### `setTimingMode(mode)`

Change timing mode between `'fixed'` and `'pause'`.

```javascript
rotator.setTimingMode('fixed'); // Start next rotation immediately
rotator.setTimingMode('pause'); // Wait for animation to complete
```

### `destroy()`

Clean up the rotator and stop animations.

```javascript
rotator.destroy();
```

## Styling

### Custom Colors

You can style the rotator using CSS:

```css
/* Wheel mode - style the word elements */
.word-rotator[data-mode="wheel"] .word {
  color: #333;
  font-weight: 900;
}

/* Flip mode - style the board */
.flip-board {
  background: #0a0a0a;
  border-radius: 6px;
}

/* Flip mode - style individual letters */
.letter-flap {
  font-family: 'Courier New', monospace;
}
```

### Board Background Options (Flip Mode)

Set the `data-board-bg` attribute on the rotator element:

- `black` - Dark background (default)
- `white` - Light background
- `invisible` - Transparent background

```html
<span id="wordRotator" data-board-bg="white"></span>
```

### Font Customization (Flip Mode)

For flip mode, you can use any monospace font. Popular options:

- `'Source Code Pro', monospace` (default)
- `'JetBrains Mono', monospace`
- `'Roboto Mono', monospace`
- `'Courier New', Courier, monospace`
- `'OCR-A', 'OCRA', monospace` (requires font installation)

Apply via CSS:

```css
.letter-flap {
  font-family: 'Your Font', monospace;
}
```

## Callbacks

### `onRotate(index, isFinished)`

Called when a rotation completes.

- `index`: Current word index (0-based)
- `isFinished`: `true` if animation is complete, `false` if still animating (flip mode only)

```javascript
const rotator = new WordRotator({
  elementId: 'wordRotator',
  words: ['One', 'Two', 'Three'],
  onRotate: (index, isFinished) => {
    console.log(`Now showing: ${words[index]}`);
    if (isFinished) {
      // Animation complete, safe to update colors/styles
    }
  }
});
```

### `onLetterLand(letterIndex, letter, wordIndex, isAccent)`

Called when each letter finishes its animation in flip mode.

- `letterIndex`: Position of the letter (0-based)
- `letter`: The letter character
- `wordIndex`: Current word index
- `isAccent`: `true` if this is a letter from the first word (special accent position)

```javascript
const rotator = new WordRotator({
  elementId: 'wordRotator',
  words: ['MATH', 'ART'],
  mode: 'flip',
  onLetterLand: (letterIndex, letter, wordIndex, isAccent) => {
    const flap = document.querySelectorAll('.letter-flap')[letterIndex];
    const color = isAccent ? '#ff0000' : '#666666';
    flap.querySelectorAll('.flap-content').forEach(el => {
      el.style.color = color;
    });
  }
});
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

Requires modern browser with CSS 3D transforms support (all browsers from 2012+).

## Examples

### Example 1: Simple Hero Section

```html
<h1 class="hero">
  Welcome to <span id="rotator"></span>
</h1>

<script>
  new WordRotator({
    elementId: 'rotator',
    words: ['Innovation', 'Creativity', 'Excellence'],
    mode: 'wheel'
  });
</script>
```

### Example 2: Flip Mode with Custom Styling

```html
<h1>
  <span>MIND THE</span>
  <span id="rotator" data-board-bg="white"></span>
</h1>

<style>
  #rotator .letter-flap {
    font-family: 'JetBrains Mono', monospace;
  }
</style>

<script>
  const rotator = new WordRotator({
    elementId: 'rotator',
    words: ['MATH', 'ART', 'DESIGN'],
    mode: 'flip',
    firstWordInterval: 3000,
    otherWordInterval: 800
  });
</script>
```

### Example 3: Dynamic Word Updates

```javascript
const rotator = new WordRotator({
  elementId: 'rotator',
  words: ['Loading', 'Processing', 'Almost done']
});

// Later, update the words
setTimeout(() => {
  rotator.setWords(['Complete', 'Success', 'Done']);
}, 5000);
```

## Building for Distribution

See [BUILD.md](./BUILD.md) for instructions on bundling and minifying the component for production use.

## License

MIT License - feel free to use in personal and commercial projects.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

