// import { createContext, useContext } from 'react';
import React, { useState, createContext } from 'react';

export const PlayerContext = createContext([]);

const PlayerContextProvider = props => {
    const [playerData, setPlayerData] = useState([{key: 0, competitor_name: "test", elo: 1234}]);

    return <PlayerContext.Provider value={{ playerData, setPlayerData }}>{props.children}</PlayerContext.Provider>
}

export default PlayerContextProvider;
