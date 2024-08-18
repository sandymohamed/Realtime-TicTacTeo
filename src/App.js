import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Grid, Stack, TextField, Typography } from "@mui/material";
import { doc, updateDoc, getDoc, onSnapshot, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from './firebaseConfig'; // Adjust this import based on where your firebaseConfig.js is located

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Create a new game
async function createGame(playerId, setGameId) {
  console.log("in create");

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
async function joinExistGame(playerId, setGameId, setGameJoined) {
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

console.log("findGame:", findGame);

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
async function joinGame(gameId, playerId, setGameJoined) {
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
        console.log("Game is full");
      }
    } else {
      console.log("Game does not exist");
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
async function makeMove(gameId, playerId, cellIndex, setWinner) {
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

// Listen to game changes
function useGameListener(gameId, playerId, setGameJoined) {
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGameData(data);
        if (data.players.includes(playerId) && data.players.length === 2) {
          setGameJoined(true);
        }
      } else {
        setGameData(null);
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, [gameId, playerId, setGameJoined]);

  return gameData;
}

export default function TicTacToe() {
  const [playerId, setPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameJoined, setGameJoined] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);
  const [joinExist, setJoinExist] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  // const [end, setEnd] = useState(false);

  let gameData = useGameListener(gameId, playerId, setGameJoined);

  const restart =() => {
    setGameId(null);
    setGameJoined(false);
    setGameCreated(false);
    setJoinExist(false);
    setGameStarted(false);
    setWinner(null);
    // setEnd(false);
    gameData = null;

    console.log("gameData", gameData)

  }


  const handlePlayerId= () => {
    const localPlayerId = localStorage.getItem('playerId');
 
    if(!localPlayerId) {
      const newPlayerID = generateUniqueId();
      localStorage.setItem('playerId', newPlayerID);
    } else {
    setPlayerId(localPlayerId);
    }
    
  }

  const handleCreateGame = () => {
    createGame(playerId, setGameId);
    setGameCreated(true);
  };

  const handleJoinExistGame = () => {
    setJoinExist(true);
  };

  const handleJoinGame = () => {
    if (gameId && !gameCreated) {
      joinGame(gameId, playerId, setGameJoined);
    }
  };

  const handleJoinRandomGame = () => {
    if (!gameId && !gameCreated) {
      joinExistGame(playerId, setGameId, setGameJoined);

    }
  };

  const handleCellClick = (index) => {
    if (gameId && gameJoined) {
      makeMove(gameId, playerId, index, setWinner);
    }
  };

  const checkComplete = async () => {
    const gameRef = doc(db, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    const game = gameSnap.data();

    if (game.status === "completed" && game.winner) {
      setWinner(game.winner);
      setGameStarted(false);
      // setEnd(true);
    }
    else if (game.status === "completed" && !game.winner) {
      setGameStarted(false);
    }
  }

  if (gameData && gameData.status === "in_progress") {

    setInterval(() => {
      checkComplete()
    }, 5000);
  }

  useEffect(() => {
    if (gameData && gameData.players.length === 2 && gameData.status === "in_progress") {
      setGameStarted(true);
    }
    handlePlayerId(); 
    // setEnd(false); 
    console.log("gameData", gameData)
  }, [gameData]);

  return (
    <Stack xs={12} md={8} sx={{ height: "90vh", alignItems: "center", justifyContent: "flex-start", my: 5}} >
      <Typography sx={{ mx: 3 }}>Player: {playerId}</Typography>
      <Typography sx={{ mx: 3 }}>Game: {gameId}</Typography>
     {(gameId && gameData && gameData?.status === "waiting" )&& <>
      <Typography sx={{ my: 6, display: 'flex', flexDirection: "column" ,alignItems: "center", justifyContent: "center" }}>Waitnig another player to join this session with you </Typography>
      <br /> <CircularProgress /> 
      <Button variant="contained" onClick={restart} > Start Over</Button>
     </>
      }
      {!gameId && (
        <Stack direction="row" spacing={3} sx={{ my: 5 }}>
          <Button variant="contained" onClick={handleCreateGame}>Create Game</Button>
          <Button variant="contained" onClick={handleJoinExistGame}>Join Existing Game</Button>
          <Button variant="contained" onClick={handleJoinRandomGame}>Join Random Game</Button>
        </Stack>

      )}

      {(joinExist && !gameJoined) && (
        <Box sx={{ my: 5 }}>
          <TextField
            fullWidth
            value={gameId || ''}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter Game ID"
          />
          <Button variant="contained" onClick={handleJoinGame} >Join Game</Button>
        </Box>
      )}
      {(gameData && gameStarted) && (
        <Grid container spacing={2} sx={{width: {xs: '80%',sm:'30%'} ,my: 10, alignItems: "center", justifyContent: "center"}}  >
          {/* Render your game board here using gameData */}
          {gameData.board.map((cell, index) => (
            <Grid item xs={4} key={index}>
              <Button variant="contained" onClick={() => handleCellClick(index)}>
                {cell || '-'}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
      {(winner && gameId ) && (
        <Typography sx={{ mx: 3, my: 5 }}>Player {winner} wins</Typography>
      )}
      {( gameData && gameData.status==="completed" ) && (     
        <Button variant="contained" onClick={restart} >Play Again</Button>
      )}
    </Stack>
  );
}