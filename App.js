import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import SnakeGameScreen from './src/screens/SnakeGameScreen';
import PongGameScreen from './src/screens/PongGameScreen';
import TetrisGameScreen from './src/screens/TetrisGameScreen';
import BobbyTablesGameScreen from './src/screens/BobbyTablesGameScreen';
import SlopLocalGameScreen from './src/screens/SlopLocalGameScreen';
import JuliAVsClaudeGameScreen from './src/screens/JuliAVsClaudeGameScreen';
import ConflictGameScreen from './src/screens/ConflictGameScreen';
import EscapeGameScreen from './src/screens/EscapeGameScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('Menu');

  const navigate = screenName => {
    // 🛡️ SECURITY ENHANCEMENT: Strict whitelist validation on navigation screens
    const VALID_SCREENS = [
      'Menu',
      'Game',
      'SnakeGame',
      'PongGame',
      'TetrisGame',
      'BobbyTablesGame',
      'SlopLocalGame',
      'JuliAVsClaudeGame',
      'ConflictGame',
      'EscapeGame',
    ];
    if (!VALID_SCREENS.includes(screenName)) {
      console.warn(`[Sentinel] Tentative de navigation non autorisée vers : "${screenName}"`);
      return;
    }
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
      {currentScreen === 'JuliAVsClaudeGame' && (
        <JuliAVsClaudeGameScreen navigation={navigation} />
      )}
      {currentScreen === 'ConflictGame' && (
        <ConflictGameScreen navigation={navigation} />
      )}
      {currentScreen === 'EscapeGame' && (
        <EscapeGameScreen navigation={navigation} />
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