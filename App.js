import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GameScreen from './src/screens/GameScreen';
import SnakeGameScreen from './src/screens/SnakeGameScreen'; // Import SnakeGameScreen

// It's good practice to ensure gesture handler is imported at the top
// of your entry file (index.js or App.js) if it's not already.
// For this exercise, assuming it's handled or not strictly needed for basic stack navigation.
// import 'react-native-gesture-handler';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Game">
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ headerShown: false }} // Hide header for the main game screen
        />
        <Stack.Screen
          name="SnakeGame"
          component={SnakeGameScreen}
          options={{ title: 'Snake', headerBackTitle: 'Retour' }} // Customize header for Snake game
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
