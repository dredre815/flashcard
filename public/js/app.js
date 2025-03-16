document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const shuffleBtn = document.getElementById("shuffleBtn");
  const flashcard = document.getElementById("flashcard");
  const questionText = document.getElementById("questionText");
  const answerText = document.getElementById("answerText");
  const prevBtn = document.getElementById("prevBtn");
  const flipBtn = document.getElementById("flipBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressSpan = document.getElementById("progress");
  const themeBtn = document.getElementById("themeBtn");
  const themeSwitcher = document.querySelector(".theme-switcher");
  const themeOptions = document.querySelectorAll(".theme-option");
  const keyboardShortcuts = document.querySelector(".keyboard-shortcuts");
  const animationBtn = document.getElementById("animationBtn");
  const animationSwitcher = document.querySelector(".animation-switcher");
  const animationOptions = document.querySelectorAll(".animation-option");

  // App State
  let cards = [];
  let currentCardIndex = 0;
  let isFlipping = false; // To prevent multiple flips at once
  let currentTheme = "system"; // Default theme
  let currentAnimation = "slide"; // Default animation
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let isSwiping = false;

  // Initialize
  init();
  initTheme();
  initAnimationSwitcher();
  detectMobileDevice();
  setupRippleEffect();

  async function init() {
    try {
      // Show loading animation
      showLoading(true);

      try {
        // Check if cards data is accessible
        await checkServerHealth();
      } catch (error) {
        console.warn(
          "Health check failed, still trying to load cards:",
          error.message
        );
      }

      // Load all cards directly
      await loadAllCards();

      // Hide loading animation
      showLoading(false);
    } catch (error) {
      console.error("Error initializing app:", error);
      questionText.textContent = "Error loading flashcards. Please try again.";
      showLoading(false);

      // Show error message with retry button
      showErrorWithRetry(error.message);
    }
  }

  // Detect if user is on a mobile device
  function detectMobileDevice() {
    // Check if device is touch-only (most mobile devices)
    if (window.matchMedia("(hover: none)").matches) {
      document.body.classList.add("mobile-device");

      // Enhanced touch support
      setupTouchEvents();
    }
  }

  // Setup ripple effect for buttons
  function setupRippleEffect() {
    const buttons = document.querySelectorAll("button");

    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        const x = e.clientX - this.getBoundingClientRect().left;
        const y = e.clientY - this.getBoundingClientRect().top;

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // Setup enhanced touch events for mobile
  function setupTouchEvents() {
    // Touch events for card flipping and navigation
    flashcard.addEventListener("touchstart", handleTouchStart, false);
    flashcard.addEventListener("touchmove", handleTouchMove, false);
    flashcard.addEventListener("touchend", handleTouchEnd, false);

    // Prevent scrolling when touching the flashcard
    flashcard.addEventListener(
      "touchmove",
      function (e) {
        if (isSwiping) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }

  function handleTouchMove(e) {
    if (!isSwiping) return;

    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    // Calculate the horizontal difference
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);

    // If horizontal swipe is significant and more than vertical movement
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > diffY) {
      // Apply a transform effect during the swipe
      const swipePercent = Math.min(Math.abs(diffX) / 100, 0.3);
      const direction = diffX > 0 ? -1 : 1; // -1 for left, 1 for right

      // Apply transformation only if not flipped (to avoid confusion)
      if (!flashcard.classList.contains("flipped")) {
        flashcard.style.transform = `translateX(${
          direction * swipePercent * 40
        }px) rotate(${direction * swipePercent * 5}deg)`;
      }
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) return;

    // Reset transformation
    flashcard.style.transform = "";

    // Calculate the horizontal difference
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);

    // Check for tap (small movement in any direction)
    if (Math.abs(diffX) < 20 && diffY < 20) {
      // Tap - flip the card
      flipCard();
    }
    // Horizontal swipe detection with threshold and more horizontal than vertical
    else if (Math.abs(diffX) > 80 && Math.abs(diffX) > diffY) {
      // Right to left swipe
      if (diffX > 0) {
        // Next card
        goToNextCard();
      }
      // Left to right swipe
      else {
        // Previous card
        goToPrevCard();
      }
    }

    isSwiping = false;
  }

  // Initialize theme
  function initTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("flashcardTheme");
    if (savedTheme) {
      currentTheme = savedTheme;
      applyTheme(currentTheme);
    } else {
      // Default to system theme
      applyTheme("system");
    }

    // Mark the active theme option
    updateActiveThemeOption();

    // Theme dropdown toggle
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      themeSwitcher.classList.toggle("active");
      themeSwitcher.querySelector(".dropdown-menu").classList.toggle("active");

      // Close animation dropdown if open
      animationSwitcher.classList.remove("active");
      animationSwitcher
        .querySelector(".dropdown-menu")
        .classList.remove("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      themeSwitcher.classList.remove("active");
      themeSwitcher.querySelector(".dropdown-menu").classList.remove("active");
      animationSwitcher.classList.remove("active");
      animationSwitcher
        .querySelector(".dropdown-menu")
        .classList.remove("active");
    });

    // Theme option selection
    themeOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        const theme = option.dataset.theme;
        currentTheme = theme;
        applyTheme(theme);
        updateActiveThemeOption();
        localStorage.setItem("flashcardTheme", theme);
        themeSwitcher.classList.remove("active");
        themeSwitcher
          .querySelector(".dropdown-menu")
          .classList.remove("active");
      });
    });

    // Update theme icon based on current theme
    updateThemeIcon();
  }

  // Apply theme to the document
  function applyTheme(theme) {
    if (theme === "system") {
      // Check system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
      }

      // Listen for system theme changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (currentTheme === "system") {
            document.documentElement.setAttribute(
              "data-theme",
              e.matches ? "dark" : "light"
            );
            updateThemeIcon();
          }
        });
    } else {
      document.documentElement.setAttribute("data-theme", theme);

      if (theme === "dark") {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
      } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
      }
    }
    updateThemeIcon();
  }

  // Update the active theme option in the dropdown
  function updateActiveThemeOption() {
    themeOptions.forEach((option) => {
      if (option.dataset.theme === currentTheme) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });
  }

  // Update theme button icon based on current theme
  function updateThemeIcon() {
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    if (isDarkMode) {
      themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Add a subtle animation to the icon
    themeBtn.querySelector("i").classList.add("animated");
    setTimeout(() => {
      themeBtn.querySelector("i")?.classList.remove("animated");
    }, 500);
  }

  // Show/hide loading animation
  function showLoading(isLoading) {
    if (isLoading) {
      flashcard.classList.add("loading");
      questionText.textContent = "Loading flashcards...";
      answerText.textContent = "";
    } else {
      flashcard.classList.remove("loading");
    }
  }

  // Check server and database health - modified for static GitHub Pages
  async function checkServerHealth() {
    try {
      // For GitHub Pages, we'll just check if the cards.json file exists
      const response = await fetch("data/cards.json", { method: "HEAD" });

      if (!response.ok) {
        throw new Error(`Failed to access cards data: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Health check error:", error);
      throw new Error(
        "Unable to load flashcard data. Please check your connection and try again."
      );
    }
  }

  // Load all cards from static JSON file
  async function loadAllCards() {
    try {
      // Fetch cards from static JSON file (for GitHub Pages)
      const response = await fetch("data/cards.json");

      if (!response.ok) {
        throw new Error(`Failed to load cards: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.cards || data.cards.length === 0) {
        throw new Error("No flashcards available.");
      }

      cards = data.cards;

      // Randomize the initial order
      shuffleCards();

      // Update display
      updateCardDisplay();
      updateProgress();

      // Add a subtle animation to show cards are loaded
      flashcard.classList.add("deck-changed");
      setTimeout(() => {
        flashcard.classList.remove("deck-changed");
      }, 500);

      console.log(`Loaded ${cards.length} cards from static file`);
      return cards;
    } catch (error) {
      console.error("Error loading cards:", error);
      throw new Error(`Error loading flashcards: ${error.message}`);
    }
  }

  // Show error message with retry button
  function showErrorWithRetry(errorMessage) {
    // Create error container if it doesn't exist
    let errorContainer = document.querySelector(".error-container");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.className = "error-container";
      document.querySelector(".card-container").prepend(errorContainer);
    }

    // Clear previous content
    errorContainer.innerHTML = "";

    // Create error message
    const errorText = document.createElement("p");
    errorText.className = "error-message";
    errorText.textContent =
      errorMessage || "An error occurred while loading flashcards.";

    // Create retry button
    const retryButton = document.createElement("button");
    retryButton.className = "btn-primary retry-button";
    retryButton.innerHTML = '<i class="fas fa-sync-alt"></i> Retry';
    retryButton.addEventListener("click", () => {
      errorContainer.remove();
      init();
    });

    // Append elements
    errorContainer.appendChild(errorText);
    errorContainer.appendChild(retryButton);
  }

  // Update the displayed card
  function updateCardDisplay() {
    if (cards.length === 0) {
      questionText.textContent = "No flashcards available.";
      answerText.textContent = "";
      return;
    }

    // Get current card
    const currentCard = cards[currentCardIndex];

    // Reset flip state
    flashcard.classList.remove("flipped");
    isFlipping = false;

    // Add animation for card change
    flashcard.classList.add("card-changed");
    setTimeout(() => {
      flashcard.classList.remove("card-changed");
    }, 300);

    // Update text content after a slight delay for animation
    setTimeout(() => {
      questionText.textContent = currentCard.front || "No question available";
      answerText.textContent = currentCard.back || "No answer available";

      // Update known status if needed
      if (currentCard.known === 1) {
        flashcard.classList.add("known");
      } else {
        flashcard.classList.remove("known");
      }
    }, 150);

    // Update progress
    updateProgress();
  }

  // Flip the card with animation
  function flipCard() {
    if (isFlipping) return;

    isFlipping = true;
    flashcard.classList.toggle("flipped");

    // Reset flipping state after animation completes
    setTimeout(() => {
      isFlipping = false;
    }, 800); // Match the duration of the flip animation
  }

  // Update progress display with graphical progress bar
  function updateProgress() {
    const progressFill = document.getElementById("progressFill");
    const progressPercentage = document.getElementById("progressPercentage");
    const progressFraction = document.getElementById("progressFraction");

    if (cards.length === 0) {
      progressFraction.textContent = "0/0";
      progressPercentage.textContent = "0%";
      progressFill.style.width = "0%";
    } else {
      const currentPosition = currentCardIndex + 1;
      const total = cards.length;
      const percentage = Math.round((currentPosition / total) * 100);

      progressFraction.textContent = `${currentPosition}/${total}`;
      progressPercentage.textContent = `${percentage}%`;

      // Animate the progress bar fill
      progressFill.style.width = `${percentage}%`;
    }
  }

  // Shuffle the cards
  function shuffleCards() {
    if (cards.length <= 1) return;

    // Fisher-Yates shuffle algorithm
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Reset current card index
    currentCardIndex = 0;

    // Add shuffling animation
    flashcard.classList.add("shuffling");
    setTimeout(() => {
      flashcard.classList.remove("shuffling");
      updateCardDisplay();
    }, 500);
  }

  // Navigation functions
  function goToPrevCard() {
    if (cards.length === 0) return;

    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateCardDisplay();
    } else {
      // At the beginning, show boundary animation
      flashcard.classList.add("at-boundary");
      setTimeout(() => {
        flashcard.classList.remove("at-boundary");
      }, 300);
    }
  }

  function goToNextCard() {
    if (cards.length === 0) return;

    if (currentCardIndex < cards.length - 1) {
      currentCardIndex++;
      updateCardDisplay();
    } else {
      // At the end, show boundary animation
      flashcard.classList.add("at-boundary");
      setTimeout(() => {
        flashcard.classList.remove("at-boundary");
      }, 300);
    }
  }

  // Event Listeners
  shuffleBtn.addEventListener("click", shuffleCards);
  flipBtn.addEventListener("click", flipCard);

  // Also flip card when clicking on it (only on non-touch devices)
  flashcard.addEventListener("click", (e) => {
    // Only if it's not a mobile device (to avoid conflicts with touch events)
    if (!window.matchMedia("(hover: none)").matches) {
      flipCard();
    }
  });

  prevBtn.addEventListener("click", goToPrevCard);
  nextBtn.addEventListener("click", goToNextCard);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        goToPrevCard();
        break;
      case "ArrowRight":
        goToNextCard();
        break;
      case " ":
        e.preventDefault(); // Prevent page scrolling on space
        flipCard();
        break;
    }
  });

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (currentTheme === "system") {
        applyTheme("system");
      }
    });

  // Add media query listener for small screens to hide keyboard shortcuts
  const mobileQuery = window.matchMedia("(max-width: 480px)");

  function handleMobileChange(e) {
    if (e.matches && keyboardShortcuts) {
      keyboardShortcuts.style.display = "none";
    } else if (keyboardShortcuts) {
      keyboardShortcuts.style.display = "flex";
    }
  }

  // Call the handler immediately
  handleMobileChange(mobileQuery);

  // Add the listener
  mobileQuery.addEventListener("change", handleMobileChange);

  // Initialize animation switcher
  function initAnimationSwitcher() {
    // Load saved animation from localStorage
    const savedAnimation = localStorage.getItem("flashcardAnimation");
    if (savedAnimation) {
      currentAnimation = savedAnimation;
    }

    // Apply default animation class
    document.body.classList.add(`transition-${currentAnimation}`);

    // Mark the active animation option
    updateActiveAnimationOption();

    // Animation dropdown toggle
    animationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      animationSwitcher.classList.toggle("active");
      animationSwitcher
        .querySelector(".dropdown-menu")
        .classList.toggle("active");

      // Close theme dropdown if open
      themeSwitcher.classList.remove("active");
      themeSwitcher.querySelector(".dropdown-menu").classList.remove("active");
    });

    // Animation option selection
    animationOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        const animation = option.dataset.animation;

        // Remove old animation class
        document.body.classList.remove(`transition-${currentAnimation}`);

        // Update current animation
        currentAnimation = animation;

        // Add new animation class
        document.body.classList.add(`transition-${currentAnimation}`);

        // Update active animation option
        updateActiveAnimationOption();

        // Save to localStorage
        localStorage.setItem("flashcardAnimation", animation);

        // Close dropdown
        animationSwitcher.classList.remove("active");
        animationSwitcher
          .querySelector(".dropdown-menu")
          .classList.remove("active");

        // Preview animation
        previewAnimation();
      });
    });
  }

  // Update active animation option
  function updateActiveAnimationOption() {
    animationOptions.forEach((option) => {
      if (option.dataset.animation === currentAnimation) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });
  }

  // Preview the selected animation effect
  function previewAnimation() {
    // First remove any existing animation classes
    flashcard.classList.remove("card-changed");

    // Trigger reflow
    void flashcard.offsetWidth;

    // Add animation class
    flashcard.classList.add("card-changed");
  }
});
