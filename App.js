import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import SnakeGameScreen from './src/screens/SnakeGameScreen';
import PongGameScreen from './src/screens/PongGameScreen';
import TetrisGameScreen from './src/screens/TetrisGameScreen';
import BobbyTablesGameScreen from './src/screens/BobbyTablesGameScreen';
import SlopLocalGameScreen from './src/screens/SlopLocalGameScreen';
import JulesVsClaudeGameScreen from './src/screens/JulesVsClaudeGameScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('Menu');

  const navigate = screenName => {
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    setCurrentScreen('Menu');
  };

  const navigation = {
    navigate,
    goBack,
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'Menu' && <MenuScreen navigation={navigation} />}
      {currentScreen === 'Game' && <GameScreen navigation={navigation} />}
      {currentScreen === 'SnakeGame' && (
        <SnakeGameScreen navigation={navigation} />
      )}
      {currentScreen === 'PongGame' && (
        <PongGameScreen navigation={navigation} />
      )}
      {currentScreen === 'TetrisGame' && (
        <TetrisGameScreen navigation={navigation} />
      )}
      {currentScreen === 'BobbyTablesGame' && (
        <BobbyTablesGameScreen navigation={navigation} />
      )}
      {currentScreen === 'SlopLocalGame' && (
        <SlopLocalGameScreen navigation={navigation} />
      )}
      {currentScreen === 'JulesVsClaudeGame' && (
        <JulesVsClaudeGameScreen navigation={navigation} />
      )}
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
