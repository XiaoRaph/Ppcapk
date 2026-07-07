import React, { useState } from 'react';
import GameScreen from './src/screens/GameScreen';
import SnakeGameScreen from './src/screens/SnakeGameScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('Game');

  const navigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    setCurrentScreen('Game');
  };

  const navigation = {
    navigate,
    goBack,
  };

  return (
    <>
      {currentScreen === 'Game' && <GameScreen navigation={navigation} />}
      {currentScreen === 'SnakeGame' && <SnakeGameScreen navigation={navigation} />}
    </>
  );
}

export default App;
