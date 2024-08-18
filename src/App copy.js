// import { ref, set, push, onValue, update, get } from "firebase/database";
// import { database } from './firebaseConfig'; // Adjust this import based on where your firebaseConfig.js is located

// import { useState, useEffect } from 'react';
// import {Typography} from "@mui/material"

// function generateUniqueId() {
//   return Math.random().toString(36).substring(2, 9);

// }

// // create new game
// function createGame(playerId, setGameId) {

//   try {

//     const newGameRef = push(ref(database, 'games'));
//     const newGameId = newGameRef.key;
// console.log("newGameId:", newGameId);

//     set(newGameRef, {
//       board: Array(9).fill(null),
//       players: [playerId],
//       currentTurn: 0,
//       status: "waiting"
//     }).then(() => {
//       setGameId(newGameId);
//     }).catch((error) => {
//       console.error("Error creating game: ", error);
//     })
//   } catch (error) {
//     console.log("error: ", error);

//   }
// }

// // Join an existing game
// function joinGame(gameId, playerId, setGameJoined) {
//   try {
//     const gameRef = ref(database, `games/${gameId}`);

//     get(gameRef).then((snapshot) => {
//       if (snapshot.exists()) {

//         const gameData = snapshot.val();
//         if (gameData.players.length < 2) {

//           update(gameRef, {
//             players: [...gameData.players, playerId],
//             status: "in_progress"
//           }).then(() => {
//             setGameJoined(true);
//           }).catch((error) => {
//             console.error("Error joining game: ", error);
//           });
//         } else {
//           console.log("Game is full");
//         }

//       } else {
//         console.log("Game does not exist");
//       }
//     }).catch((error) => {
//       console.error("Error checking game: ", error);
//     });
//   } catch (error) {
//     console.log("error: ", error);

//   }
// }

// // Make a move
// function makeMove(gameId, playerId, cellIndex) {
//   try {
//     const gameRef = ref(database, `games/${gameId}`);

//     get(gameRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const game = snapshot.val();

//         if (game.status === 'in_progress' &&
//           game.players[game.currentTurn] === playerId &&
//           game.board[cellIndex] === null) {
//           const newBoard = [...game.board];
//           newBoard[cellIndex] = game.currentTurn === 0 ? 'X' : 'O';
//           update(gameRef, {
//             board: newBoard,
//             currentTurn: 1 - game.currentTurn
//           }).catch((error) => {
//             console.error("Error making move: ", error);
//           })
//           // Check for win or draw here and update game.status if needed
//         }
//       }
//     }).catch((error) => {
//       console.error("Error checking game for move: ", error);
//     });
//   } catch (error) {
//     console.log("error: ", error);

//   }
// }

// // Listen to game changes
// function useGameListener(gameId) {
//   const [gameData, setGameData] = useState(null);

//   useEffect(() => {
//     if (!gameId) return;

//     const gameRef = ref(database, `games/${gameId}`);
//     const unsubscribe = onValue(gameRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setGameData(snapshot.val());
//       } else {
//         setGameData(null);
//       }
//     });

//     // Cleanup function
//     return () => unsubscribe();
//   }, [gameId]);

//   return gameData;

// }


// export default function TicTacToe() {
//   const [playerId] = useState(generateUniqueId());
//   const [gameId, setGameId] = useState(null);
//   const [gameJoined, setGameJoined] = useState(false);

//   const gameData = useGameListener(gameId);

//   const handleCreateGame = () => {
//     console.log("create");

//     createGame(playerId, setGameId);
//     console.log("gameId", gameId);
    
//   };

//   const handleJoinGame = () => {
//     if (gameId) {
//       joinGame(gameId, playerId, setGameJoined);
//     }
//   };

//   const handleCellClick = (index) => {
//     if (gameId && gameJoined) {
//       makeMove(gameId, playerId, index);
//     }
//   };

//   useEffect (() => {

//   }, [gameId, playerId])

//   return (
//     <div>
//       {!gameId && (
//         <button onClick={handleCreateGame}>Create Game</button>
//       )}
//       {gameId && !gameJoined && (
//         <div>
//           <Typography > {gameId}</Typography>
//           <input
//             value={gameId}
//             onChange={(e) => setGameId(e.target.value)}
//             placeholder="Enter Game ID"
//           />
//           <button onClick={handleJoinGame}>Join Game</button>
//         </div>
//       )}
//       {gameData && (
//         <div>
//           {/* Render your game board here using gameData */}
//           {gameData.board.map((cell, index) => (
//             <button key={index} onClick={() => handleCellClick(index)}>
//               {cell || '-'}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }