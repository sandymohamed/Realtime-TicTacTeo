import { useState, useEffect } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Adjust this import based on where your firebaseConfig.js is located

// Listen to game changes
  export function useGameListener(gameId, playerId, setGameJoined) {
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