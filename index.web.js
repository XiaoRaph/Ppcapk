import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';

const appName = 'MonJeu';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
