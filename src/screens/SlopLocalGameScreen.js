import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

// Responsive Board Setup
const BOARD_WIDTH = Math.min(windowWidth - 30, 420);
const BOARD_HEIGHT = Math.min(windowHeight - 340, 400);

const CHAR_WIDTH = 55;
const CHAR_HEIGHT = 55;
const ITEM_SIZE = 40;

// Good AI Apps / criteria to collect (Upvote candidates)
const GOOD_ITEMS = [
  {id: 0, label: '🆓 Free App', desc: 'Must be free to use'},
  {id: 1, label: '🤖 Agent-Native', desc: 'Built for agents from day 1'},
  {id: 2, label: '🥕 Slop Local', desc: 'Indie AI badge of honor'},
  {id: 3, label: '🧠 Useful Tool', desc: 'Solves a real problem'},
  {id: 4, label: '🎮 Fun App', desc: 'Genuinely fun and weird'},
];

// Bad/trash to avoid
const BAD_ITEMS = [
  {type: 'seo', label: '💩 SEO Farm', desc: 'Generated content farms'},
  {type: 'mill', label: '🏭 Content Mill', desc: 'Low effort AI generation'},
  {type: 'scam', label: '🚨 Scam', desc: 'Subscription trap'},
];

const SlopLocalGameScreen = ({navigation}) => {
  const [upvotes, setUpvotes] = useState(0);
  const [reputation, setReputation] = useState(3); // Lives
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, SUBMITTING, VICTORY, GAME_OVER
  const [collectedFeatures, setCollectedFeatures] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);

  const [characterX, setCharacterX] = useState(
    BOARD_WIDTH / 2 - CHAR_WIDTH / 2,
  );
  const [characterExpression, setCharacterExpression] = useState('🧑‍💻');
  const [isStunned, setIsStunned] = useState(false);
  const [fallingItems, setFallingItems] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const characterXRef = useRef(BOARD_WIDTH / 2 - CHAR_WIDTH / 2);

  useEffect(() => {
    characterXRef.current = characterX;
  }, [characterX]);

  // Character Idle Animation
  useEffect(() => {
    let animation;
    if (
      gameStatus === 'PLAYING' ||
      gameStatus === 'READY' ||
      gameStatus === 'VICTORY'
    ) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      bounceAnim.setValue(0);
    }
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [gameStatus, bounceAnim]);

  // Physical Keyboard listener for web
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = e => {
      if (gameStatus !== 'PLAYING' || isStunned) {
        return;
      }
      const moveAmount = 25;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveCharacter('left', moveAmount);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveCharacter('right', moveAmount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, isStunned]);

  const moveCharacter = (direction, amount = 30) => {
    // Input validation (Sentinel alignment)
    const allowedDirections = ['left', 'right'];
    if (!allowedDirections.includes(direction)) {
      console.warn(`[Sentinel] Invalid direction: "${direction}"`);
      return;
    }

    if (isStunned || gameStatus !== 'PLAYING') {
      return;
    }

    setCharacterX(prev => {
      let nextX = prev;
      if (direction === 'left') {
        nextX = Math.max(0, prev - amount);
      } else {
        nextX = Math.min(BOARD_WIDTH - CHAR_WIDTH, prev + amount);
      }
      return nextX;
    });
  };

  const triggerScreenShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 40, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 40, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 6, duration: 40, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -6, duration: 40, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 40, useNativeDriver: true}),
    ]).start();
  };

  const handleGameAction = action => {
    const allowedActions = ['start', 'restart', 'menu'];
    if (!allowedActions.includes(action)) {
      console.warn(`[Sentinel] Invalid action: "${action}"`);
      return;
    }

    if (action === 'start') {
      startGame();
    } else if (action === 'restart') {
      startGame();
    } else if (action === 'menu') {
      navigation.goBack();
    }
  };

  const startGame = () => {
    setGameStatus('PLAYING');
    setUpvotes(0);
    setReputation(3);
    setCollectedFeatures([false, false, false, false, false]);
    setFallingItems([]);
    setAgentLogs([]);
    setCharacterExpression('🧑‍💻');
    setIsStunned(false);
    setCharacterX(BOARD_WIDTH / 2 - CHAR_WIDTH / 2);
  };

  const triggerStun = () => {
    setIsStunned(true);
    setCharacterExpression('😵');
    triggerScreenShake();

    setTimeout(() => {
      setIsStunned(false);
      setCharacterExpression('🧑‍💻');
    }, 800);
  };

  const runSubmissionSimulation = useCallback(() => {
    setGameStatus('SUBMITTING');
    setFallingItems([]);
    setCharacterExpression('🚀');

    const addLog = (text, delay) => {
      setTimeout(() => {
        setAgentLogs(prev => [...prev, text]);
      }, delay);
    };

    addLog('> Connecté à Claude Desktop via MCP...', 200);
    addLog('> Lecture du repository local de l\'application...', 800);
    addLog('> Auto-génération de l\'accroche (tagline)...', 1500);
    addLog('> Choix intelligent de la catégorie : "Indie AI Game"...', 2100);
    addLog('> Soumission de l\'application à sloplocal.com...', 2800);
    addLog('✨ SUCCESS: Projet répertorié sur le Digital Farmers Market !', 3500);

    setTimeout(() => {
      triggerScreenShake();
    }, 3400);

    setTimeout(() => {
      setCharacterExpression('🥕');
      setGameStatus('VICTORY');
      setUpvotes(prev => prev + 500);
    }, 4500);
  }, []);

  const spawnItem = useCallback(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    const missingIndices = collectedFeatures
      .map((col, idx) => (col ? -1 : idx))
      .filter(idx => idx !== -1);

    let itemType;
    let label;
    let itemIndex = -1;

    // 65% Good items, 35% Bad items
    if (Math.random() < 0.65 && missingIndices.length > 0) {
      const randIdx = missingIndices[Math.floor(Math.random() * missingIndices.length)];
      const item = GOOD_ITEMS[randIdx];
      itemType = `feature_${item.id}`;
      label = item.label;
      itemIndex = item.id;
    } else {
      const item = BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];
      itemType = `bad_${item.type}`;
      label = item.label;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      type: itemType,
      label: label,
      x: Math.random() * (BOARD_WIDTH - ITEM_SIZE),
      y: -20,
      speed: 3 + Math.random() * 3,
      itemIndex: itemIndex,
    };

    setFallingItems(prev => [...prev, newItem]);
  }, [gameStatus, collectedFeatures]);

  useEffect(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    const interval = setInterval(spawnItem, 1400);
    return () => clearInterval(interval);
  }, [gameStatus, spawnItem]);

  // Game Loop for updating positions & checking collisions
  useEffect(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    let animationFrameId;

    const updateLoop = () => {
      setFallingItems(prevItems => {
        const nextItems = [];

        for (let i = 0; i < prevItems.length; i++) {
          const item = prevItems[i];
          const nextY = item.y + item.speed;

          if (nextY > BOARD_HEIGHT) {
            continue;
          }

          const charY = BOARD_HEIGHT - CHAR_HEIGHT - 10;
          const charLeft = characterXRef.current;
          const charRight = characterXRef.current + CHAR_WIDTH;

          const itemBottom = nextY + ITEM_SIZE;
          const itemLeft = item.x;
          const itemRight = item.x + ITEM_SIZE;

          // Check Hitbox Collision
          if (
            itemBottom >= charY &&
            nextY <= charY + CHAR_HEIGHT &&
            itemRight >= charLeft &&
            itemLeft <= charRight
          ) {
            handleCollision(item);
            continue;
          }

          nextItems.push({
            ...item,
            y: nextY,
          });
        }

        return nextItems;
      });

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStatus]);

  const handleCollision = item => {
    if (!item || typeof item !== 'object') {
      console.warn('[Sentinel] Invalid collision item');
      return;
    }

    const itemType = item.type;

    if (itemType.startsWith('feature_')) {
      const idx = item.itemIndex;
      if (idx >= 0 && idx < collectedFeatures.length) {
        setCollectedFeatures(prev => {
          const updated = [...prev];
          if (!updated[idx]) {
            updated[idx] = true;
            setUpvotes(u => u + 100);
          } else {
            setUpvotes(u => u + 20); // Duplicate bonus
          }

          const allCollected = updated.every(feat => feat === true);
          if (allCollected) {
            setTimeout(() => {
              runSubmissionSimulation();
            }, 300);
          }

          return updated;
        });
      }
    } else if (itemType.startsWith('bad_')) {
      setReputation(r => {
        const nextRep = r - 1;
        if (nextRep <= 0) {
          setGameStatus('GAME_OVER');
          setCharacterExpression('💀');
        } else {
          triggerStun();
        }
        return nextRep;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[styles.container, {transform: [{translateX: shakeAnim}]}]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleGameAction('menu')}>
            <Text style={styles.backButtonText}>📴 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🥕 SLOP LOCAL GAME</Text>
          <View style={{width: 65}} />
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🥬 DIGITAL FARMERS MARKET</Text>
          <Text style={styles.introSubtitle}>
            Aidez l'agent de l'Indie AI Builder à collecter les bons critères d'applications (gratuites, fun, utiles, agent-native) et évitez le spam !
          </Text>
        </View>

        {/* Dash */}
        <View style={styles.dashboard}>
          <View style={styles.dashBox}>
            <Text style={styles.dashLabel}>UPVOTES 👍</Text>
            <Text style={styles.dashValue}>{upvotes}</Text>
          </View>
          <View style={styles.dashBox}>
            <Text style={styles.dashLabel}>RÉPUTATION</Text>
            <Text style={styles.dashValue}>
              {Array.from({length: 3}).map((_, i) => (i < reputation ? '🥕' : '🗑️'))}
            </Text>
          </View>
        </View>

        {/* App Builder Sequence */}
        <View style={styles.queryMonitor}>
          <Text style={styles.monitorTitle}>Critères pour sloplocal.com :</Text>
          <View style={styles.querySequence}>
            {GOOD_ITEMS.map(feat => {
              const isCollected = collectedFeatures[feat.id];
              return (
                <View
                  key={feat.id}
                  style={[
                    styles.featTag,
                    isCollected ? styles.featTagCollected : styles.featTagMissing,
                  ]}>
                  <Text style={[styles.featTagText, isCollected ? styles.featTagTextCollected : {}]}>
                    {feat.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Main Grid */}
        <View style={styles.gameContainer}>
          <View style={[styles.board, {width: BOARD_WIDTH, height: BOARD_HEIGHT}]}>
            <View style={styles.scanlines} pointerEvents="none" />

            {/* Falling criteria */}
            {fallingItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.fallingItem,
                  {
                    left: item.x,
                    top: item.y,
                    backgroundColor: item.type.startsWith('bad_') ? '#8B0000' : '#4a5d23',
                    borderColor: item.type.startsWith('bad_') ? '#FF4500' : '#39ff14',
                  },
                ]}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}

            {/* Character */}
            <Animated.View
              style={[
                styles.character,
                {
                  left: characterX,
                  transform: [{translateY: bounceAnim}],
                },
              ]}>
              <View style={[styles.characterAvatar, isStunned ? styles.characterAvatarStunned : {}]}>
                <Text style={styles.characterEmoji}>{characterExpression}</Text>
                <Text style={styles.characterName}>Builder</Text>
              </View>
            </Animated.View>

            {/* Overlay READY */}
            {gameStatus === 'READY' && (
              <View style={styles.boardOverlay}>
                <Text style={styles.overlayTextTitle}>DÉMARRER LE PROJET</Text>
                <Text style={styles.overlayTextSubtitle}>
                  Attrapez les bons critères verts et évitez les spams et arnaques de contenu pour lancer votre appli locale !
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleGameAction('start')}
                  accessibilityRole="button"
                  accessibilityLabel="Coder mon appli"
                  accessibilityHint="Démarre la partie de collecte de critères">
                  <Text style={styles.actionButtonText}>CODER MON APPLI</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Overlay SUBMITTING */}
            {gameStatus === 'SUBMITTING' && (
              <View style={[styles.boardOverlay, {backgroundColor: 'rgba(0,0,0,0.92)'}]}>
                <Text style={styles.alertTextTitle}>🤖 AGENT-NATIVE MCP SUBMISSION...</Text>
                <View style={styles.terminalContainer}>
                  {agentLogs.map((log, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.terminalLine,
                        log.startsWith('✨') ? styles.terminalLineSuccess : {},
                      ]}>
                      {log}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Overlay VICTORY */}
            {gameStatus === 'VICTORY' && (
              <View style={[styles.boardOverlay, {backgroundColor: 'rgba(10,30,10,0.95)'}]}>
                <Text style={styles.victoryEmoji}>🥕</Text>
                <Text style={styles.victoryTitle}>PROJET PUBLIÉ !</Text>
                <Text style={styles.victoryMessage}>
                  "Built local. Shipped fast. Not sorry."
                </Text>
                <Text style={styles.scoreSum}>Score : {upvotes} Upvotes 👍</Text>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#39ff14'}]}
                  onPress={() => handleGameAction('restart')}
                  accessibilityRole="button"
                  accessibilityLabel="Rebâtir un projet"
                  accessibilityHint="Recommence une nouvelle partie">
                  <Text style={[styles.actionButtonText, {color: '#000'}]}>REBÂTIR UN PROJET</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Overlay GAME OVER */}
            {gameStatus === 'GAME_OVER' && (
              <View style={styles.boardOverlay}>
                <Text style={styles.gameOverEmoji}>🗑️</Text>
                <Text style={[styles.overlayTextTitle, {color: '#ff3333'}]}>PROJET DISQUALIFIÉ</Text>
                <Text style={styles.overlayTextSubtitle}>
                  Votre projet a été pollué par du spam et des fermes SEO de mauvaise qualité.
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#ff3333'}]}
                  onPress={() => handleGameAction('restart')}
                  accessibilityRole="button"
                  accessibilityLabel="Recommencer"
                  accessibilityHint="Recommence la partie">
                  <Text style={styles.actionButtonText}>RECOMMENCER</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        {gameStatus === 'PLAYING' && (
          <View style={styles.controlsPanel}>
            <TouchableOpacity
              style={styles.movementButton}
              onPress={() => moveCharacter('left')}
              accessibilityRole="button"
              accessibilityLabel="Gauche"
              accessibilityHint="Déplace le constructeur vers la gauche">
              <Text style={styles.movementButtonText}>◀ GAUCHE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementButton, styles.movementButtonRight]}
              onPress={() => moveCharacter('right')}
              accessibilityRole="button"
              accessibilityLabel="Droite"
              accessibilityHint="Déplace le constructeur vers la droite">
              <Text style={styles.movementButtonText}>DROITE ▶</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#39ff14',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  introCard: {
    backgroundColor: 'rgba(0, 255, 102, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    maxWidth: 420,
    marginVertical: 4,
  },
  introTitle: {
    color: '#39ff14',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  introSubtitle: {
    color: '#bdc3c7',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    marginVertical: 4,
  },
  dashBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dashLabel: {
    color: '#8a99a6',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dashValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  queryMonitor: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  monitorTitle: {
    color: '#8a99a6',
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  querySequence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featTag: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  featTagCollected: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: '#39ff14',
  },
  featTagMissing: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featTagText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  featTagTextCollected: {
    color: '#39ff14',
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  board: {
    position: 'relative',
    backgroundColor: '#020305',
    borderWidth: 2,
    borderColor: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    opacity: 0.05,
    borderWidth: 1,
  },
  fallingItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE - 8,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 1.5,
  },
  itemText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  character: {
    position: 'absolute',
    bottom: 10,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    borderWidth: 1.5,
    borderColor: '#39ff14',
    borderRadius: 8,
    padding: 3,
    width: '100%',
    shadowColor: '#39ff14',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  characterAvatarStunned: {
    borderColor: '#ff3333',
    backgroundColor: 'rgba(255, 51, 51, 0.08)',
    shadowColor: '#ff3333',
  },
  characterEmoji: {
    fontSize: 22,
  },
  characterName: {
    color: '#39ff14',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  boardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    zIndex: 100,
  },
  overlayTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#39ff14',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  overlayTextSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(57, 255, 20, 0.2)',
    borderWidth: 1.5,
    borderColor: '#39ff14',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#39ff14',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  alertTextTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  terminalContainer: {
    width: '100%',
    backgroundColor: '#020305',
    borderColor: '#39ff14',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 160,
  },
  terminalLine: {
    color: '#39ff14',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
    lineHeight: 12,
  },
  terminalLineSuccess: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  victoryEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  victoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  victoryMessage: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  scoreSum: {
    fontSize: 13,
    color: '#39ff14',
    fontWeight: 'bold',
    marginBottom: 18,
  },
  gameOverEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  controlsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 5,
    marginVertical: 4,
  },
  movementButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  movementButtonRight: {
    borderColor: '#4b5563',
  },
  movementButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

export default SlopLocalGameScreen;
