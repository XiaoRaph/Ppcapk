// Fichier GameScreen.js (anciennement App.js)

import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import AboutModal from '../components/AboutModal'; // Import the AboutModal component

const backgroundImage = require('../../assets/images/play_store_512.png'); // Adjusted path

const CHOICES = [
  {name: 'Pierre', beats: 'Ciseaux'},
  {name: 'Papier', beats: 'Pierre'},
  {name: 'Ciseaux', beats: 'Papier'},
];

const CHOICE_EMOJIS = {
  'Pierre': '✊',
  'Papier': '✋',
  'Ciseaux': '✌️',
};

const GameScreen = ({navigation}) => {
  // Added navigation prop
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState('');
  const [gameInProgress, setGameInProgress] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animated values for hand shaking
  const playerShakeValue = useRef(new Animated.Value(0)).current;
  const computerShakeValue = useRef(new Animated.Value(0)).current;

  // Fonction pour gérer le choix du joueur
  const handlePlayerChoice = choiceName => {
    if (!gameInProgress || isAnimating) {
      return;
    } // Empêche de cliquer pendant l'affichage du résultat ou de l'animation

    const selectedChoice = CHOICES.find(c => c.name === choiceName);

    // 🛡️ SECURITY ENHANCEMENT: Input validation (defensive coding)
    // Prevent unhandled TypeErrors/crashes (client-side DoS) if an unexpected or malicious choiceName is passed.
    if (!selectedChoice) {
      console.warn(`[Sentinel] Invalid player choice attempt: ${choiceName}`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    const compChoice = CHOICES[randomIndex];

    // Reset animated values
    playerShakeValue.setValue(0);
    computerShakeValue.setValue(0);

    // Start shaking animation!
    setIsAnimating(true);

    const singleShake = (animatedVal) => {
      return Animated.sequence([
        Animated.timing(animatedVal, {
          toValue: -30,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animatedVal, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
    };

    // Chain 3 shakes in sequence to build tension!
    Animated.sequence([
      Animated.parallel([singleShake(playerShakeValue), singleShake(computerShakeValue)]),
      Animated.parallel([singleShake(playerShakeValue), singleShake(computerShakeValue)]),
      Animated.parallel([singleShake(playerShakeValue), singleShake(computerShakeValue)]),
    ]).start(() => {
      // Once animation is done, show choices and update score
      setPlayerChoice(selectedChoice);
      setComputerChoice(compChoice);

      if (selectedChoice.name === compChoice.name) {
        setResult('Égalité !');
      } else if (selectedChoice.beats === compChoice.name) {
        setResult('Victoire !');
        setPlayerScore(prevScore => prevScore + 1);
      } else {
        setResult('Défaite !');
        setComputerScore(prevScore => prevScore + 1);
      }

      setIsAnimating(false);
      setGameInProgress(false); // La manche est terminée, on affiche le résultat
    });
  };

  // Fonction pour démarrer la prochaine manche
  const nextRound = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setGameInProgress(true); // On peut rejouer
  };

  // Fonction pour réinitialiser tout le jeu
  const resetGame = () => {
    if (isAnimating) return;
    nextRound();
    setPlayerScore(0);
    setComputerScore(0);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        {/* Menu Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isMenuVisible}
          onRequestClose={() => setIsMenuVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsMenuVisible(false)} // Close by clicking outside
          >
            <View style={styles.menuModalView}>
              <Text style={styles.menuModalTitle}>Menu</Text>

              <TouchableOpacity
                style={[styles.menuButtonOption, {backgroundColor: '#FFD700'}]}
                onPress={() => {
                  setIsMenuVisible(false);
                  navigation.goBack();
                }}>
                <Text style={[styles.menuButtonOptionText, {color: '#000'}]}>
                  🏠 Menu Principal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButtonOption}
                onPress={() => {
                  setIsMenuVisible(false);
                  navigation.navigate('SnakeGame');
                }}>
                <Text style={styles.menuButtonOptionText}>🐍 Snake Game</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButtonOption, {backgroundColor: '#e74c3c'}]}
                onPress={() => {
                  setIsMenuVisible(false);
                  navigation.navigate('PongGame');
                }}>
                <Text style={styles.menuButtonOptionText}>🏓 Pong Classic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButtonOption, {backgroundColor: '#39ff14'}]}
                onPress={() => {
                  setIsMenuVisible(false);
                  navigation.navigate('BobbyTablesGame');
                }}>
                <Text style={[styles.menuButtonOptionText, {color: '#000'}]}>
                  🧑‍💻 Bobby Tables
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButtonOption, {backgroundColor: '#6c757d'}]}
                onPress={() => {
                  setIsMenuVisible(false);
                  setIsAboutModalVisible(true);
                }}>
                <Text style={styles.menuButtonOptionText}>ℹ️ À Propos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButtonOption, styles.menuCloseButton]}
                onPress={() => setIsMenuVisible(false)}>
                <Text style={styles.menuButtonOptionText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* About Modal */}
        <AboutModal
          visible={isAboutModalVisible}
          onClose={() => setIsAboutModalVisible(false)}
        />

        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setIsMenuVisible(true)}
            style={styles.actualMenuButton}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le menu"
            accessibilityHint="Affiche les options de navigation de l'arcade">
            <Text style={styles.actualMenuButtonText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pierre, Papier, Ciseaux</Text>
          <View style={{width: 50}} />
          {/* Placeholder for balance - right */}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Vous: {playerScore}</Text>
          <Text style={styles.scoreText}>Ordinateur: {computerScore}</Text>
        </View>

        {/* Interactive Versus Arena */}
        <View style={styles.arenaContainer}>
          {/* Player Arena Panel */}
          <View style={styles.arenaPanel}>
            <Text style={styles.arenaLabel}>VOUS</Text>
            <Animated.View
              style={[
                styles.handContainer,
                { transform: [{ translateY: playerShakeValue }] }
              ]}>
              <Text style={styles.handEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                {isAnimating
                  ? '✊'
                  : (playerChoice ? CHOICE_EMOJIS[playerChoice.name] : '👤')
                }
              </Text>
            </Animated.View>
            <Text style={styles.arenaChoiceName}>
              {isAnimating ? '...' : (playerChoice ? playerChoice.name : 'En attente')}
            </Text>
          </View>

          {/* VS Divider */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Computer Arena Panel */}
          <View style={styles.arenaPanel}>
            <Text style={styles.arenaLabel}>ORDINATEUR</Text>
            <Animated.View
              style={[
                styles.handContainer,
                { transform: [{ translateY: computerShakeValue }, { scaleX: -1 }] }
              ]}>
              <Text style={styles.handEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                {isAnimating
                  ? '✊'
                  : (computerChoice ? CHOICE_EMOJIS[computerChoice.name] : '🤖')
                }
              </Text>
            </Animated.View>
            <Text style={styles.arenaChoiceName}>
              {isAnimating ? '...' : (computerChoice ? computerChoice.name : 'En attente')}
            </Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          {!gameInProgress && !isAnimating ? (
            <>
              <Text
                style={[
                  styles.resultText,
                  result === 'Victoire !' ? styles.winText : {},
                  result === 'Défaite !' ? styles.loseText : {},
                  result === 'Égalité !' ? styles.tieText : {},
                ]}>
                {result}
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.playAgainButton]}
                onPress={nextRound}
                accessibilityRole="button"
                accessibilityLabel="Jouer encore"
                accessibilityHint="Recommencer une nouvelle manche">
                <Text style={styles.buttonText}>Jouer encore</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.buttonsContainer}>
              {CHOICES.map(choice => (
                <TouchableOpacity
                  key={choice.name}
                  disabled={isAnimating}
                  style={[styles.button, styles.choiceButton, isAnimating ? styles.disabledButton : {}]}
                  onPress={() => handlePlayerChoice(choice.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Choisir ${choice.name}`}
                  accessibilityHint={`Jouer ${choice.name} contre l'ordinateur`}>
                  <Text style={styles.choiceButtonEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                    {CHOICE_EMOJIS[choice.name]}
                  </Text>
                  <Text style={styles.buttonText}>{choice.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetGame}
          disabled={isAnimating}
          accessibilityRole="button"
          accessibilityLabel="Réinitialiser le Score"
          accessibilityHint="Remettre à zéro les scores de la partie">
          <Text style={styles.buttonText}>Réinitialiser le Score</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)', // Increased opacity for better text readability
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%', // Ensure overlay takes full width
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  actualMenuButton: {
    padding: 10,
    borderRadius: 5,
    zIndex: 1, // Ensure it's clickable over other elements if any overlap
  },
  actualMenuButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1, // Allows title to take available space and center
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // Changed to white for better contrast
  },
  arenaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  arenaPanel: {
    flex: 1,
    alignItems: 'center',
  },
  arenaLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#bdc3c7',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  handContainer: {
    width: 76,
    height: 76,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold/Retro border
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  handEmoji: {
    fontSize: 36,
  },
  arenaChoiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  vsContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#e74c3c', // Red versus text
    textShadowColor: 'rgba(231, 76, 60, 0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  gameArea: {
    minHeight: 160,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
  winText: {color: 'white', backgroundColor: '#4CAF50'},
  loseText: {color: 'white', backgroundColor: '#F44336'},
  tieText: {color: 'white', backgroundColor: '#FFC107'},
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  choiceButton: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  choiceButtonEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  playAgainButton: {
    backgroundColor: '#28a745',
    width: '80%',
  },
  resetButton: {
    backgroundColor: '#6c757d',
    width: '90%',
    position: 'absolute',
    bottom: 30,
  },
  // Styles for the Menu Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Dimmed background for the modal
  },
  menuModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch', // Stretch items to fill width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Modal width
  },
  menuModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  menuButtonOption: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10, // Space between menu items
  },
  menuButtonOptionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  menuCloseButton: {
    backgroundColor: '#6c757d', // A different color for the close button
    marginTop: 10, // Add some space above the close button
  },
});

export default GameScreen; // Renamed export
