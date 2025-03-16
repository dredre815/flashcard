# Software Engineering Flashcard App

A modern, responsive web application for studying software engineering concepts using flashcards sourced from [John Washam's Coding Interview University](https://github.com/jwasham/coding-interview-university/tree/main).

## Features

- **Intuitive Interface**: Clean, modern UI with support for both desktop and mobile devices
- **Theme Support**: Choose between light, dark, and system theme preferences
- **Animation Effects**: Multiple transition animations for card navigation
- **Touch Gestures**: Swipe left/right to navigate and tap to flip on mobile devices
- **Visual Progress Tracking**: Graphical progress bar shows your position in the deck
- **Rich Content**: Support for formatted text, code blocks, lists, and tables in card content
- **Advanced Typography**: Optimized text rendering for better readability
- **Fully Responsive**: Adapts seamlessly to different screen sizes and orientations
- **Offline Support**: Progressive Web App (PWA) capabilities
- **Keyboard Shortcuts**: Use keyboard navigation for faster study sessions
- **Shuffle**: Randomize the card order for varied study sessions

## Live Demo

Visit the live application: [https://dredre815.github.io/flashcard/](https://dredre815.github.io/flashcard/)

## Installation

### Local Development

1. Make sure you have [Node.js](https://nodejs.org/) installed on your system.

2. Clone or download this repository.

3. Install the dependencies:

   ```
   npm install
   ```

4. Start the application:

   ```
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Deploying to GitHub Pages

1. Fork this repository to your GitHub account.

2. Update the `homepage` field in `package.json` with your GitHub username:

   ```
   "homepage": "https://[your-github-username].github.io/flashcard",
   ```

3. Push to your repository's `main` branch. GitHub Actions will automatically build and deploy the application to GitHub Pages.

4. Your application will be available at:
   ```
   https://[your-github-username].github.io/flashcard/
   ```

## Usage

### Desktop

- Use the **Shuffle** button to randomize card order
- Click on a card or the **Flip Card** button to reveal the answer
- Use the navigation buttons or arrow keys to move between cards
- Toggle between themes using the theme button in the top-right corner
- Change transition animations using the animation button in the top-left corner

### Mobile

- **Tap** on a card to flip it
- **Swipe left** to go to the next card
- **Swipe right** to go to the previous card
- **Shuffle** cards using the shuffle button
- Toggle themes and animations using the respective buttons

## Keyboard Shortcuts

- **Space**: Flip the current card
- **Left Arrow**: Go to the previous card
- **Right Arrow**: Go to the next card

## Database

This application uses a SQLite database containing flashcards sourced from [jwasham's Coding Interview University](https://github.com/jwasham/coding-interview-university/tree/main). The database includes a wide range of software engineering concepts and interview preparation materials.

For the GitHub Pages deployment, the database content is exported to a static JSON file.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**:
  - Local development: Node.js, Express, SQLite
  - GitHub Pages deployment: Static JSON for data

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Flashcard content sourced from [John Washam's Coding Interview University](https://github.com/jwasham/coding-interview-university/tree/main)
- Icons provided by [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
