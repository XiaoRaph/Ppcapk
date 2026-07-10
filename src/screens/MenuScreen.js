import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import AboutModal from '../components/AboutModal';

const backgroundImage = require('../../assets/images/play_store_512.png'); // Retro background or fallback

const MenuScreen = ({navigation}) => {
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.retroLogo}>🎮 RETRO ARCADE</Text>
            <Text style={styles.subtitle}>Choisissez un jeu populaire</Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#007AFF'}]}
              onPress={() => navigation.navigate('Game')}>
              <Text style={styles.menuButtonEmoji}>✊✌️✋</Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>
                  Pierre, Papier, Ciseaux
                </Text>
                <Text style={styles.menuButtonDesc}>
                  Défiez l'ordinateur dans ce jeu classique
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#2ecc71'}]}
              onPress={() => navigation.navigate('SnakeGame')}>
              <Text style={styles.menuButtonEmoji}>🐍</Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Snake Game</Text>
                <Text style={styles.menuButtonDesc}>
                  Mangez les fruits et évitez les murs
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#e74c3c'}]}
              onPress={() => navigation.navigate('PongGame')}>
              <Text style={styles.menuButtonEmoji}>🏓</Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Pong Classic</Text>
                <Text style={styles.menuButtonDesc}>
                  Le jeu légendaire des consoles rétro
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#a000f0'}]}
              onPress={() => navigation.navigate('TetrisGame')}>
              <Text style={styles.menuButtonEmoji}>🧱</Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Tetris Rétro</Text>
                <Text style={styles.menuButtonDesc}>
                  Empilez les blocs et complétez les lignes
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#39ff14'}]}
              onPress={() => navigation.navigate('BobbyTablesGame')}>
              <Text style={styles.menuButtonEmoji}>🧑‍💻</Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Little Bobby Tables</Text>
                <Text style={styles.menuButtonDesc}>
                  Assemblez l'injection SQL et détruisez la table !
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => setIsAboutModalVisible(true)}>
            <Text style={styles.aboutButtonText}>ℹ️ À Propos</Text>
          </TouchableOpacity>

          <AboutModal
            visible={isAboutModalVisible}
            onClose={() => setIsAboutModalVisible(false)}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  retroLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700', // Gold retro color
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  menuButtonTextContainer: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuButtonDesc: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  aboutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 30,
  },
  aboutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default MenuScreen;
