import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';

const CHOICES = [
  { name: 'Pierre', beats: 'Ciseaux' },
  { name: 'Papier', beats: 'Pierre' },
  { name: 'Ciseaux', beats: 'Papier' },
];

const App = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState('');

  // Fonction pour que l'ordinateur fasse un choix aléatoire
  const computerRandomChoice = () => {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    setComputerChoice(CHOICES[randomIndex]);
  };

  // Fonction pour gérer le choix du joueur
  const handlePlayerChoice = (choiceName) => {
    const selectedChoice = CHOICES.find(c => c.name === choiceName);
    setPlayerChoice(selectedChoice);
    computerRandomChoice(); // L'ordinateur choisit après le joueur
  };

  // Déterminer le résultat de la manche
  useEffect(() => {
    if (playerChoice && computerChoice) {
      if (playerChoice.name === computerChoice.name) {
        setResult('Égalité !');
      } else if (playerChoice.beats === computerChoice.name) {
        setResult('Victoire !');
        setPlayerScore(prevScore => prevScore + 1);
      } else {
        setResult('Défaite !');
        setComputerScore(prevScore => prevScore + 1);
      }
    }
  }, [playerChoice, computerChoice]);

  // Fonction pour réinitialiser le jeu
  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setPlayerScore(0);
    setComputerScore(0);
    setResult('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pierre, Papier, Ciseaux</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Vous: {playerScore}</Text>
        <Text style={styles.scoreText}>Ordinateur: {computerScore}</Text>
      </View>

      <View style={styles.choicesContainer}>
        <Text style={styles.choiceText}>
          Vous: {playerChoice ? playerChoice.name : '-'}
        </Text>
        <Text style={styles.choiceText}>
          Ordinateur: {computerChoice ? computerChoice.name : '-'}
        </Text>
      </View>

      {result !== '' && (
        <Text style={[
          styles.resultText,
          result === 'Victoire !' ? styles.winText : {},
          result === 'Défaite !' ? styles.loseText : {},
          result === 'Égalité !' ? styles.tieText : {},
        ]}>
          {result}
        </Text>
      )}

      <View style={styles.buttonsContainer}>
        {CHOICES.map(choice => (
          <TouchableOpacity
            key={choice.name}
            style={styles.button}
            onPress={() => handlePlayerChoice(choice.name)}
            disabled={!!result && playerChoice && computerChoice} // Désactiver après un choix jusqu'à la prochaine manche (implicite par le reset ou la continuation)
          >
            <Text style={styles.buttonText}>{choice.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={resetGame}
      >
        <Text style={styles.buttonText}>Réinitialiser</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Fond légèrement gris
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
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
    color: '#555',
  },
  choicesContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    overflow: 'hidden', // Pour que le borderRadius s'applique au fond
  },
  winText: {
    color: 'white',
    backgroundColor: '#4CAF50', // Vert
  },
  loseText: {
    color: 'white',
    backgroundColor: '#F44336', // Rouge
  },
  tieText: {
    color: 'white',
    backgroundColor: '#FFC107', // Ambre
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF', // Bleu standard iOS
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    elevation: 2, // Ombre légère pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#DC3545', // Rouge distinctif
    width: '90%', // Prendre plus de largeur
  },
});

export default App;
