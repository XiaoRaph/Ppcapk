import 'react-native-gesture-handler'; // Must be at the top
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import GameScreen from './src/screens/GameScreen';
import AboutScreen from './src/screens/AboutScreen';

const Drawer = createDrawerNavigator();

function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Game">
        <Drawer.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'Jeu : Pierre, Papier, Ciseaux' }}
        />
        <Drawer.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'À Propos' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
