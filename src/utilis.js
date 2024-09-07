import { doc, updateDoc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from './firebaseConfig'; // Adjust this import based on where your firebaseConfig.js is located
import { toast } from 'react-toastify';

export function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}


// Debounce function
export function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), delay);
    };
}


// Create a new game
export async function createGame(playerId, setGameId) {
    try {
        const newGameRef = await addDoc(collection(db, "games"), {
            board: Array(9).fill(null),
            players: [playerId],
            currentTurn: 0,
            status: "waiting"
        });
        setGameId(newGameRef.id);
    } catch (error) {
        console.error("Error creating game: ", error);
    }
}

// Join Exist game
export async function joinExistGame(playerId, setGameId, setGameJoined) {
    try {
        const gameSnap = await getDocs(collection(db, "games"));

        // ****update this to be find to not continue
        // await gameSnap.forEach(async (game) => {

        //   console.log(game.id, " => ", game.data().status);
        //   if (game.data().status === "waiting" && game.data().players.length < 2) {

        //     found = true;
        //     const gameRef = doc(db, "games", game.id);

        //     console.log("gameRef:", gameRef)
        //     await updateDoc(gameRef, {
        //       players: [...game.data().players, playerId],
        //       status: "in_progress"
        //     });
        //     setGameJoined(true);
        //     setGameId(game.id);
        //   }
        // });

        let findGame = null;
        gameSnap.forEach((doc) => {

            const gameData = doc.data();
            if (gameData.status === "waiting" && gameData.players.length < 2 && gameData.players[0] !== playerId) {
                findGame = { id: doc.id, ...gameData };
                return false; // Exit the loop once we find a waiting game
            }
        });

        if (findGame) {
            const gameRef = doc(db, "games", findGame.id);
            await updateDoc(gameRef, {
                players: [...findGame.players, playerId],
                status: "in_progress"
            });
            setGameId(findGame.id);
            setGameJoined(true);
        } else {
            createGame(playerId, setGameId)

        }

    } catch (error) {
        console.error("Error creating game: ", error);
    }
}

// Join an existing game
export async function joinGame(gameId, playerId, setGameJoined) {
    const gameRef = doc(db, "games", gameId);
    try {
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
            const gameData = gameSnap.data();
            if (gameData.players.length < 2) {

                await updateDoc(gameRef, {
                    players: [...gameData.players, playerId],
                    status: "in_progress"
                });
                setGameJoined(true);
            } else {
                toast("Game is full");
            }
        } else {
            toast("Game does not exist");
        }
    } catch (error) {
        console.error("Error joining game: ", error);
    }
}

// check if player win
function checkWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
// Make a move
export async function makeMove(gameId, playerId, cellIndex, setWinner) {
    const gameRef = doc(db, "games", gameId);
    try {
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
            const game = gameSnap.data();
            if (game.status === "in_progress" &&
                game.players[game.currentTurn] === playerId &&
                game.board[cellIndex] === null) {

                const newBoard = [...game.board];
                newBoard[cellIndex] = game.currentTurn === 0 ? 'X' : 'O';

                const winner = checkWinner(newBoard);
                let newStatus = winner ? "completed" : "in_progress";

                if (winner) {
                    setWinner(winner);
                }
                if (!newBoard.includes(null)) {
                    newStatus = "completed";
                }

                await updateDoc(gameRef, {
                    board: newBoard,
                    currentTurn: 1 - game.currentTurn,
                    status: newStatus,
                    winner: winner
                });
            }
        }
    } catch (error) {
        console.error("Error making move: ", error);
    }
}
// Update Player Id
export async function UPDPlayerId(gameId, playerId, newPlayerId) {
    const gameRef = doc(db, "games", gameId);
    try {
        const gameSnap = await getDoc(gameRef);


        if (gameSnap.exists()) {
            const game = gameSnap.data();
            const players = game.players || [];
            const index = players?.indexOf(playerId); // Find the index of the current playerId

            if (index !== -1) {
                players[index] = newPlayerId; // Update the player ID in the array

                if (players[0] === players[1]) {
                    toast("Can't Player ID ia already exist")
                    return false;
                }
                else {
                    // Now update the entire players array
                    await updateDoc(gameRef, {
                        players: players
                    });

                    toast('Player ID updated successfully')
                }
                return true;

            }

        }
    } catch (error) {
        return false;
    }
}

//  Reset Game
export async function ResetGame(gameId) {
    const gameRef = doc(db, "games", gameId);
    try {
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {

            await updateDoc(gameRef, {
                board: Array(9).fill(null),
                status: "in_progress",
                winner: null
            });

        }
    } catch (error) {
        console.error(error)
    }
}


