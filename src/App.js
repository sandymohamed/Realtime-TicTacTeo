import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Grid, Link, Stack, TextField, Typography } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig'; // Adjust this import based on where your firebaseConfig.js is located
import { useGameListener } from './hooks/useGameListener';
import { createGame, debounce, generateUniqueId, joinExistGame, joinGame, makeMove, ResetGame, UPDPlayerId } from './utilis';
import { ToastContainer } from 'react-toastify';


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

  const menu = () => {
    setGameId(null);
    setGameJoined(false);
    setGameCreated(false);
    setJoinExist(false);
    setGameStarted(false);
    setWinner(null);
    // setEnd(false);
    gameData = null;
    localStorage.removeItem('gameId');

  }

  const restart = () => {
    setWinner(null);
    ResetGame(gameId);

  }



  const handlePlayerId = () => {
    const localPlayerId = localStorage.getItem('playerId');

    if (!localPlayerId) {
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
    const game = gameSnap?.data();

    if (game) {

      if (game.status === "completed" && game.winner) {
        setWinner(game.winner);
        setGameStarted(false);
        // setEnd(true);
      }
      else if (game.status === "completed" && !game.winner) {
        setGameStarted(false);
      }
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

  }, [gameData]);


  useEffect(() => {

    if (gameId) {
      localStorage.setItem('gameId', gameId);
    }
    const localGameId = localStorage.getItem('gameId');

    if (localGameId) {
      setGameId(localGameId);
    }

  }, [gameId])


  const debouncedUpdatePlayerId = debounce(async (gameId, oldPlayerId, newPlayerId) => {
    let updPlayer;

    if (gameId && oldPlayerId && newPlayerId) {
      updPlayer = await UPDPlayerId(gameId, oldPlayerId, newPlayerId);
    }

    if (updPlayer) {

      setPlayerId(newPlayerId);
      localStorage.setItem('playerId', newPlayerId);
    }


  }, 1000);

  return (<>
    <Stack xs={12} md={8} sx={{ height: "85vh", alignItems: "center", justifyContent: "flex-start", my: 5 }} >
      <ToastContainer />

      <Box sx={{ display: 'flex', flexDirection: "column", alignItems: 'flex-start' }}>
        <Box sx={{ mx: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          <Typography > Player ({gameData?.players[0] === playerId ? 'X' : 'O'}) : </Typography>
          {playerId &&
            <TextField
              id="filled-required"
              label="Player"
              defaultValue={playerId}
              onChange={(e) => {
                debouncedUpdatePlayerId(gameId, playerId, e.target.value)
              }}
              placeholder={playerId}
              sx={{ mx: 1 }}
            />}
        </Box>
        <Typography sx={{ mx: 3, mt: 3 }}>Game: {gameId}</Typography>
      </Box>
      {/* {gameId } *{gameData.players.length } *{ gameData?.status === "waiting" } *{ !gameJoined} */}
      {(gameId && gameData && gameData?.status === "waiting" && gameJoined) && <>
        <Typography sx={{ my: 6, display: 'flex', flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          Waitnig another player to join this session with you
        </Typography>
        <br /> <CircularProgress />
        <Button variant="contained" onClick={restart} > Start Over</Button>
      </>}

      {!gameId && (
        <Stack direction="row" sx={{ width: "100%", my: 5, alignItems: "center", justifyContent: "center" }}>
          <Grid container spacing={2} sx={{ width: "80%", alignItems: "center", justifyContent: "center", }}>
            <Grid item>
              <Button variant="contained" onClick={handleCreateGame}>New Game</Button>
            </Grid>
            <Grid item>

              <Button variant="contained" onClick={handleJoinExistGame}>Join Existing Game</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleJoinRandomGame}>Join Random Game</Button>
            </Grid >
          </Grid >

        </Stack>

      )
      }

      {
        (joinExist && !gameJoined) && (
          <Box sx={{ my: 5 }}>
            <TextField
              fullWidth
              value={gameId || ''}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
            />
            <Button variant="contained" onClick={handleJoinGame} >Join Game</Button>
          </Box>
        )
      }
      {
        (gameData && gameStarted) && (
          <Grid container spacing={2} sx={{ width: { xs: '80%', sm: '30%' }, my: 10, alignItems: "center", justifyContent: "center" }}  >
            {/* Render your game board here using gameData */}
            {gameData.board.map((cell, index) => (
              <Grid item xs={4} key={index}>
                <Button variant="contained" onClick={() => handleCellClick(index)}>
                  {cell || '-'}
                </Button>
              </Grid>
            ))}
            {/* <Button variant="contained" sx={{ my: 6 }} onClick={restart} >Reset Game</Button> */}
          </Grid>
        )
      }
      {
        (winner && gameId) && (
          <Typography sx={{ mx: 3, my: 5 }}>Player {winner} wins</Typography>
        )
      }
      {gameId &&
        <Grid container spacing={2} sx={{ width: "80%", alignItems: "center", justifyContent: "center", my: 3 }}>
          <Grid item>
            <Button variant="contained" color="warning" onClick={menu} >Menu</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={restart} >Play Again</Button>
          </Grid>
        </Grid >}

    </Stack >



    <Box sx={{ display: "flex", alignItems: 'end', justifyContent: "center" }}>
      <Link href="https://www.linkedin.com/in/sandy-mohammed-developer/"> Sandy Mohammed </Link>
    </Box>
  </>

  );
}