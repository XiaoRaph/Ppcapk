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

// Game coordinate system
const BOARD_WIDTH = 300;
const BOARD_HEIGHT = 400;

// Paddle and Ball sizes (in game coords)
const PADDLE_WIDTH = 65;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 10;

// Dynamic scaling
const SCALE = Math.min(
  (windowWidth - 40) / BOARD_WIDTH,
  (windowHeight - 320) / BOARD_HEIGHT,
  1.3,
);
const ACTUAL_BOARD_WIDTH = BOARD_WIDTH * SCALE;
const ACTUAL_BOARD_HEIGHT = BOARD_HEIGHT * SCALE;

const PongGameScreen = ({navigation}) => {
  // Score & Status States
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, ROUND_OVER, GAME_OVER
  const [winner, setWinner] = useState(null);

  // Positions (expressed in game coordinates for perfect math, scaled in style)
  const [playerPaddleX, setPlayerPaddleX] = useState(
    (BOARD_WIDTH - PADDLE_WIDTH) / 2,
  );
  const [computerPaddleX, setComputerPaddleX] = useState(
    (BOARD_WIDTH - PADDLE_WIDTH) / 2,
  );
  const [ballX, setBallX] = useState(BOARD_WIDTH / 2);
  const [ballY, setBallY] = useState(BOARD_HEIGHT / 2);

  // Speed and direction refs to avoid closure stale values in loop
  const ballSpeedX = useRef(2.5);
  const ballSpeedY = useRef(3.5);
  const playerPaddleXRef = useRef((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const computerPaddleXRef = useRef((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const ballXRef = useRef(BOARD_WIDTH / 2);
  const ballYRef = useRef(BOARD_HEIGHT / 2);

  // Controller buttons pressed state
  const isLeftPressed = useRef(false);
  const isRightPressed = useRef(false);

  // Flash effect on hit/score
  const [flashActive, setFlashActive] = useState(false);

  // Sync refs with state for the collision loop
  useEffect(() => {
    playerPaddleXRef.current = playerPaddleX;
  }, [playerPaddleX]);

  useEffect(() => {
    computerPaddleXRef.current = computerPaddleX;
  }, [computerPaddleX]);

  // Handle physical keyboard input for web
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        isLeftPressed.current = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        isRightPressed.current = true;
      }
      if (e.key === ' ' && gameStatus === 'READY') {
        startGame();
      }
    };

    const handleKeyUp = e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        isLeftPressed.current = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        isRightPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus]);

  const startGame = () => {
    setGameStatus('PLAYING');
    resetRound(true);
  };

  const triggerFlash = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 80);
  };

  const resetRound = (isNewGameStart = false) => {
    // Reset positions
    const initialPaddle = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
    setPlayerPaddleX(initialPaddle);
    setComputerPaddleX(initialPaddle);
    setBallX(BOARD_WIDTH / 2);
    setBallY(BOARD_HEIGHT / 2);

    ballXRef.current = BOARD_WIDTH / 2;
    ballYRef.current = BOARD_HEIGHT / 2;

    // Ball served towards the player or loser
    const serveY = Math.random() > 0.5 ? 3.5 : -3.5;
    const serveX = (Math.random() * 2 - 1) * 2; // -2 to 2

    ballSpeedX.current = serveX;
    ballSpeedY.current = serveY;

    if (!isNewGameStart) {
      setGameStatus('PLAYING');
    }
  };

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setWinner(null);
    setGameStatus('READY');
    resetRound(true);
  };

  // Main game ticks
  useEffect(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    let animId;

    const gameLoop = () => {
      // 1. Move Player paddle based on controller state
      let nextPlayerX = playerPaddleXRef.current;
      const paddleSpeed = 6;
      if (isLeftPressed.current) {
        nextPlayerX = Math.max(0, playerPaddleXRef.current - paddleSpeed);
      }
      if (isRightPressed.current) {
        nextPlayerX = Math.min(
          BOARD_WIDTH - PADDLE_WIDTH,
          playerPaddleXRef.current + paddleSpeed,
        );
      }
      if (nextPlayerX !== playerPaddleXRef.current) {
        setPlayerPaddleX(nextPlayerX);
      }

      // 2. Move Computer paddle with retro delayed AI tracker
      let nextCompX = computerPaddleXRef.current;
      const aiSpeed = 3.2; // Slightly slower than paddleSpeed to be beatable
      const aiCenter = computerPaddleXRef.current + PADDLE_WIDTH / 2;
      const targetCenter = ballXRef.current;

      // Only track if the ball is moving towards the computer (dy < 0) or randomly
      if (ballSpeedY.current < 0 || Math.random() < 0.7) {
        if (targetCenter > aiCenter + 5) {
          nextCompX = Math.min(
            BOARD_WIDTH - PADDLE_WIDTH,
            computerPaddleXRef.current + aiSpeed,
          );
        } else if (targetCenter < aiCenter - 5) {
          nextCompX = Math.max(0, computerPaddleXRef.current - aiSpeed);
        }
      }
      if (nextCompX !== computerPaddleXRef.current) {
        setComputerPaddleX(nextCompX);
      }

      // 3. Move Ball
      let nextBallX = ballXRef.current + ballSpeedX.current;
      let nextBallY = ballYRef.current + ballSpeedY.current;

      // 4. Wall collision: Left / Right
      if (nextBallX <= 0) {
        nextBallX = 0;
        ballSpeedX.current = -ballSpeedX.current;
        triggerFlash();
      } else if (nextBallX >= BOARD_WIDTH - BALL_SIZE) {
        nextBallX = BOARD_WIDTH - BALL_SIZE;
        ballSpeedX.current = -ballSpeedX.current;
        triggerFlash();
      }

      // 5. Paddle collision: Player (Bottom Paddle)
      const playerPaddleY = BOARD_HEIGHT - 30; // Paddle is situated at y = 370 approx
      if (
        nextBallY >= playerPaddleY - BALL_SIZE &&
        nextBallY <= playerPaddleY + PADDLE_HEIGHT &&
        ballSpeedY.current > 0
      ) {
        // Check if ball is within player paddle x boundaries
        const paddleLeft = playerPaddleXRef.current;
        const paddleRight = playerPaddleXRef.current + PADDLE_WIDTH;

        if (nextBallX + BALL_SIZE >= paddleLeft && nextBallX <= paddleRight) {
          // Hit detected! Calculate reflection angle depending on where it hit the paddle
          const hitPoint =
            (nextBallX + BALL_SIZE / 2 - paddleLeft) / PADDLE_WIDTH; // 0 to 1
          const angle = (hitPoint - 0.5) * 2; // -1 (left edge) to 1 (right edge)

          ballSpeedY.current = -Math.abs(ballSpeedY.current);
          ballSpeedX.current = angle * 4.5; // adjust reflection speed

          // Slightly accelerate ball with retro progressive speed difficulty!
          ballSpeedY.current *= 1.05;
          if (Math.abs(ballSpeedY.current) > 9) {
            ballSpeedY.current = -9; // Limit maximum speed
          }

          triggerFlash();
        }
      }

      // 6. Paddle collision: Computer (Top Paddle)
      const compPaddleY = 20; // situated at y = 20 approx
      if (
        nextBallY <= compPaddleY + PADDLE_HEIGHT &&
        nextBallY >= compPaddleY &&
        ballSpeedY.current < 0
      ) {
        // Check if ball is within computer paddle x boundaries
        const paddleLeft = computerPaddleXRef.current;
        const paddleRight = computerPaddleXRef.current + PADDLE_WIDTH;

        if (nextBallX + BALL_SIZE >= paddleLeft && nextBallX <= paddleRight) {
          // Hit detected!
          const hitPoint =
            (nextBallX + BALL_SIZE / 2 - paddleLeft) / PADDLE_WIDTH;
          const angle = (hitPoint - 0.5) * 2;

          ballSpeedY.current = Math.abs(ballSpeedY.current);
          ballSpeedX.current = angle * 4.5;

          // Slightly accelerate ball
          ballSpeedY.current *= 1.05;
          if (ballSpeedY.current > 9) {
            ballSpeedY.current = 9;
          }

          triggerFlash();
        }
      }

      // 7. Point Scored / Missed Paddle
      if (nextBallY <= 0) {
        // Player scores!
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 5) {
            setWinner('JOUEUR');
            setGameStatus('GAME_OVER');
          } else {
            setGameStatus('ROUND_OVER');
            setTimeout(() => resetRound(false), 1200);
          }
          return newScore;
        });
        triggerFlash();
        return;
      } else if (nextBallY >= BOARD_HEIGHT) {
        // Computer scores!
        setComputerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 5) {
            setWinner('ORDINATEUR');
            setGameStatus('GAME_OVER');
          } else {
            setGameStatus('ROUND_OVER');
            setTimeout(() => resetRound(false), 1200);
          }
          return newScore;
        });
        triggerFlash();
        return;
      }

      // Commit coordinates
      ballXRef.current = nextBallX;
      ballYRef.current = nextBallY;
      setBallX(nextBallX);
      setBallY(nextBallY);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>📴 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PONG RETRO</Text>
          <View style={{width: 60}} />
        </View>

        {/* Scoreboard */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>ORDI</Text>
            <Text style={styles.scoreValue}>{computerScore}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>JOUEUR</Text>
            <Text style={styles.scoreValue}>{playerScore}</Text>
          </View>
        </View>

        {/* The Pong Board */}
        <View
          style={[
            styles.board,
            {
              width: ACTUAL_BOARD_WIDTH,
              height: ACTUAL_BOARD_HEIGHT,
              backgroundColor: flashActive ? '#113311' : '#000000',
            },
          ]}>
          {/* Centered dashed line */}
          <View style={styles.dashedLineContainer}>
            {Array.from({length: 15}).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* Computer Paddle */}
          <View
            style={[
              styles.paddle,
              styles.computerPaddle,
              {
                width: PADDLE_WIDTH * SCALE,
                height: PADDLE_HEIGHT * SCALE,
                left: computerPaddleX * SCALE,
                top: 20 * SCALE,
              },
            ]}
          />

          {/* Player Paddle */}
          <View
            style={[
              styles.paddle,
              styles.playerPaddle,
              {
                width: PADDLE_WIDTH * SCALE,
                height: PADDLE_HEIGHT * SCALE,
                left: playerPaddleX * SCALE,
                top: (BOARD_HEIGHT - 30) * SCALE,
              },
            ]}
          />

          {/* Ball */}
          <View
            style={[
              styles.ball,
              {
                width: BALL_SIZE * SCALE,
                height: BALL_SIZE * SCALE,
                left: ballX * SCALE,
                top: ballY * SCALE,
                borderRadius: (BALL_SIZE * SCALE) / 2,
              },
            ]}
          />

          {/* Game Over / Ready Modals directly overlaid inside board */}
          {gameStatus === 'READY' && (
            <View style={styles.boardOverlay}>
              <Text style={styles.overlayTitle}>PONG CLASSIC</Text>
              <Text style={styles.overlaySub}>Premier à 5 points gagne !</Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>COMMENCER</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'ROUND_OVER' && (
            <View style={styles.boardOverlay}>
              <Text style={styles.overlayTitle}>BUT !</Text>
              <Text style={styles.overlaySub}>Préparez-vous...</Text>
            </View>
          )}

          {gameStatus === 'GAME_OVER' && (
            <View style={styles.boardOverlay}>
              <Text
                style={[
                  styles.overlayTitle,
                  {color: winner === 'JOUEUR' ? '#2ecc71' : '#e74c3c'},
                ]}>
                {winner === 'JOUEUR' ? 'VICTOIRE !' : 'DEFAITE !'}
              </Text>
              <Text style={styles.overlaySub}>
                Le score est de {playerScore} - {computerScore}
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={resetGame}>
                <Text style={styles.startButtonText}>REJOUER</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Retro Controls Area */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlHint}>
            {Platform.OS === 'web'
              ? 'Utilisez ⬅️ ➡️ ou A/D pour jouer'
              : 'Touchez pour déplacer le paddle'}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.gameControlButton}
              onPressIn={() => {
                isLeftPressed.current = true;
              }}
              onPressOut={() => {
                isLeftPressed.current = false;
              }}>
              <Text style={styles.gameControlText}>◀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gameControlButton, styles.resetButton]}
              onPress={resetGame}>
              <Text style={styles.resetButtonText}>RESET</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameControlButton}
              onPressIn={() => {
                isRightPressed.current = true;
              }}
              onPressOut={() => {
                isRightPressed.current = false;
              }}>
              <Text style={styles.gameControlText}>▶</Text>
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
    backgroundColor: '#0c0f12',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff66',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 255, 102, 0.4)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    marginVertical: 10,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 100,
  },
  scoreLabel: {
    color: '#8a99a6',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  board: {
    position: 'relative',
    borderWidth: 3,
    borderColor: '#33ff33',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#33ff33',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dashedLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.25,
  },
  dash: {
    width: 6,
    height: 6,
    backgroundColor: '#33ff33',
  },
  paddle: {
    position: 'absolute',
    backgroundColor: '#00ff66',
    borderRadius: 4,
    shadowColor: '#00ff66',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  computerPaddle: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  playerPaddle: {
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  boardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#33ff33',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  overlaySub: {
    fontSize: 14,
    color: '#8a99a6',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#33ff33',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#33ff33',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  controlHint: {
    color: '#8a99a6',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  gameControlButton: {
    backgroundColor: '#1f2937',
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: '#374151',
  },
  gameControlText: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#374151',
    width: 80,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  resetButtonText: {
    color: '#ff3333',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default PongGameScreen;
