document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("grid-container");
  const keyboardContainer = document.getElementById("keyboard-container");
  const messageContainer = document.getElementById("message-container");

  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;
  const secretWord = "REACT"; // The word to guess

  let currentRow = 0;
  let currentTile = 0;
  let isGameOver = false;
  let guesses = Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(""));

  // --- Core Game Logic ---

  function getColors(guess) {
    const guessArray = guess.split("");
    const secretArray = secretWord.split("");
    const colors = Array(WORD_LENGTH).fill("grey");
    const secretLetterCount = {};

    // First pass for GREEN letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArray[i] === secretArray[i]) {
        colors[i] = "green";
        secretArray[i] = null; // Mark as used
      }
    }
    
    // Count remaining letters in secret word for yellow checks
    for(const letter of secretArray){
        if(letter){
            secretLetterCount[letter] = (secretLetterCount[letter] || 0) + 1;
        }
    }

    // Second pass for YELLOW letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (colors[i] !== "green") {
        if (secretLetterCount[guessArray[i]] > 0) {
          colors[i] = "yellow";
          secretLetterCount[guessArray[i]]--;
        }
      }
    }

    console.log(`Guess: ${guess}, Colors: ${colors.join(", ")}`);
    return colors;
  }

  function handleSubmit() {
    if (currentTile !== WORD_LENGTH) {
      showMessage("Not enough letters");
      return;
    }

    const currentGuess = guesses[currentRow].join("");
    const colors = getColors(currentGuess);

    // Update UI
    updateGridColors(colors);
    updateKeyboardColors(currentGuess, colors);

    // Check for win condition
    if (colors.every((color) => color === "green")) {
      showMessage("You won! Press Enter to play again.");
      isGameOver = true;
      return;
    }

    // Move to next row or end game
    if (currentRow < MAX_GUESSES - 1) {
      currentRow++;
      currentTile = 0;
    } else {
      showMessage(`Game over! The word was: ${secretWord}`);
      isGameOver = true;
    }
  }

  // --- Input Handling ---

  function handleKeyPress(key) {
    if (isGameOver) {
      if (key === "Enter") {
        restartGame();
      }
      return;
    }

    if (key === "Enter") {
      handleSubmit();
    } else if (key === "Backspace") {
      deleteLetter();
    } else if (key.match(/^[a-zA-Z]$/)) {
      addLetter(key.toUpperCase());
    }
  }

  function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
      guesses[currentRow][currentTile] = letter;
      const tileElement = document.getElementById(`tile-${currentRow}-${currentTile}`);
      tileElement.textContent = letter;
      currentTile++;
    }
  }

  function deleteLetter() {
    if (currentTile > 0) {
      currentTile--;
      guesses[currentRow][currentTile] = "";
      const tileElement = document.getElementById(`tile-${currentRow}-${currentTile}`);
      tileElement.textContent = "";
      showMessage(""); // Clear any error messages
    }
  }

  // --- UI Updates & Game State ---

  function updateGridColors(colors) {
    for (let i = 0; i < WORD_LENGTH; i++) {
      const tileElement = document.getElementById(`tile-${currentRow}-${i}`);
      tileElement.classList.add(colors[i]);
    }
  }

  function updateKeyboardColors(guess, colors) {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const color = colors[i];
        const keyElement = document.querySelector(`.key[data-key="${letter}"]`);

        if (!keyElement) continue;

        const currentKeyColor = keyElement.classList.contains('green') ? 'green' :
                                keyElement.classList.contains('yellow') ? 'yellow' :
                                keyElement.classList.contains('grey') ? 'grey' : '';

        if (color === 'green' || (color === 'yellow' && currentKeyColor !== 'green')) {
            keyElement.classList.remove('yellow', 'grey');
            keyElement.classList.add(color);
        } else if (color === 'grey' && !currentKeyColor) {
            keyElement.classList.add('grey');
        }
    }
  }


  function showMessage(message) {
    messageContainer.textContent = message;
  }
  
  function restartGame() {
    // Reset state variables
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;
    guesses = Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(""));

    // Clear UI
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('green', 'yellow', 'grey');
    });

    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('green', 'yellow', 'grey');
    });

    showMessage('');
  }


  // --- Initialization ---

  function createGrid() {
    for (let r = 0; r < MAX_GUESSES; r++) {
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `tile-${r}-${c}`;
        gridContainer.appendChild(tile);
      }
    }
  }

  function createKeyboard() {
    const keys = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
    ];

    keys.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("keyboard-row");
      row.forEach((key) => {
        const button = document.createElement("button");
        button.classList.add("key");
        button.dataset.key = key;

        if (key === "Enter") {
            button.textContent = key;
            button.classList.add("large");
        } else if (key === "Backspace") {
            // Use an SVG Icon for backspace
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M360-200q-20 0-37.5-9T294-234L120-480l174-246q11-16 28.5-25t37.5-9h400q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H360Zm400-80v-400 400ZM202-480l144 200h414v-400H346L202-480Zm518-200v-400 400Z"/></svg>';
            button.classList.add("large");
        } else {
            button.textContent = key;
        }
        
        button.addEventListener('click', () => handleKeyPress(key));
        rowDiv.appendChild(button);
      });
      keyboardContainer.appendChild(rowDiv);
    });
  }
  
  // Start the game
  createGrid();
  createKeyboard();
  
  // Listen for physical keyboard input
  document.addEventListener('keydown', (e) => handleKeyPress(e.key));
});