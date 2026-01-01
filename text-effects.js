class WordRotator {
  constructor(config) {
    this.element = document.getElementById(config.elementId)
    // Ensure all words are trimmed and non-empty
    const defaultWords = ["math", "science", "technology", "engineering", "art"]
    const rawWords = config.words || defaultWords
    this.words = rawWords.map(w => String(w).trim()).filter(w => w.length > 0)
    if (this.words.length === 0) {
      this.words = defaultWords // Fallback if all words were empty
    }
    this.mode = config.mode || "wheel"
    this.firstWordInterval = config.firstWordInterval || 3000
    this.otherWordInterval = config.otherWordInterval || 500
    this.lastWordInterval = config.lastWordInterval || config.otherWordInterval || 500 // Defaults to otherWordInterval
    this.timingMode = config.timingMode || "pause" // "fixed" = interval from start, "pause" = wait after animation
    this.onRotate = config.onRotate || null
    this.onLetterLand = config.onLetterLand || null // Called when each letter lands on final value

    this.currentIndex = 0
    this.timeoutId = null
    this.lettersLanded = 0 // Track how many letters have finished animating
    this.totalLettersToAnimate = 0
    
    // Base character set for split-flap display (space + alphabet = 27 chars)
    this.baseCharSet = " ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    // Each wheel has 28 notches: base 27 + 1 accent letter (from first word)
    // The accent letter is at index 27

    this.init()
  }

  // Get the character set for a specific wheel position
  // Returns { chars: string, accentChar: string, accentIndex: number }
  getWheelCharSet(position) {
    const firstWord = this.words[0].toUpperCase()
    const accentChar = position < firstWord.length ? firstWord[position] : " "
    return {
      chars: this.baseCharSet + accentChar,
      accentChar: accentChar,
      accentIndex: 27 // Accent is always at position 27
    }
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
    // Find the max word length to determine number of letter slots
    // Ensure we have at least one word and calculate max length correctly
    if (this.words.length === 0) {
      this.maxWordLength = 0
    } else {
      // Calculate max length - ensure we're using actual trimmed word lengths
      const wordLengths = this.words.map(w => String(w).trim().length)
      this.maxWordLength = Math.max(...wordLengths)
    }
    
    // Create the board container
    const boardContainer = document.createElement("div")
    boardContainer.className = "flip-board"
    
    // Create individual letter flaps - exactly maxWordLength, no more, no less
    this.letterFlaps = []
    for (let i = 0; i < this.maxWordLength; i++) {
      const letterContainer = document.createElement("div")
      letterContainer.className = "letter-flap"
      letterContainer.innerHTML = `
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
      `
      boardContainer.appendChild(letterContainer)
      
      this.letterFlaps.push({
        container: letterContainer,
        topStatic: letterContainer.querySelector(".top-static .flap-content"),
        bottomStatic: letterContainer.querySelector(".bottom-static .flap-content"),
        leafFront: letterContainer.querySelector(".flap-leaf-front .flap-content"),
        leafBack: letterContainer.querySelector(".flap-leaf-back .flap-content"),
        leaf: letterContainer.querySelector(".flap-leaf")
      })
    }
    
    this.element.appendChild(boardContainer)
    
    // Set initial letters
    const currentWord = this.words[this.currentIndex].toUpperCase().padEnd(this.maxWordLength, " ")
    this.currentLetters = currentWord.split("")
    
    this.letterFlaps.forEach((flap, i) => {
      const letter = currentWord[i] || " "
      this.setLetterContent(flap, letter, letter)
    })
    
    // Set initial width
    this.updateContainerWidth()
  }

  setLetterContent(flap, currentLetter, nextLetter) {
    flap.topStatic.textContent = nextLetter
    flap.bottomStatic.textContent = currentLetter
    flap.leafFront.textContent = currentLetter
    flap.leafBack.textContent = nextLetter
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
    if (this.mode === "flip") {
      // For flip mode, width should fit exactly to the board content (all flaps)
      // CSS will handle sizing with fit-content, but ensure no min-width constraint
      this.element.style.width = "fit-content"
      this.element.style.minWidth = "0"
      return
    }
    
    // For wheel mode, measure longest word
    const tempMeasure = document.createElement("span")
    tempMeasure.style.position = "absolute"
    tempMeasure.style.visibility = "hidden"
    tempMeasure.style.whiteSpace = "nowrap"
    tempMeasure.style.fontSize = window.getComputedStyle(this.element).fontSize
    tempMeasure.style.fontWeight = "900"
    tempMeasure.style.fontFamily = window.getComputedStyle(this.element).fontFamily
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

    const padding = 60
    const minWidth = 240
    const finalWidth = Math.max(maxWidth + padding, minWidth) 
    this.element.style.width = `${finalWidth}px`
  }

  startRotation() {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Determine interval based on current word position
    let interval
    if (this.currentIndex === 0) {
      interval = this.firstWordInterval
    } else if (this.currentIndex === this.words.length - 1) {
      interval = this.lastWordInterval
    } else {
      interval = this.otherWordInterval
    }

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
    const prevIndex = this.currentIndex
    const currentWord = this.words[this.currentIndex].toUpperCase().padEnd(this.maxWordLength, " ")
    this.currentIndex = (this.currentIndex + 1) % this.words.length
    const nextWord = this.words[this.currentIndex].toUpperCase().padEnd(this.maxWordLength, " ")
    const nextIndex = this.currentIndex

    const currentLetters = currentWord.split("")
    const nextLetters = nextWord.split("")

    if (this.onRotate) this.onRotate(this.currentIndex, false)

    // Reset letter tracking for "pause" timing mode
    this.lettersLanded = 0
    this.totalLettersToAnimate = this.letterFlaps.length

    // Cascade through each letter with a delay
    const cascadeDelay = 40 // ms between each letter position starting
    const flipSpeed = 35 // ms per individual flip through the rolodex

    this.letterFlaps.forEach((flap, i) => {
      const fromLetter = currentLetters[i] || " "
      const toLetter = nextLetters[i] || " "

      // Delay start of each letter's cascade
      setTimeout(() => {
        this.cycleLetterToTarget(flap, i, fromLetter, toLetter, flipSpeed, nextIndex)
      }, i * cascadeDelay)
    })

    // In "fixed" mode, schedule next rotation immediately (based on interval from now)
    // In "pause" mode, wait until all letters land, then schedule (handled in onLetterComplete)
    if (this.timingMode === "fixed") {
      this.startRotation()
    }
  }

  // Called when a letter completes its full animation cycle
  onLetterComplete() {
    this.lettersLanded++
    
    // In "pause" mode, schedule next rotation only after ALL letters have landed
    if (this.timingMode === "pause" && this.lettersLanded >= this.totalLettersToAnimate) {
      if (this.onRotate) this.onRotate(this.currentIndex, true)
      this.startRotation()
    }
  }

  // Get number of flips needed to go from one position to another on a wheel
  getFlipCountOnWheel(wheelCharSet, fromIdx, toIdx) {
    if (fromIdx === toIdx) return 0
    
    const wheelSize = wheelCharSet.length // Should be 28
    
    // Always cycle forward (like a real rolodex)
    if (toIdx > fromIdx) {
      return toIdx - fromIdx
    } else {
      // Wrap around
      return (wheelSize - fromIdx) + toIdx
    }
  }

  // Get the next character on a specific wheel
  getNextCharOnWheel(wheelCharSet, currentIdx) {
    return (currentIdx + 1) % wheelCharSet.length
  }

  // Find where a character is on this wheel (could be regular or accent position)
  findCharOnWheel(wheelCharSet, char, isAccent) {
    if (isAccent) {
      // Accent is always at position 27
      return 27
    }
    // Regular letter is in base positions 0-26
    const idx = this.baseCharSet.indexOf(char)
    return idx >= 0 ? idx : 0
  }

  // Cycle a letter through all intermediate characters to reach the target
  cycleLetterToTarget(flap, letterIndex, fromLetter, toLetter, flipSpeed, wordIndex) {
    const wheel = this.getWheelCharSet(letterIndex)
    const wheelChars = wheel.chars
    
    // Determine if we're targeting the accent position (first word only)
    const isTargetAccent = (wordIndex === 0) && (toLetter === wheel.accentChar) && (wheel.accentChar !== " ")
    
    // Determine if we're coming from the accent position
    const prevWordIndex = (wordIndex - 1 + this.words.length) % this.words.length
    const isFromAccent = (prevWordIndex === 0) && (fromLetter === wheel.accentChar) && (wheel.accentChar !== " ")
    
    // Find positions on the wheel
    const fromIdx = this.findCharOnWheel(wheelChars, fromLetter, isFromAccent)
    const toIdx = this.findCharOnWheel(wheelChars, toLetter, isTargetAccent)
    
    const flipCount = this.getFlipCountOnWheel(wheelChars, fromIdx, toIdx)
    
    // IMMEDIATELY reset color to non-accent when starting animation
    // This prevents accent color from persisting during the cycling animation
    if (this.onLetterLand && flipCount > 0) {
      this.onLetterLand(letterIndex, fromLetter, wordIndex, false) // false = not accent during cycling
    }
    
    if (flipCount === 0) {
      // No change needed, but still notify that this letter is "landed"
      if (this.onLetterLand) {
        this.onLetterLand(letterIndex, toLetter, wordIndex, isTargetAccent)
      }
      this.onLetterComplete()
      return
    }

    let currentIdx = fromIdx
    let flipsRemaining = flipCount

    const doOneFlip = () => {
      const nextIdx = this.getNextCharOnWheel(wheelChars, currentIdx)
      const nextChar = wheelChars[nextIdx]
      const currentChar = wheelChars[currentIdx]
      flipsRemaining--
      const isFinal = flipsRemaining === 0

      this.performSingleFlip(flap, currentChar, nextChar, flipSpeed, () => {
        currentIdx = nextIdx
        
        if (isFinal) {
          // This letter has landed on its final value
          if (this.onLetterLand) {
            this.onLetterLand(letterIndex, toLetter, wordIndex, isTargetAccent)
          }
          this.onLetterComplete()
        } else {
          // Continue to next flip
          doOneFlip()
        }
      })
    }

    doOneFlip()
  }

  // Perform a single flip animation
  performSingleFlip(flap, fromChar, toChar, duration, onComplete) {
    // Set up the flip content
    this.setLetterContent(flap, fromChar, toChar)

    // Reset leaf position without transition
    flap.leaf.style.transition = "none"
    flap.leaf.classList.remove("flipping")
    
    // Force reflow
    void flap.leaf.offsetWidth

    // Start animation
    flap.leaf.style.transition = `transform ${duration}ms linear`
    flap.leaf.classList.add("flipping")

    // After animation finish, sync the states
    setTimeout(() => {
      flap.bottomStatic.textContent = toChar
      flap.leafFront.textContent = toChar
      
      flap.leaf.style.transition = "none"
      flap.leaf.classList.remove("flipping")
      
      if (onComplete) onComplete()
    }, duration)
  }

  setMode(newMode) {
    this.mode = newMode
    this.element.setAttribute("data-mode", newMode)
    
    // Reinitialize layout
    this.init()
  }

  setWords(newWords) {
    // Ensure all words are trimmed and non-empty
    this.words = newWords.map(w => String(w).trim()).filter(w => w.length > 0)
    this.currentIndex = 0

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Reinitialize
    this.init()
  }

  setIntervals(firstWordInterval, otherWordInterval, lastWordInterval) {
    this.firstWordInterval = firstWordInterval
    this.otherWordInterval = otherWordInterval
    if (lastWordInterval !== undefined) {
      this.lastWordInterval = lastWordInterval
    } else {
      this.lastWordInterval = otherWordInterval // Default to otherWordInterval if not provided
    }
  }

  setTimingMode(mode) {
    this.timingMode = mode // "fixed" or "pause"
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
