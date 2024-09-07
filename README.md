# Tic-Tac-Toe Multiplayer Game

A multiplayer Tic-Tac-Toe game built with React and Firebase. This game allows players to create or join existing games, and play against each other in real-time.

## Features

- **Multiplayer**: Play against a friend by creating or joining a game.
- **Real-time Gameplay**: Thanks to Firebase, the game updates in real-time.
- **Random Game**: Join a random game if you're looking for a quick match.
- **Persistent Player ID**: Player ID is stored locally to maintain player identification across sessions.
- **Game Status**: The game board and winner are displayed dynamically based on the game progress.
- **Game Reset**: Option to restart the game or start a new game after finishing.
- **Customizable Player ID**: Players can update their unique ID.

## Prerequisites

To run this project, you will need the following:

- Node.js
- Firebase Project (Realtime Database or Firestore enabled)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tic-tac-toe.git
cd tic-tac-toe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

- Create a Firebase project at [firebase.google.com](https://firebase.google.com).
- Enable Firestore or Realtime Database.
- Copy your Firebase configuration and create a `firebaseConfig.js` file in the project root:

```js
// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 4. Start the Development Server

```bash
npm start
```

This will start the development server at `http://localhost:3000`.

## How to Play

1. **Create a New Game**: Click on the "Create New Game" button to generate a new game session.
2. **Join an Existing Game**: Use the game ID to join an existing game by clicking "Join Existing Game."
3. **Join Random Game**: Click "Join Random Game" to automatically join a random game with available players.
4. **Play the Game**: Players take turns marking the grid. The first to get three in a row wins!
5. **Game Reset**: After a game ends, you can reset the game or return to the menu to start over.

## Folder Structure

```
tic-tac-toe/
├── public/
├── src/
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions (createGame, joinGame, etc.)
│   ├── firebaseConfig.js    # Firebase configuration
│   └── App.js               # Main application file
├── .gitignore
├── package.json
├── README.md
└── index.html
```

## Technologies Used

- **React**: Front-end UI library
- **Firebase**: For real-time database and game state management
- **Material UI**: UI components library
- **React Toastify**: For displaying notifications
- **JavaScript**: Programming language
- **CSS**: Styling

## Contributing

Feel free to fork this project and create pull requests if you have any improvements or suggestions. Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

If you have any questions or need support, you can reach out to the creator:

- **Sandy Mohammed**: [LinkedIn Profile](https://www.linkedin.com/in/sandy-mohammed-developer/)
