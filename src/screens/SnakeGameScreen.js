import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';

const {width, height} = Dimensions.get('window');
const GRID_SIZE = 10;
// Calculate cell size based on screen dimensions, ensuring a minimum size and avoiding negative values
const CELL_SIZE = Math.max(
  Math.floor(Math.min(width - 40, height - 420) / GRID_SIZE),
  10,
);
const INITIAL_SNAKE = [
  {x: 5, y: 5},
  {x: 5, y: 6},
  {x: 5, y: 7},
];
const INITIAL_DIRECTION = {x: 0, y: -1};

const getRandomFood = snake => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const isOccupied = snake.some(
      segment => segment.x === newFood.x && segment.y === newFood.y,
    );
    if (!isOccupied) {
      break;
    }
  }
  return newFood;
};

const SnakeGameScreen = ({navigation}) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameInterval = useRef(null);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setIsGameOver(false);
    setScore(0);
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Collision Detection: Walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Collision Detection: Self
      if (
        prevSnake.some(
          segment => segment.x === newHead.x && segment.y === newHead.y,
        )
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Eating Food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood(getRandomFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food]);

  useEffect(() => {
    if (!isGameOver) {
      gameInterval.current = setInterval(moveSnake, 200);
    } else {
      clearInterval(gameInterval.current);
      Alert.alert('Game Over', `Your score: ${score}`, [
        {text: 'Restart', onPress: resetGame},
        {text: 'Menu', onPress: () => navigation.goBack()},
      ]);
    }
    return () => clearInterval(gameInterval.current);
  }, [moveSnake, isGameOver, score, navigation]);

  const directionRef = useRef(direction);
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const handleDirectionChange = useCallback(newDirection => {
    // 🛡️ SECURITY ENHANCEMENT: Defensive validation against malformed directions
    if (
      !newDirection ||
      typeof newDirection.x !== 'number' ||
      typeof newDirection.y !== 'number'
    ) {
      console.warn('[Sentinel] Paramètre de direction invalide bloqué');
      return;
    }

    const isValidStep =
      (Math.abs(newDirection.x) === 1 && newDirection.y === 0) ||
      (Math.abs(newDirection.y) === 1 && newDirection.x === 0);

    if (!isValidStep) {
      console.warn('[Sentinel] Coordonnées de direction non autorisées bloquées');
      return;
    }

    // Prevent 180 degree turns using the latest direction reference
    if (
      newDirection.x !== -directionRef.current.x ||
      newDirection.y !== -directionRef.current.y
    ) {
      setDirection(newDirection);
    }
  }, []);

  // Web physical keyboard controls
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = e => {
      if (isGameOver) {
        if (e.key === 'r' || e.key === 'R') {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'z':
        case 'Z':
          handleDirectionChange({x: 0, y: -1});
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionChange({x: 0, y: 1});
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'q':
        case 'Q':
          handleDirectionChange({x: -1, y: 0});
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionChange({x: 1, y: 0});
          break;
        case 'r':
        case 'R':
          resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, handleDirectionChange]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Snake Game</Text>
        <Text style={styles.score}>Score: {score}</Text>

        <View style={styles.board}>
          {snake.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                styles.snakeSegment,
                {left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE},
                index === 0 ? styles.snakeHead : {},
              ]}
            />
          ))}
          <View
            style={[
              styles.cell,
              styles.food,
              {left: food.x * CELL_SIZE, top: food.y * CELL_SIZE},
            ]}
          />
        </View>

        {Platform.OS === 'web' && (
          <Text style={styles.controlHint}>
            Touches fléchées, WASD/ZQSD ou R pour recommencer
          </Text>
        )}

        <View style={styles.controls}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleDirectionChange({x: 0, y: -1})}
              accessibilityRole="button"
              accessibilityLabel="Tourner en haut"
              accessibilityHint="Dirige le serpent vers le haut">
              <Text style={styles.controlText}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleDirectionChange({x: -1, y: 0})}
              accessibilityRole="button"
              accessibilityLabel="Tourner à gauche"
              accessibilityHint="Dirige le serpent vers la gauche">
              <Text style={styles.controlText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, {backgroundColor: '#e74c3c'}]}
              onPress={resetGame}
              accessibilityRole="button"
              accessibilityLabel="Recommencer la partie"
              accessibilityHint="Réinitialise le score et relance le jeu">
              <Text style={styles.controlText}>R</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleDirectionChange({x: 1, y: 0})}
              accessibilityRole="button"
              accessibilityLabel="Tourner à droite"
              accessibilityHint="Dirige le serpent vers la droite">
              <Text style={styles.controlText}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleDirectionChange({x: 0, y: 1})}
              accessibilityRole="button"
              accessibilityLabel="Tourner en bas"
              accessibilityHint="Dirige le serpent vers le bas">
              <Text style={styles.controlText}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retourner au menu principal"
          accessibilityHint="Ferme le jeu et retourne à l'écran principal">
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ecf0f1',
  },
  score: {
    fontSize: 20,
    color: '#ecf0f1',
    marginBottom: 20,
  },
  board: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: '#34495e',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  snakeSegment: {
    backgroundColor: '#2ecc71',
  },
  snakeHead: {
    backgroundColor: '#27ae60',
    zIndex: 1,
  },
  food: {
    backgroundColor: '#e74c3c',
  },
  controls: {
    marginTop: 30,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
  },
  controlHint: {
    color: '#bdc3c7',
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  controlText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#95a5a6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SnakeGameScreen;
