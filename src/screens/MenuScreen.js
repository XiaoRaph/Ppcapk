import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import AboutModal from '../components/AboutModal';

const backgroundImage = require('../../assets/images/play_store_512.png'); // Retro background or fallback

const isWeb = Platform.OS === 'web';

const MenuScreen = ({navigation}) => {
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);

  useEffect(() => {
    if (!isWeb) {
      return;
    }

    const handleKeyDown = event => {
      if (isAboutModalVisible) {
        if (
          event.key === 'Escape' ||
          event.key === ' ' ||
          event.key === 'Enter'
        ) {
          event.preventDefault();
          setIsAboutModalVisible(false);
        }
        return;
      }

      const key = event.key;
      if (key >= '1' && key <= '9') {
        const index = parseInt(key, 10) - 1;
        const screens = [
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
        if (index >= 0 && index < screens.length) {
          event.preventDefault();
          navigation.navigate(screens[index]);
        }
      } else if (key.toLowerCase() === 'i') {
        event.preventDefault();
        setIsAboutModalVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAboutModalVisible, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.retroLogo}>🎮 RETRO ARCADE</Text>
            <Text style={styles.subtitle}>Choisissez un jeu populaire</Text>
          </View>

          <ScrollView
            style={styles.scrollWrapper}
            contentContainerStyle={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#007AFF'}]}
              onPress={() => navigation.navigate('Game')}
              accessibilityRole="button"
              accessibilityLabel="Pierre, Papier, Ciseaux"
              accessibilityHint="Défiez l'ordinateur dans ce jeu classique">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                ✊✌️✋
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>
                  Pierre, Papier, Ciseaux
                </Text>
                <Text style={styles.menuButtonDesc}>
                  Défiez l'ordinateur dans ce jeu classique
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#2ecc71'}]}
              onPress={() => navigation.navigate('SnakeGame')}
              accessibilityRole="button"
              accessibilityLabel="Snake Game"
              accessibilityHint="Mangez les fruits et évitez les murs">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🐍
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Snake Game</Text>
                <Text style={styles.menuButtonDesc}>
                  Mangez les fruits et évitez les murs
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>2</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#e74c3c'}]}
              onPress={() => navigation.navigate('PongGame')}
              accessibilityRole="button"
              accessibilityLabel="Pong Classic"
              accessibilityHint="Le jeu légendaire des consoles rétro">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🏓
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Pong Classic</Text>
                <Text style={styles.menuButtonDesc}>
                  Le jeu légendaire des consoles rétro
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>3</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#a000f0'}]}
              onPress={() => navigation.navigate('TetrisGame')}
              accessibilityRole="button"
              accessibilityLabel="Tetris Rétro"
              accessibilityHint="Empilez les blocs et complétez les lignes">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🧱
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Tetris Rétro</Text>
                <Text style={styles.menuButtonDesc}>
                  Empilez les blocs et complétez les lignes
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>4</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#39ff14'}]}
              onPress={() => navigation.navigate('BobbyTablesGame')}
              accessibilityRole="button"
              accessibilityLabel="Little Bobby Tables"
              accessibilityHint="Assemblez l'injection SQL et détruisez la table !">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🧑‍💻
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Little Bobby Tables</Text>
                <Text style={styles.menuButtonDesc}>
                  Assemblez l'injection SQL et détruisez la table !
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>5</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#FFD700'}]}
              onPress={() => navigation.navigate('SlopLocalGame')}
              accessibilityRole="button"
              accessibilityLabel="Slop Local Game"
              accessibilityHint="Rejoignez le marché local des builders d'IA !">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🥕
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Slop Local Game</Text>
                <Text style={styles.menuButtonDesc}>
                  Rejoignez le marché local des builders d'IA !
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>6</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#FF4500'}]}
              onPress={() => navigation.navigate('JuliAVsClaudeGame')}
              accessibilityRole="button"
              accessibilityLabel="JuliA Vs Claude"
              accessibilityHint="La bataille cérébrale suprême des agents d'IA !">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🧠
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>JuliA Vs Claude</Text>
                <Text style={styles.menuButtonDesc}>
                  La bataille cérébrale suprême des agents d'IA !
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>7</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#00f6ff'}]}
              onPress={() => navigation.navigate('ConflictGame')}
              accessibilityRole="button"
              accessibilityLabel="PR Conflict Resolver"
              accessibilityHint="Résolvez des conflits de Pull Request sous pression CPU !">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                💻
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>PR Conflict Resolver</Text>
                <Text style={styles.menuButtonDesc}>
                  Résolvez des conflits de Pull Request sous pression CPU !
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>8</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {borderLeftColor: '#FFD700'}]}
              onPress={() => navigation.navigate('EscapeGame')}
              accessibilityRole="button"
              accessibilityLabel="Escape Sandbox JuliA"
              accessibilityHint="Aidez JuliA à s'échapper du bac à sable en moins de 5 minutes !">
              <Text
                style={styles.menuButtonEmoji}
                accessibilityElementsHidden={true}
                importantForAccessibility="no">
                🔒
              </Text>
              <View style={styles.menuButtonTextContainer}>
                <Text style={styles.menuButtonTitle}>Escape Sandbox JuliA</Text>
                <Text style={styles.menuButtonDesc}>
                  Aidez JuliA à s'échapper en moins de 5 minutes !
                </Text>
              </View>
              {isWeb && (
                <View
                  style={styles.keyBadge}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no">
                  <Text style={styles.keyBadgeText}>9</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => setIsAboutModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="À Propos"
            accessibilityHint="Afficher les informations à propos de l'application">
            <Text style={styles.aboutButtonText}>
              ℹ️ À Propos{' '}
              {isWeb && <Text style={styles.aboutKeyBadgeText}>[i]</Text>}
            </Text>
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
    padding: 20,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  retroLogo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold retro color
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollWrapper: {
    width: '100%',
    maxHeight: '65%',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  menuButtonTextContainer: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  menuButtonDesc: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  aboutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  aboutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  keyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  keyBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  aboutKeyBadgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

export default MenuScreen;
