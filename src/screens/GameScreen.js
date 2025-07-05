// Fichier GameScreen.js (anciennement App.js)

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import AboutModal from '../components/AboutModal'; // Import the AboutModal component

const backgroundImage = require('../../assets/images/play_store_512.png'); // Adjusted path

const CHOICES = [
  { name: 'Pierre', beats: 'Ciseaux' },
  { name: 'Papier', beats: 'Pierre' },
  { name: 'Ciseaux', beats: 'Papier' },
];

const GameScreen = ({ navigation }) => { // Added navigation prop
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState('');
  const [gameInProgress, setGameInProgress] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);

  // Fonction pour gérer le choix du joueur
  const handlePlayerChoice = (choiceName) => {
    if (!gameInProgress) return; // Empêche de cliquer pendant l'affichage du résultat

    const selectedChoice = CHOICES.find(c => c.name === choiceName);
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    const compChoice = CHOICES[randomIndex];

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
    setGameInProgress(false); // La manche est terminée, on affiche le résultat
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
          onRequestClose={() => setIsMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsMenuVisible(false)} // Close by clicking outside
          >
            <View style={styles.menuModalView}>
              <Text style={styles.menuModalTitle}>Menu</Text>
              <TouchableOpacity
                style={styles.menuButtonOption}
                onPress={() => {
                  setIsMenuVisible(false);
                  setIsAboutModalVisible(true);
                }}
              >
                <Text style={styles.menuButtonOptionText}>À Propos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButtonOption}
                onPress={() => {
                  setIsMenuVisible(false);
                  navigation.navigate('SnakeGame');
                }}
              >
                <Text style={styles.menuButtonOptionText}>Snake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuButtonOption, styles.menuCloseButton]}
                onPress={() => setIsMenuVisible(false)}
              >
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
          <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.actualMenuButton}>
            <Text style={styles.actualMenuButtonText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pierre, Papier, Ciseaux</Text>
          <View style={{ width: 50 }} />{/* Placeholder for balance - right */}
        </View>

        <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Vous: {playerScore}</Text>
        <Text style={styles.scoreText}>Ordinateur: {computerScore}</Text>
      </View>

      <View style={styles.choicesContainer}>
        <Text style={styles.choiceText}>
          Votre choix : {playerChoice ? playerChoice.name : '-'}
        </Text>
        <Text style={styles.choiceText}>
          Choix de l'ordi : {computerChoice ? computerChoice.name : '-'}
        </Text>
      </View>

      <View style={styles.gameArea}>
        {!gameInProgress ? (
          <>
            <Text style={[
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
            >
              <Text style={styles.buttonText}>Jouer encore</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonsContainer}>
            {CHOICES.map(choice => (
              <TouchableOpacity
                key={choice.name}
                style={styles.button}
                onPress={() => handlePlayerChoice(choice.name)}
              >
                <Text style={styles.buttonText}>{choice.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={resetGame}
      >
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
  overlay: { // Added overlay style
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Increased opacity for better text readability
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%', // Ensure overlay takes full width
  },
  // container: { // This style seems redundant now as overlay and backgroundImage handle the layout.
  //   flex: 1,
  //   // backgroundColor: '#f5f5f5', // Removed as background is now an image
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   padding: 20,
  // },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  actualMenuButton: { // Renamed from menuButton to avoid conflict with modal styles
    padding: 10,
    // backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    zIndex: 1, // Ensure it's clickable over other elements if any overlap
  },
  actualMenuButtonText: { // Renamed from menuButtonText
    color: '#FFFFFF',
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1, // Allows title to take available space and center
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // Changed to white for better contrast
  },
  choicesContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 18,
    color: '#FFFFFF', // Changed to white for better contrast
  },
  gameArea: { // Nouveau conteneur pour stabiliser l'interface
    minHeight: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
  winText: { color: 'white', backgroundColor: '#4CAF50' },
  loseText: { color: 'white', backgroundColor: '#F44336' },
  tieText: { color: 'white', backgroundColor: '#FFC107' },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
  }
});

export default GameScreen; // Renamed export