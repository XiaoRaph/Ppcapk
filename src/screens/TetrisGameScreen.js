import React, {useState, useEffect, useRef, useCallback} from 'react';
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

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

const COLS = 10;
const ROWS = 20;

// Dynamic cell sizing
const CELL_SIZE = Math.max(
  Math.floor(Math.min(windowWidth - 140, windowHeight - 340) / ROWS),
  14,
);

const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

const createEmptyBoard = () =>
  Array.from({length: ROWS}, () => Array(COLS).fill(0));

const getRandomPieceType = () => {
  const types = Object.keys(SHAPES);
  return types[Math.floor(Math.random() * types.length)];
};

const createPiece = type => {
  return {
    type,
    shape: SHAPES[type],
    color: COLORS[type],
    x: Math.floor((COLS - SHAPES[type][0].length) / 2),
    y: -1, // Spawn just above the visual frame
  };
};

const rotateMatrix = matrix => {
  const n = matrix.length;
  const rotated = Array.from({length: n}, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      rotated[c][n - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

const checkCollision = (shape, x, y, board) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const boardX = x + c;
        const boardY = y + r;

        // Check horizontal & bottom boundaries
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
          return true;
        }

        // Check collision with placed blocks (ignore if block is above visible board)
        if (boardY >= 0 && board[boardY][boardX]) {
          return true;
        }
      }
    }
  }
  return false;
};

const TetrisGameScreen = ({navigation}) => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPieceType, setNextPieceType] = useState(getRandomPieceType);
  const [holdPieceType, setHoldPieceType] = useState(null);
  const [hasHeld, setHasHeld] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Refs for current mutable states to keep callbacks current in useEffects
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceTypeRef = useRef(nextPieceType);
  const holdPieceTypeRef = useRef(holdPieceType);
  const hasHeldRef = useRef(hasHeld);
  const isPausedRef = useRef(isPaused);
  const isGameOverRef = useRef(isGameOver);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    nextPieceTypeRef.current = nextPieceType;
  }, [nextPieceType]);

  useEffect(() => {
    holdPieceTypeRef.current = holdPieceType;
  }, [holdPieceType]);

  useEffect(() => {
    hasHeldRef.current = hasHeld;
  }, [hasHeld]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  const initGame = useCallback(() => {
    setBoard(createEmptyBoard());
    const initialType = getRandomPieceType();
    setCurrentPiece(createPiece(initialType));
    setNextPieceType(getRandomPieceType());
    setHoldPieceType(null);
    setHasHeld(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsPaused(false);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Lock the current piece to the board
  const lockPiece = useCallback((piece, curBoard) => {
    const newBoard = curBoard.map(row => [...row]);
    let gameOverCheck = false;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;

          if (boardY < 0) {
            gameOverCheck = true;
          } else {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    if (gameOverCheck) {
      setIsGameOver(true);
      return;
    }

    // Line clearing logic
    let linesClearedThisTurn = 0;
    const filteredBoard = newBoard.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) {
        linesClearedThisTurn++;
      }
      return !isFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(0));
    }

    if (linesClearedThisTurn > 0) {
      const scoreTable = [0, 100, 300, 500, 800];
      const pointsEarned = scoreTable[linesClearedThisTurn] * level;
      setScore(prev => prev + pointsEarned);
      setLines(prev => {
        const newLines = prev + linesClearedThisTurn;
        const newLevel = Math.floor(newLines / 10) + 1;
        setLevel(newLevel);
        return newLines;
      });
    }

    // Spawn next piece
    setBoard(filteredBoard);
    const nextType = nextPieceTypeRef.current;
    const nextSpawnPiece = createPiece(nextType);

    if (checkCollision(nextSpawnPiece.shape, nextSpawnPiece.x, nextSpawnPiece.y, filteredBoard)) {
      setIsGameOver(true);
    } else {
      setCurrentPiece(nextSpawnPiece);
      setNextPieceType(getRandomPieceType());
      setHasHeld(false);
    }
  }, [level]);

  // Move piece horizontally or down
  const movePiece = useCallback((dx, dy) => {
    if (isPausedRef.current || isGameOverRef.current || !currentPieceRef.current) {
      return false;
    }

    const piece = currentPieceRef.current;
    const newX = piece.x + dx;
    const newY = piece.y + dy;

    if (!checkCollision(piece.shape, newX, newY, boardRef.current)) {
      setCurrentPiece({
        ...piece,
        x: newX,
        y: newY,
      });
      return true;
    }

    // If moving down failed, lock the piece
    if (dy > 0) {
      lockPiece(piece, boardRef.current);
      return false;
    }

    return false;
  }, [lockPiece]);

  // Game tick interval based on level speed
  useEffect(() => {
    if (isPaused || isGameOver) {
      return;
    }

    const speed = Math.max(1000 - (level - 1) * 100, 100);
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => clearInterval(interval);
  }, [level, isPaused, isGameOver, movePiece]);

  // Hold feature
  const holdPiece = useCallback(() => {
    if (isPausedRef.current || isGameOverRef.current || hasHeldRef.current || !currentPieceRef.current) {
      return;
    }

    const curPiece = currentPieceRef.current;
    const currentHoldType = holdPieceTypeRef.current;

    setHoldPieceType(curPiece.type);
    setHasHeld(true);

    if (currentHoldType === null) {
      const nextType = nextPieceTypeRef.current;
      setCurrentPiece(createPiece(nextType));
      setNextPieceType(getRandomPieceType());
    } else {
      setCurrentPiece(createPiece(currentHoldType));
    }
  }, []);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (isPausedRef.current || isGameOverRef.current || !currentPieceRef.current) {
      return;
    }

    let piece = currentPieceRef.current;
    let dropY = piece.y;

    while (!checkCollision(piece.shape, piece.x, dropY + 1, boardRef.current)) {
      dropY++;
    }

    const droppedPiece = {
      ...piece,
      y: dropY,
    };

    setCurrentPiece(droppedPiece);
    lockPiece(droppedPiece, boardRef.current);
  }, [lockPiece]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (isPausedRef.current || isGameOverRef.current || !currentPieceRef.current) {
      return;
    }

    const piece = currentPieceRef.current;
    const rotatedShape = rotateMatrix(piece.shape);

    // Try normal rotation
    if (!checkCollision(rotatedShape, piece.x, piece.y, boardRef.current)) {
      setCurrentPiece({
        ...piece,
        shape: rotatedShape,
      });
      return;
    }

    // Wall kick: Try left shift
    if (!checkCollision(rotatedShape, piece.x - 1, piece.y, boardRef.current)) {
      setCurrentPiece({
        ...piece,
        x: piece.x - 1,
        shape: rotatedShape,
      });
      return;
    }

    // Wall kick: Try right shift
    if (!checkCollision(rotatedShape, piece.x + 1, piece.y, boardRef.current)) {
      setCurrentPiece({
        ...piece,
        x: piece.x + 1,
        shape: rotatedShape,
      });
    }
  }, []);

  // Web keyboard inputs
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = e => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'c':
        case 'C':
          holdPiece();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, hardDrop, holdPiece]);

  // Combine placed blocks and active piece block into a single display grid
  const getRenderGrid = () => {
    const grid = board.map(row => [...row]);

    if (currentPiece && !isPaused && !isGameOver) {
      const {shape, x, y, color} = currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const boardY = y + r;
            const boardX = x + c;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              grid[boardY][boardX] = color;
            }
          }
        }
      }
    }

    return grid;
  };

  const grid = getRenderGrid();

  // Alert on Game Over
  useEffect(() => {
    if (isGameOver) {
      Alert.alert('Game Over 👾', `Score final: ${score}`, [
        {text: 'Recommencer', onPress: initGame},
        {text: 'Retour au Menu', onPress: () => navigation.goBack()},
      ]);
    }
  }, [isGameOver, score, initGame, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Retro styling */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>📴 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>TETRIS RETRO</Text>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setIsPaused(prev => !prev)}>
            <Text style={styles.pauseButtonText}>
              {isPaused ? '▶️' : '⏸'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area: Board + Sidebar */}
        <View style={styles.gameArea}>
          {/* Main Play Board */}
          <View style={[styles.board, {width: BOARD_WIDTH, height: BOARD_HEIGHT}]}>
            {grid.map((row, rIdx) => (
              <View key={rIdx} style={styles.row}>
                {row.map((cell, cIdx) => (
                  <View
                    key={cIdx}
                    style={[
                      styles.cell,
                      {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: cell || '#111',
                        borderColor: cell ? 'rgba(255,255,255,0.3)' : '#222',
                      },
                    ]}
                  />
                ))}
              </View>
            ))}

            {/* Overlays */}
            {isPaused && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>PAUSE</Text>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={() => setIsPaused(false)}>
                  <Text style={styles.resumeButtonText}>REPRENDRE</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sidebar: Next, Hold, Level, Score */}
          <View style={styles.sidebar}>
            {/* Hold Slot */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarLabel}>HOLD</Text>
              <View style={styles.miniGrid}>
                {holdPieceType ? (
                  SHAPES[holdPieceType].map((row, rIdx) => (
                    <View key={rIdx} style={styles.miniRow}>
                      {row.map((cell, cIdx) => (
                        <View
                          key={cIdx}
                          style={[
                            styles.miniCell,
                            {
                              backgroundColor: cell ? COLORS[holdPieceType] : 'transparent',
                              borderColor: cell ? 'rgba(255,255,255,0.2)' : 'transparent',
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Vide</Text>
                )}
              </View>
            </View>

            {/* Next Slot */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarLabel}>NEXT</Text>
              <View style={styles.miniGrid}>
                {nextPieceType ? (
                  SHAPES[nextPieceType].map((row, rIdx) => (
                    <View key={rIdx} style={styles.miniRow}>
                      {row.map((cell, cIdx) => (
                        <View
                          key={cIdx}
                          style={[
                            styles.miniCell,
                            {
                              backgroundColor: cell ? COLORS[nextPieceType] : 'transparent',
                              borderColor: cell ? 'rgba(255,255,255,0.2)' : 'transparent',
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Vide</Text>
                )}
              </View>
            </View>

            {/* Score & Lines */}
            <View style={styles.statsContainer}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score}</Text>

              <Text style={styles.statLabel}>LIGNES</Text>
              <Text style={styles.statValue}>{lines}</Text>

              <Text style={styles.statLabel}>NIVEAU</Text>
              <Text style={styles.statValue}>{level}</Text>
            </View>
          </View>
        </View>

        {/* Retro tactile control buttons */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.btn, styles.yellowBtn]}
              onPress={holdPiece}>
              <Text style={styles.btnText}>📥 HOLD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.blueBtn]}
              onPress={rotatePiece}>
              <Text style={styles.btnText}>↻ ROTATE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.redBtn]}
              onPress={hardDrop}>
              <Text style={styles.btnText}>⏬ DROP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.directionBtn]}
              onPress={() => movePiece(-1, 0)}>
              <Text style={styles.directionText}>◀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.directionBtn]}
              onPress={() => movePiece(0, 1)}>
              <Text style={styles.directionText}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.directionBtn]}
              onPress={() => movePiece(1, 0)}>
              <Text style={styles.directionText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d13',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a000f0',
    letterSpacing: 2,
    textShadowColor: 'rgba(160, 0, 240, 0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 8,
    borderRadius: 8,
  },
  pauseButtonText: {
    fontSize: 16,
  },
  gameArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    gap: 15,
  },
  board: {
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 28,
    color: '#a000f0',
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 3,
  },
  resumeButton: {
    backgroundColor: '#a000f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resumeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sidebar: {
    width: 100,
    gap: 10,
  },
  sidebarSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  sidebarLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8a99a6',
    letterSpacing: 1,
    marginBottom: 6,
  },
  miniGrid: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniRow: {
    flexDirection: 'row',
  },
  miniCell: {
    width: 12,
    height: 12,
    borderWidth: 0.5,
  },
  emptyText: {
    color: '#555',
    fontSize: 12,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8a99a6',
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  yellowBtn: {
    backgroundColor: 'rgba(240, 240, 0, 0.15)',
    borderColor: '#f0f000',
  },
  blueBtn: {
    backgroundColor: 'rgba(0, 0, 240, 0.15)',
    borderColor: '#0000f0',
  },
  redBtn: {
    backgroundColor: 'rgba(240, 0, 0, 0.15)',
    borderColor: '#f00000',
  },
  btnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  directionBtn: {
    backgroundColor: '#1f2937',
    width: 65,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  directionText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default TetrisGameScreen;
