import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
    <View style={styles.container}>
      {currentScreen === 'Game' && <GameScreen navigation={navigation} />}
      {currentScreen === 'SnakeGame' && <SnakeGameScreen navigation={navigation} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});

export default App;
