class WordRotator {
  constructor(config) {
    this.element = document.getElementById(config.elementId)
    this.words = config.words || ["Math"]
    this.mode = config.mode || "wheel"
    this.mathInterval = config.mathInterval || 3000
    this.otherInterval = config.otherInterval || 500
    this.onRotate = config.onRotate || null

    this.currentIndex = 0
    this.timeoutId = null

    this.init()
  }

  init() {
    // Set initial mode
    this.element.setAttribute("data-mode", this.mode)

    // Create word elements
    this.element.innerHTML = ""
    
    if (this.mode === "flip") {
      this.setupFlipLayout()
    } else {
      this.setupDefaultLayout()
    }

    // Start rotation
    this.startRotation()
  }

  setupDefaultLayout() {
    this.words.forEach((word, index) => {
      const span = document.createElement("span")
      span.className = index === 0 ? "word active" : "word"
      span.textContent = word
      this.element.appendChild(span)
    })

    this.wordElements = this.element.querySelectorAll(".word")

    // For wheel mode, position words in a vertical stack
    if (this.mode === "wheel") {
      this.setupWheelLayout()
    }
  }

  setupFlipLayout() {
    this.element.innerHTML = `
      <div class="flap-container">
        <div class="flap top-static">
          <div class="flap-content"></div>
        </div>
        <div class="flap bottom-static">
          <div class="flap-content"></div>
        </div>
        <div class="flap-leaf">
          <div class="flap-leaf-front">
            <div class="flap-content"></div>
          </div>
          <div class="flap-leaf-back">
            <div class="flap-content"></div>
          </div>
        </div>
      </div>
    `
    
    this.flapTop = this.element.querySelector(".top-static .flap-content")
    this.flapBottom = this.element.querySelector(".bottom-static .flap-content")
    this.flapLeafFront = this.element.querySelector(".flap-leaf-front .flap-content")
    this.flapLeafBack = this.element.querySelector(".flap-leaf-back .flap-content")
    this.flapLeaf = this.element.querySelector(".flap-leaf")

    const currentWord = this.words[this.currentIndex]
    this.updateFlapContents(currentWord, currentWord)
    
    // Set initial width
    this.updateContainerWidth()
  }

  updateFlapContents(currentWord, nextWord) {
    this.flapTop.textContent = nextWord
    this.flapBottom.textContent = currentWord
    this.flapLeafFront.textContent = currentWord
    this.flapLeafBack.textContent = nextWord
  }

  setupWheelLayout() {
    // Measure and set container width to fit the longest word
    this.updateContainerWidth()
    
    // Position all words in a vertical stack for continuous rotation
    this.wordElements.forEach((word, index) => {
      word.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease"
      
      if (index === this.currentIndex) {
        word.style.transform = "translateY(0)"
        word.style.opacity = "1"
      } else {
        // Position words below the active one in the stack
        const offset = (index - this.currentIndex + this.words.length) % this.words.length
        word.style.transform = `translateY(${offset * 100}%)`
        word.style.opacity = "0"
      }
    })
  }

  updateContainerWidth() {
    // Temporarily measure longest word
    const tempMeasure = document.createElement("span")
    tempMeasure.style.position = "absolute"
    tempMeasure.style.visibility = "hidden"
    tempMeasure.style.whiteSpace = "nowrap"
    tempMeasure.style.fontSize = window.getComputedStyle(this.element).fontSize
    tempMeasure.style.fontWeight = "900"
    
    // Use appropriate font for measurement based on mode
    if (this.mode === "flip") {
      // Get the actual font from the flap-container if it exists, otherwise use default
      const flapContainer = this.element.querySelector(".flap-container")
      if (flapContainer) {
        tempMeasure.style.fontFamily = window.getComputedStyle(flapContainer).fontFamily
      } else {
        tempMeasure.style.fontFamily = "'JetBrains Mono', monospace"
      }
    } else {
      tempMeasure.style.fontFamily = window.getComputedStyle(this.element).fontFamily
    }
    tempMeasure.style.textTransform = "uppercase"
    document.body.appendChild(tempMeasure)

    let maxWidth = 0
    this.words.forEach(word => {
      tempMeasure.textContent = word
      const width = tempMeasure.offsetWidth
      if (width > maxWidth) {
        maxWidth = width
      }
    })

    document.body.removeChild(tempMeasure)

    // Set container width - more generous padding for flip mode to accommodate longer words
    const padding = this.mode === "flip" ? 100 : 60
    const minWidth = this.mode === "flip" ? 280 : 240
    const finalWidth = Math.max(maxWidth + padding, minWidth) 
    this.element.style.width = `${finalWidth}px`
    
    if (this.mode === "flip") {
      const container = this.element.querySelector(".flap-container")
      if (container) container.style.width = "100%"
    }
  }

  startRotation() {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Determine interval based on current word (first word gets mathInterval)
    const interval = this.currentIndex === 0 ? this.mathInterval : this.otherInterval

    this.timeoutId = setTimeout(() => {
      this.rotateToNext()
    }, interval)
  }

  rotateToNext() {
    if (this.mode === "wheel") {
      this.rotateWheel()
    } else {
      this.rotateFlip()
    }
  }

  rotateWheel() {
    const currentElement = this.wordElements[this.currentIndex]
    
    // Move current word up and out (continuous upward motion)
    currentElement.classList.remove("active")
    currentElement.classList.add("exiting")
    currentElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease"
    currentElement.style.transform = "translateY(-100%)"
    currentElement.style.opacity = "0"

    // Move to next word
    this.currentIndex = (this.currentIndex + 1) % this.words.length
    const nextElement = this.wordElements[this.currentIndex]

    // Position next word below (coming from bottom) - ensure it's ready
    nextElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease"
    nextElement.style.transform = "translateY(100%)"
    nextElement.style.opacity = "0"

    // Animate next word into position (continuous upward motion)
    requestAnimationFrame(() => {
      nextElement.classList.add("active")
      nextElement.style.transform = "translateY(0)"
      nextElement.style.opacity = "1"

      if (this.onRotate) this.onRotate(this.currentIndex, true)

      // After animation completes, reposition the exited word at the bottom for continuous loop
      setTimeout(() => {
        currentElement.classList.remove("exiting")
        // Disable transition temporarily for instant repositioning
        currentElement.style.transition = "none"
        // Position it at the bottom of the stack (ready to enter from bottom again)
        const totalWords = this.words.length
        currentElement.style.transform = `translateY(${totalWords * 100}%)`
        // Re-enable transition for next animation
        requestAnimationFrame(() => {
          currentElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease"
        })
      }, 800)
    })

    // Schedule next rotation
    this.startRotation()
  }

  rotateFlip() {
    const currentWord = this.words[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.words.length
    const nextWord = this.words[this.currentIndex]

    // Prepare contents for the animation
    this.updateFlapContents(currentWord, nextWord)

    // Reset leaf position without transition
    this.flapLeaf.style.transition = "none"
    this.flapLeaf.classList.remove("flipping")
    
    // Force reflow
    void this.flapLeaf.offsetWidth

    // Start animation with a mechanical feel
    this.flapLeaf.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    this.flapLeaf.classList.add("flipping")

    if (this.onRotate) this.onRotate(this.currentIndex, false)

    // After animation finish, sync the states
    setTimeout(() => {
      this.flapBottom.textContent = nextWord
      this.flapLeafFront.textContent = nextWord // Update leaf front to next word for rest state
      
      this.flapLeaf.style.transition = "none"
      this.flapLeaf.classList.remove("flipping")

      if (this.onRotate) this.onRotate(this.currentIndex, true)
    }, 450)

    // Schedule next rotation
    this.startRotation()
  }

  setMode(newMode) {
    this.mode = newMode
    this.element.setAttribute("data-mode", newMode)
    
    // Reinitialize layout
    this.init()
  }

  setWords(newWords) {
    this.words = newWords
    this.currentIndex = 0

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Reinitialize
    this.init()
  }

  setIntervals(mathInterval, otherInterval) {
    this.mathInterval = mathInterval
    this.otherInterval = otherInterval
  }

  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }
}

// Export for module usage (optional)
if (typeof module !== "undefined" && module.exports) {
  module.exports = WordRotator
}
