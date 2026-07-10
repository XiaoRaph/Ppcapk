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
} from 'react-native';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

// Responsive Board Setup
const BOARD_WIDTH = Math.min(windowWidth - 30, 420);
const BOARD_HEIGHT = Math.min(windowHeight - 340, 400);

// Elements sizes (percentage/scaled based)
const CHAR_WIDTH = 55;
const CHAR_HEIGHT = 55;
const ITEM_SIZE = 40;

// SQL injection fragments required to drop the table
const REQUIRED_PARTS = [
  {id: 0, label: "Robert')", desc: "Nom d'origine"},
  {id: 1, label: ';', desc: 'Fin de requête'},
  {id: 2, label: 'DROP TABLE', desc: 'Commande destructrice'},
  {id: 3, label: 'Students', desc: 'Nom de la table target'},
  {id: 4, label: '; --', desc: 'Commentaire SQL (bypass)'},
];

const HAZARDS = [
  {
    type: 'waf',
    label: '🛡️ WAF',
    name: 'Web Application Firewall',
    desc: 'Bloque la requête',
  },
  {
    type: 'sanitize',
    label: '🧼 SANITIZE',
    name: 'Input Cleaner',
    desc: 'Nettoie les caractères spéciaux',
  },
  {
    type: 'prep',
    label: '🔒 PREP_STMT',
    name: 'Prepared Statement',
    desc: 'Paramètre les variables de requête',
  },
];

const MOCK_STUDENTS = [
  {id: 1, name: 'Alice', grade: 'A+', comment: 'Excellent travail'},
  {id: 2, name: 'Bob', grade: 'B', comment: 'Bonne participation'},
  {id: 3, name: 'Charlie', grade: 'A', comment: 'Très motivé'},
  {
    id: 4,
    name: "Robert'); DROP TABLE Students; --",
    grade: 'A+',
    comment: 'Inscrit par maman',
  },
];

const BobbyTablesGameScreen = ({navigation}) => {
  // Game states
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, DROPPING, VICTORY, GAME_OVER
  const [collectedParts, setCollectedParts] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [students, setStudents] = useState(MOCK_STUDENTS);

  // Position and dynamic states
  const [characterX, setCharacterX] = useState(
    BOARD_WIDTH / 2 - CHAR_WIDTH / 2,
  );
  const [characterExpression, setCharacterExpression] = useState('🧑‍💻');
  const [isStunned, setIsStunned] = useState(false);
  const [fallingItems, setFallingItems] = useState([]);

  // Terminal Logs for DROP TABLE simulation
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const characterXRef = useRef(BOARD_WIDTH / 2 - CHAR_WIDTH / 2);

  // Individual row opacity and scale animations for the DROP TABLE simulation
  const rowAnims = useRef([
    {opacity: new Animated.Value(1), scale: new Animated.Value(1)},
    {opacity: new Animated.Value(1), scale: new Animated.Value(1)},
    {opacity: new Animated.Value(1), scale: new Animated.Value(1)},
    {opacity: new Animated.Value(1), scale: new Animated.Value(1)},
  ]).current;

  // Sync ref with state
  useEffect(() => {
    characterXRef.current = characterX;
  }, [characterX]);

  // Character Idle Animation (Bouncing rhythm)
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
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 450,
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

  // Handle physical keyboard input for web compatibility
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
      } else if (e.key === ' ' && gameStatus === 'READY') {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, isStunned]);

  // Defensive validation on move input (Sentinel security alignment)
  const moveCharacter = (direction, amount = 30) => {
    // Input validation
    const allowedDirections = ['left', 'right'];
    if (!allowedDirections.includes(direction)) {
      console.warn(
        `[Sentinel] Action bloquée : direction invalide "${direction}"`,
      );
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

  // Screen shake animation on errors/hazards
  const triggerScreenShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Reset/Restart actions with input validation (Sentinel alignment)
  const handleGameAction = action => {
    const allowedActions = ['start', 'restart', 'menu'];
    if (!allowedActions.includes(action)) {
      console.warn(`[Sentinel] Action de jeu non autorisée : "${action}"`);
      return;
    }

    if (action === 'start') {
      startGame();
    } else if (action === 'restart') {
      resetGame();
    } else if (action === 'menu') {
      navigation.goBack();
    }
  };

  const startGame = () => {
    setGameStatus('PLAYING');
    setScore(0);
    setLives(3);
    setCollectedParts([false, false, false, false, false]);
    setFallingItems([]);
    setTerminalLogs([]);
    setStudents(MOCK_STUDENTS);
    setCharacterExpression('🧑‍💻');
    setIsStunned(false);
    setCharacterX(BOARD_WIDTH / 2 - CHAR_WIDTH / 2);

    // Reset row animations
    rowAnims.forEach(anim => {
      anim.opacity.setValue(1);
      anim.scale.setValue(1);
    });
  };

  const resetGame = () => {
    startGame();
  };

  // Trigger stun effect when hitting a hazard
  const triggerStun = () => {
    setIsStunned(true);
    setCharacterExpression('😵');
    triggerScreenShake();

    setTimeout(() => {
      setIsStunned(false);
      setCharacterExpression('🧑‍💻');
    }, 850);
  };

  // The main DROP TABLE cinematic simulation!
  const runDropTableSimulation = useCallback(() => {
    setGameStatus('DROPPING');
    setFallingItems([]);
    setCharacterExpression('🧙‍♂️'); // Cast spell emoji

    const addLog = (text, delay) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, text]);
      }, delay);
    };

    addLog('> Concaténation de la requête SQL...', 200);
    addLog(
      "> Requête : SELECT * FROM Students WHERE Name = 'Robert'); DROP TABLE Students; --';",
      800,
    );
    addLog("> Envoi au serveur de la base de données de l'école...", 1500);
    addLog('⚠️ ALERTE : INJECTION SQL DÉTECTÉE !', 2200);
    addLog('> Commande reconnue : DROP TABLE Students;', 2800);
    addLog('> Supression de la table en cours...', 3300);

    // Trigger explosive screen shake during deletion
    setTimeout(() => {
      triggerScreenShake();
    }, 3200);

    // Animate table rows disappearing one by one (Simulation of drop table!)
    rowAnims.forEach((anim, idx) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 0.1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        setStudents(prev => prev.filter((_, sIdx) => sIdx !== 0));
        setScore(prev => prev + 250);
      }, 3500 + idx * 600);
    });

    const finalDelay = 3500 + rowAnims.length * 600;

    addLog('> Table "Students" supprimée avec succès !', finalDelay);
    addLog('> 0 ligne(s) restante(s).', finalDelay + 400);

    setTimeout(() => {
      setCharacterExpression('😎'); // Hacker glasses emoji
      setGameStatus('VICTORY');
    }, finalDelay + 1200);
  }, [rowAnims, shakeAnim]);

  // Spawns a falling item
  const spawnItem = useCallback(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    // Determine what item to spawn.
    // If we haven't collected all parts, we have a higher chance of spawning a missing part
    const missingParts = REQUIRED_PARTS.filter(p => !collectedParts[p.id]);

    let itemType;
    let label;
    let itemIndex = -1;

    // 60% chance to spawn a part, 40% chance to spawn a hazard
    if (Math.random() < 0.6 && missingParts.length > 0) {
      // Pick a random missing part to facilitate game progression
      const randomPartIndex = Math.floor(Math.random() * missingParts.length);
      const targetPart = missingParts[randomPartIndex];
      itemType = `part_${targetPart.id}`;
      label = targetPart.label;
      itemIndex = targetPart.id;
    } else {
      // Spawn hazard
      const randomHazard = HAZARDS[Math.floor(Math.random() * HAZARDS.length)];
      itemType = `hazard_${randomHazard.type}`;
      label = randomHazard.label;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      type: itemType,
      label: label,
      x: Math.random() * (BOARD_WIDTH - ITEM_SIZE),
      y: -20,
      speed: 3 + Math.random() * 2.5,
      itemIndex: itemIndex,
    };

    setFallingItems(prev => [...prev, newItem]);
  }, [gameStatus, collectedParts]);

  // Spawning scheduler
  useEffect(() => {
    if (gameStatus !== 'PLAYING') {
      return;
    }

    const spawnInterval = setInterval(spawnItem, 1600);
    return () => clearInterval(spawnInterval);
  }, [gameStatus, spawnItem]);

  // Main falling items game loop
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

          // Check for boundary (missed item)
          if (nextY > BOARD_HEIGHT) {
            continue;
          }

          // Check Collision with Character
          // Character is positioned at y = BOARD_HEIGHT - CHAR_HEIGHT - 10
          const charY = BOARD_HEIGHT - CHAR_HEIGHT - 10;
          const charLeft = characterXRef.current;
          const charRight = characterXRef.current + CHAR_WIDTH;

          const itemBottom = nextY + ITEM_SIZE;
          const itemLeft = item.x;
          const itemRight = item.x + ITEM_SIZE;

          // Hitbox check
          if (
            itemBottom >= charY &&
            nextY <= charY + CHAR_HEIGHT &&
            itemRight >= charLeft &&
            itemLeft <= charRight
          ) {
            // Collision detected!
            handleCollision(item);
            continue; // Item disappears on collision
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

  // Handle collisions (Sentinel validated)
  const handleCollision = item => {
    if (!item || typeof item !== 'object') {
      console.warn("[Sentinel] Paramètre d'item de collision invalide");
      return;
    }

    const itemType = item.type;

    if (itemType.startsWith('part_')) {
      const partIdx = item.itemIndex;
      if (partIdx >= 0 && partIdx < collectedParts.length) {
        setCollectedParts(prev => {
          const updated = [...prev];
          if (!updated[partIdx]) {
            updated[partIdx] = true;
            setScore(s => s + 100);
          } else {
            setScore(s => s + 20); // Bonus for duplicate parts
          }

          // Check if all parts collected
          const allCollected = updated.every(p => p === true);
          if (allCollected) {
            // Delay slightly so player sees the last part collected
            setTimeout(() => {
              runDropTableSimulation();
            }, 300);
          }

          return updated;
        });
      }
    } else if (itemType.startsWith('hazard_')) {
      setLives(l => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          setGameStatus('GAME_OVER');
          setCharacterExpression('💀');
        } else {
          triggerStun();
        }
        return nextLives;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[styles.container, {transform: [{translateX: shakeAnim}]}]}>
        {/* Header bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleGameAction('menu')}>
            <Text style={styles.backButtonText}>📴 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>LITTLE BOBBY TABLES</Text>
          <View style={{width: 65}} />
        </View>

        {/* Description & Comic Reference banner */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🚨 SQL INJECTION ARCADE</Text>
          <Text style={styles.introSubtitle}>
            Aidez Bobby Tables à compiler son injection SQL pour faire un "DROP
            TABLE" sur la base d'école ! Évitez les filtres de sécurité.
          </Text>
        </View>

        {/* Dashboard: Lives, Score & Progress */}
        <View style={styles.dashboard}>
          <View style={styles.dashBox}>
            <Text style={styles.dashLabel}>SCORE XP</Text>
            <Text style={styles.dashValue}>{score}</Text>
          </View>
          <View style={styles.dashBox}>
            <Text style={styles.dashLabel}>VIES (SANITIZED)</Text>
            <Text style={styles.dashValue}>
              {Array.from({length: 3}).map((_, i) => (i < lives ? '❤️' : '🖤'))}
            </Text>
          </View>
        </View>

        {/* SQL Code Builder Monitor */}
        <View style={styles.queryMonitor}>
          <Text style={styles.monitorTitle}>Requête SQL construite :</Text>
          <View style={styles.querySequence}>
            {REQUIRED_PARTS.map(part => {
              const isCollected = collectedParts[part.id];
              return (
                <View
                  key={part.id}
                  style={[
                    styles.partTag,
                    isCollected
                      ? styles.partTagCollected
                      : styles.partTagMissing,
                  ]}>
                  <Text
                    style={[
                      styles.partTagText,
                      isCollected ? styles.partTagTextCollected : {},
                    ]}>
                    {part.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* GAME SCREEN GRID */}
        <View style={styles.gameContainer}>
          {/* Visual Database Board */}
          <View style={styles.dbBoard}>
            <Text style={styles.dbHeader}>🗄️ TABLE: Students (SchoolDB)</Text>
            <View style={styles.dbTable}>
              <View style={styles.dbTableHeader}>
                <Text
                  style={[styles.dbCell, styles.dbCellHeader, {width: '15%'}]}>
                  ID
                </Text>
                <Text
                  style={[styles.dbCell, styles.dbCellHeader, {width: '55%'}]}>
                  Nom de l'étudiant
                </Text>
                <Text
                  style={[styles.dbCell, styles.dbCellHeader, {width: '30%'}]}>
                  Moyenne
                </Text>
              </View>

              {MOCK_STUDENTS.map((student, idx) => {
                const anim = rowAnims[idx];
                return (
                  <Animated.View
                    key={student.id}
                    style={[
                      styles.dbRow,
                      idx % 2 === 0 ? styles.dbRowEven : styles.dbRowOdd,
                      {
                        opacity: anim.opacity,
                        transform: [{scale: anim.scale}],
                      },
                    ]}>
                    <Text style={[styles.dbCell, {width: '15%'}]}>
                      {student.id}
                    </Text>
                    <Text
                      style={[
                        styles.dbCell,
                        {
                          width: '55%',
                          fontWeight: idx === 3 ? 'bold' : 'normal',
                          color: idx === 3 ? '#e74c3c' : '#ffffff',
                        },
                      ]}
                      numberOfLines={1}>
                      {student.name}
                    </Text>
                    <Text style={[styles.dbCell, {width: '30%'}]}>
                      {student.grade}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* ACTIVE PLAYING FIELD */}
          <View
            style={[styles.board, {width: BOARD_WIDTH, height: BOARD_HEIGHT}]}>
            {/* Grid scanlines effect */}
            <View style={styles.scanlines} pointerEvents="none" />

            {/* Falling items renderer */}
            {fallingItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.fallingItem,
                  {
                    left: item.x,
                    top: item.y,
                    backgroundColor: item.type.startsWith('hazard_')
                      ? '#cf1717'
                      : '#00aa00',
                    borderColor: item.type.startsWith('hazard_')
                      ? '#ff6b6b'
                      : '#39ff14',
                  },
                ]}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}

            {/* Animated Character "Bobby Tables" */}
            <Animated.View
              style={[
                styles.character,
                {
                  left: characterX,
                  transform: [{translateY: bounceAnim}],
                },
              ]}>
              <View
                style={[
                  styles.characterAvatar,
                  isStunned ? styles.characterAvatarStunned : {},
                ]}>
                <Text style={styles.characterEmoji}>{characterExpression}</Text>
                <Text style={styles.characterName}>Bobby</Text>
              </View>
            </Animated.View>

            {/* Overlay for READY status */}
            {gameStatus === 'READY' && (
              <View style={styles.boardOverlay}>
                <Text style={styles.overlayTextTitle}>PRÊT À INJECTER ?</Text>
                <Text style={styles.overlayTextSubtitle}>
                  Attrapez les fragments de code vert fluo pour composer la
                  requête SQL destructrice ! Évitez les filtres de sécurité
                  rouges (WAF/Sanitizer).
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleGameAction('start')}>
                  <Text style={styles.actionButtonText}>LANCER L'HACKING</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Overlay for DROPPING TABLE simulation */}
            {gameStatus === 'DROPPING' && (
              <View
                style={[
                  styles.boardOverlay,
                  {backgroundColor: 'rgba(0,0,0,0.92)'},
                ]}>
                <Text style={styles.alertTextTitle}>
                  ⚠️ INJECTION SQL EN COURS...
                </Text>
                <View style={styles.terminalContainer}>
                  {terminalLogs.map((log, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.terminalLine,
                        log.startsWith('⚠️') ? styles.terminalLineAlert : {},
                        log.includes('succès')
                          ? styles.terminalLineSuccess
                          : {},
                      ]}>
                      {log}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Overlay for VICTORY screen */}
            {gameStatus === 'VICTORY' && (
              <View
                style={[
                  styles.boardOverlay,
                  {backgroundColor: 'rgba(5,20,5,0.95)'},
                ]}>
                <Text style={styles.victoryEmoji}>🏆</Text>
                <Text style={styles.victoryTitle}>TABLE DESTRUITE !</Text>
                <Text style={styles.victoryMessage}>
                  "Et j'espère que vous avez appris à assainir vos entrées de
                  base de données !"
                </Text>
                <Text style={styles.scoreSum}>Score final : {score} XP</Text>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#39ff14'}]}
                  onPress={() => handleGameAction('restart')}>
                  <Text style={[styles.actionButtonText, {color: '#000'}]}>
                    REJOUER
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Overlay for GAME_OVER status */}
            {gameStatus === 'GAME_OVER' && (
              <View style={styles.boardOverlay}>
                <Text style={styles.gameOverEmoji}>💀</Text>
                <Text style={[styles.overlayTextTitle, {color: '#ff3333'}]}>
                  HACKING ÉCHOUÉ
                </Text>
                <Text style={styles.overlayTextSubtitle}>
                  La sécurité informatique a assaini vos requêtes ! Bobby a été
                  bloqué par les administrateurs réseau.
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#ff3333'}]}
                  onPress={() => handleGameAction('restart')}>
                  <Text style={styles.actionButtonText}>RÉESSAYER</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Action Controls Panel */}
        {gameStatus === 'PLAYING' && (
          <View style={styles.controlsPanel}>
            <TouchableOpacity
              style={styles.movementButton}
              onPress={() => moveCharacter('left')}>
              <Text style={styles.movementButtonText}>◀ GAUCHE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementButton, styles.movementButtonRight]}
              onPress={() => moveCharacter('right')}>
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
    backgroundColor: '#05070a',
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
    textShadowColor: 'rgba(57, 255, 20, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 6,
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
    letterSpacing: 1,
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
  partTag: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  partTagCollected: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: '#39ff14',
  },
  partTagMissing: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  partTagText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  partTagTextCollected: {
    color: '#39ff14',
    fontWeight: 'bold',
    textShadowColor: 'rgba(57, 255, 20, 0.5)',
    textShadowRadius: 3,
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dbBoard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#080a0f',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  dbHeader: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  dbTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dbTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 4,
  },
  dbRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  dbRowEven: {
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  dbRowOdd: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dbCell: {
    color: '#cbd5e1',
    fontSize: 10,
    paddingHorizontal: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dbCellHeader: {
    color: '#94a3b8',
    fontWeight: 'bold',
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
    backgroundColor: 'transparent',
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
    letterSpacing: 0.5,
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
    borderColor: '#ff3333',
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
  terminalLineAlert: {
    color: '#ff3333',
    fontWeight: 'bold',
  },
  terminalLineSuccess: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  victoryEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  victoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38bdf8',
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

export default BobbyTablesGameScreen;
