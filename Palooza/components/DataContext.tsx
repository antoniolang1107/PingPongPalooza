// import { createContext, useContext } from 'react';
import React, { useState, createContext } from 'react';

export const PlayerContext = createContext([]);

const PlayerContextProvider = props => {
    const [playerData, setPlayerData] = useState([{key: 0, competitor_name: "test", elo: 1234}]);

    return <PlayerContext.Provider value={{ playerData, setPlayerData }}>{props.children}</PlayerContext.Provider>
}

export default PlayerContextProvider;

// export const PlayerContext = createContext([{key: 0, competitor_name: "test", elo: 1234}]);
// export const PlayerContext = createContext<SlapperDetails | undefined>(undefined);

// export function usePlayerContext() {
//     const [players, setPlayers] = useContext(PlayerContext);

//     if (players === undefined) {
//         throw new Error('usePlayerContext must be used in parent');
//     }
//     console.log("DataContext: ", players);
//     console.log(setPlayers);
//     // console.log("Returning:", [players, setPlayers]);
//     return [players, setPlayers]
//     // return [players];
// }
