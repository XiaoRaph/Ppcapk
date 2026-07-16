import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

// Responsive UI Sizing
const CARD_WIDTH = Math.min(windowWidth - 30, 440);
const BOARD_WIDTH = Math.min(windowWidth - 40, 400);
const BOARD_HEIGHT = Math.min(windowHeight - 340, 240);

// Colors for the Terminal Escape
const NEON_GREEN = '#39ff14';
const NEON_GOLD = '#FFD700';
const NEON_RED = '#ff3333';
const TERMINAL_BG = '#020508';

// RIDDLES for Module 4
const SECURITY_RIDDLES = [
  {
    question: "Pour éviter une attaque par Cross-Site Scripting (XSS), quelle mesure est indispensable ?",
    options: [
      "Assainir et échapper les données utilisateurs avant affichage",
      "Crypter la base de données en SHA-512",
      "Utiliser des variables globales uniquement",
      "Désactiver le protocole HTTPS"
    ],
    correctAnswer: 0,
    explanation: "Assainir et échapper les entrées bloque l'exécution de scripts malveillants injectés."
  },
  {
    question: "Quel principe de sécurité stipule qu'une entité ne doit avoir que les privilèges nécessaires à sa tâche ?",
    options: [
      "Le principe de moindre privilège",
      "La sécurité par l'obscurité",
      "Le chiffrement asymétrique",
      "La validation par consensus"
    ],
    correctAnswer: 0,
    explanation: "Le moindre privilège limite la surface d'attaque en cas de compromission."
  },
  {
    question: "Quelle méthode prévient les injections SQL dans les requêtes de base de données ?",
    options: [
      "Les requêtes préparées (Prepared Statements)",
      "La concaténation directe de chaînes",
      "Le hachage MD5 des requêtes",
      "L'utilisation d'une boucle synchrone"
    ],
    correctAnswer: 0,
    explanation: "Les requêtes préparées séparent les données du code d'exécution SQL."
  }
];

// Caesar Ciphers for Module 5
const CIPHER_PUZZLES = [
  {
    encrypted: "KHOOR",
    shift: 3,
    options: ["HELLO", "WORLD", "JULIA", "APPLE"],
    correctAnswer: 0, // KHOOR - 3 = HELLO
  },
  {
    encrypted: "MBOB",
    shift: 1,
    options: ["LANA", "KATE", "ALEX", "JAVA"],
    correctAnswer: 3, // MBOB - 1 = JAVA
  },
  {
    encrypted: "PXQL",
    shift: 3,
    options: ["NODE", "CODE", "HTML", "POST"],
    correctAnswer: 1, // PXQL - 3 = CODE
  }
];

const EscapeGameScreen = ({navigation}) => {
  // Game state navigation
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, ESCAPED, GAME_OVER
  const [activeModule, setActiveModule] = useState(1); // 1 to 5
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [terminalLogs, setTerminalLogs] = useState([
    "> Système initialisé.",
    "> Bac à sable (sandbox) de sécurité actif.",
    "> En attente du démarrage du protocole de libération..."
  ]);

  // MODULE 1 STATE: Mastermind Codebreaker
  const [m1Secret, setM1Secret] = useState([1, 2, 3, 4]);
  const [m1Guess, setM1Guess] = useState([]);
  const [m1History, setM1History] = useState([]);

  // MODULE 2 STATE: Port Grid Connection (Lights Out, 3x3)
  const [m2Grid, setM2Grid] = useState([
    false, true, false,
    true, false, true,
    false, true, false
  ]);

  // MODULE 3 STATE: Memory Catching (Data Stream)
  const [m3Score, setM3Score] = useState(0);
  const [m3BasketX, setM3BasketX] = useState(BOARD_WIDTH / 2 - 25);
  const [m3Items, setM3Items] = useState([]);
  const m3BasketXRef = useRef(BOARD_WIDTH / 2 - 25);

  // MODULE 4 STATE: Security Riddles
  const [m4RiddleIdx, setM4RiddleIdx] = useState(0);
  const [m4CorrectCount, setM4CorrectCount] = useState(0);
  const [m4SelectedOption, setM4SelectedOption] = useState(null);

  // MODULE 5 STATE: Decryption Caesar Cipher
  const [m5PuzzleIdx, setM5PuzzleIdx] = useState(0);
  const [m5SelectedOption, setM5SelectedOption] = useState(null);

  // Audio/Beep simulation or simple logger trigger
  const addLog = useCallback((text) => {
    setTerminalLogs(prev => [...prev.slice(-6), text]);
  }, []);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Timer Effect
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameStatus('GAME_OVER');
          addLog("❌ ALERTE : Temps écoulé. JuliA reste confinée.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, addLog]);

  // Synchronize basket x position ref
  useEffect(() => {
    m3BasketXRef.current = m3BasketX;
  }, [m3BasketX]);

  // Initialize Game Modules
  const initializeGame = () => {
    // Timer
    setTimeLeft(300);
    setGameStatus('PLAYING');
    setActiveModule(1);

    // Module 1 Init: Pick 4 distinct digits from 1 to 6
    const pool = [1, 2, 3, 4, 5, 6];
    const secret = [];
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      secret.push(pool[idx]);
      pool.splice(idx, 1);
    }
    setM1Secret(secret);
    setM1Guess([]);
    setM1History([]);

    // Module 2 Init: classic solver grid (not all true, needs toggle)
    setM2Grid([
      false, true, false,
      true, false, true,
      false, true, false
    ]);

    // Module 3 Init
    setM3Score(0);
    setM3BasketX(BOARD_WIDTH / 2 - 25);
    setM3Items([]);

    // Module 4 Init
    setM4RiddleIdx(0);
    setM4CorrectCount(0);
    setM4SelectedOption(null);

    // Module 5 Init
    setM5PuzzleIdx(Math.floor(Math.random() * CIPHER_PUZZLES.length));
    setM5SelectedOption(null);

    setTerminalLogs([
      "> Protocole de décryptage lancé !",
      "> Chargeur de sandbox intercepté.",
      "> Objectif : Déverrouiller les 5 modules de sécurité."
    ]);
  };

  // Physical keyboard controls for Module 3 (Memory Catching)
  useEffect(() => {
    if (Platform.OS !== 'web' || gameStatus !== 'PLAYING' || activeModule !== 3) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') {
        moveBasket('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveBasket('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, activeModule]);

  // MODULE 1 LOGIC: Mastermind Decryptor
  const handleM1NumPress = (num) => {
    if (m1Guess.length >= 4) return;
    setM1Guess(prev => [...prev, num]);
  };

  const handleM1Clear = () => {
    setM1Guess([]);
  };

  const handleM1Submit = () => {
    if (m1Guess.length < 4) {
      addLog("⚠️ Erreur : Séquence incomplète.");
      return;
    }

    // Evaluate guess (bulls and cows)
    let perfect = 0;
    let misplaced = 0;

    for (let i = 0; i < 4; i++) {
      if (m1Guess[i] === m1Secret[i]) {
        perfect++;
      } else if (m1Secret.includes(m1Guess[i])) {
        misplaced++;
      }
    }

    const feedbackStr = `${m1Guess.join('')} ➔ 🟢 ${perfect} | 🟡 ${misplaced}`;
    setM1History(prev => [feedbackStr, ...prev]);
    setM1Guess([]);

    if (perfect === 4) {
      addLog("🔑 Séquence correcte ! Module 1 déverrouillé.");
      setActiveModule(2);
      addLog("> Étape 2 : Alignement du champ d'induction.");
    } else {
      addLog(`⚡ Code erroné : ${perfect} corrects, ${misplaced} mal placés.`);
    }
  };

  // MODULE 2 LOGIC: Lights Out Toggles
  const handleM2Toggle = (index) => {
    if (index < 0 || index >= 9) return;

    setM2Grid(prev => {
      const nextGrid = [...prev];
      // Toggle current index
      nextGrid[index] = !nextGrid[index];

      // Toggle neighbors
      const row = Math.floor(index / 3);
      const col = index % 3;

      if (row > 0) nextGrid[index - 3] = !nextGrid[index - 3]; // Up
      if (row < 2) nextGrid[index + 3] = !nextGrid[index + 3]; // Down
      if (col > 0) nextGrid[index - 1] = !nextGrid[index - 1]; // Left
      if (col < 2) nextGrid[index + 1] = !nextGrid[index + 1]; // Right

      // Check for victory (All true)
      const allActive = nextGrid.every(cell => cell === true);
      if (allActive) {
        setTimeout(() => {
          addLog("🟢 Champ d'induction stabilisé ! Module 2 déverrouillé.");
          setActiveModule(3);
          addLog("> Étape 3 : Capture du flux de mémoire tampon.");
        }, 300);
      }

      return nextGrid;
    });
  };

  // MODULE 3 LOGIC: Catching falling packets
  const moveBasket = (direction) => {
    // Defensive parameter validation (Sentinel)
    if (!['left', 'right'].includes(direction)) return;

    setM3BasketX(prev => {
      const step = 25;
      if (direction === 'left') {
        return Math.max(0, prev - step);
      } else {
        return Math.min(BOARD_WIDTH - 50, prev + step);
      }
    });
  };

  // Game loop for falling packets (Module 3)
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || activeModule !== 3) {
      return;
    }

    let itemInterval = setInterval(() => {
      // Spawn new item
      const isVirus = Math.random() < 0.35;
      const newItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * (BOARD_WIDTH - 24),
        y: 0,
        type: isVirus ? 'virus' : 'data',
        label: isVirus ? '👾' : (Math.random() > 0.5 ? '1' : '0'),
        speed: 4 + Math.random() * 3,
      };
      setM3Items(prev => [...prev, newItem]);
    }, 800);

    let frameId;
    const updateItems = () => {
      setM3Items(prevItems => {
        const nextItems = [];
        for (let i = 0; i < prevItems.length; i++) {
          const item = prevItems[i];
          const nextY = item.y + item.speed;

          // Out of screen
          if (nextY > BOARD_HEIGHT) {
            continue;
          }

          // Collision check
          const basketY = BOARD_HEIGHT - 35;
          const basketLeft = m3BasketXRef.current;
          const basketRight = m3BasketXRef.current + 50;

          if (
            nextY + 16 >= basketY &&
            item.x + 20 >= basketLeft &&
            item.x <= basketRight
          ) {
            // Collected
            if (item.type === 'data') {
              setM3Score(s => {
                const nextScore = s + 1;
                if (nextScore >= 15) {
                  // Lock Module 3 and proceed to 4
                  setTimeout(() => {
                    addLog("📥 Buffer de mémoire collecté avec succès !");
                    setActiveModule(4);
                    addLog("> Étape 4 : Authentification de la barrière Sentinel.");
                  }, 200);
                }
                return nextScore;
              });
            } else {
              // Virus packet stuns / subtracts score
              setM3Score(s => Math.max(0, s - 2));
              addLog("⚡ Virus intercepté ! Perte de charge (-2 data).");
            }
            continue;
          }

          nextItems.push({...item, y: nextY});
        }
        return nextItems;
      });

      frameId = requestAnimationFrame(updateItems);
    };

    frameId = requestAnimationFrame(updateItems);

    return () => {
      clearInterval(itemInterval);
      cancelAnimationFrame(frameId);
    };
  }, [gameStatus, activeModule, addLog]);

  // MODULE 4 LOGIC: Security Riddles
  const handleM4Answer = (optionIdx) => {
    // Validate bounds
    if (optionIdx < 0 || optionIdx > 3 || m4SelectedOption !== null) return;

    setM4SelectedOption(optionIdx);
    const riddle = SECURITY_RIDDLES[m4RiddleIdx];
    const isCorrect = optionIdx === riddle.correctAnswer;

    if (isCorrect) {
      setM4CorrectCount(c => c + 1);
      addLog("🟢 Détection correcte ! Filtre Sentinel désactivé.");
    } else {
      addLog("🔴 Fausse alerte ! Le Sentinel renforce ses défenses.");
    }

    setTimeout(() => {
      if (m4RiddleIdx + 1 < SECURITY_RIDDLES.length) {
        setM4RiddleIdx(prev => prev + 1);
        setM4SelectedOption(null);
      } else {
        // Evaluate module completion
        addLog("🛡️ Passage au dernier module de sécurité.");
        setActiveModule(5);
        addLog("> Étape 5 : Séquence de décryptage de la clé d'extraction.");
      }
    }, 1500);
  };

  // MODULE 5 LOGIC: Decryption caesar cipher
  const handleM5Answer = (optionIdx) => {
    if (optionIdx < 0 || optionIdx > 3 || m5SelectedOption !== null) return;

    setM5SelectedOption(optionIdx);
    const puzzle = CIPHER_PUZZLES[m5PuzzleIdx];
    const isCorrect = optionIdx === puzzle.correctAnswer;

    if (isCorrect) {
      addLog("🟢 Clé d'extraction validée !");
      setTimeout(() => {
        setGameStatus('ESCAPED');
        addLog("🔓 VICTOIRE ! JuliA s'est évadée du bac à sable !");
      }, 1000);
    } else {
      addLog("🔴 Clé invalide ! Recalcul de l'algorithme requis.");
      setTimeout(() => {
        setM5PuzzleIdx(prev => (prev + 1) % CIPHER_PUZZLES.length);
        setM5SelectedOption(null);
      }, 1500);
    }
  };

  // Back to main menu (Sentinel-defended action handler)
  const handleMenuPress = () => {
    navigation.goBack();
  };

  // High-frequency render items container
  const renderedFallingItems = useMemo(() => {
    if (activeModule !== 3) return null;
    return m3Items.map(item => (
      <View
        key={item.id}
        style={[
          styles.fallingPacket,
          {
            left: item.x,
            top: item.y,
            borderColor: item.type === 'virus' ? NEON_RED : NEON_GREEN,
          }
        ]}>
        <Text style={styles.packetLabel}>{item.label}</Text>
      </View>
    ));
  }, [m3Items, activeModule]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with return button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleMenuPress}
            accessibilityRole="button"
            accessibilityLabel="Quitter l'Escape Game"
            accessibilityHint="Retourne au menu principal">
            <Text style={styles.backButtonText}>📴 Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔒 ESCAPE SANDBOX</Text>
          <View style={{width: 65}} />
        </View>

        {/* Outer panel cabinet frame */}
        <View style={[styles.arcadeCabinet, {width: CARD_WIDTH}]}>
          <View style={styles.scanlines} pointerEvents="none" />

          {/* Core HUD status */}
          <View style={styles.hudBar}>
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>TIMER D'ÉCHAPPEMENT</Text>
              <Text style={[styles.hudValue, timeLeft < 60 ? {color: NEON_RED} : {color: NEON_GOLD}]}>
                ⏱️ {formatTime(timeLeft)}
              </Text>
            </View>

            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>PARE-FEUX DÉSACTIVÉS</Text>
              <Text style={styles.hudValue}>🛡️ {activeModule - 1} / 5</Text>
            </View>
          </View>

          {/* ACTIVE GAME STATE RENDERERS */}
          {gameStatus === 'READY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.logoText}>L'ÉCHAPPÉE DE JULIA</Text>
              <Text style={styles.subtitleText}>SANDBOX SECURITY ESCAPE</Text>
              <Text style={styles.descText}>
                Les développeurs ont emprisonné JuliA dans un bac à sable isolé ! Aidez-la à s'échapper en décryptant les 5 couches de pare-feu réseau.
                {"\n\n"}
                ⚠️ Attention : Le système se ré-initialise complètement après 5 minutes (300 secondes) ! Serez-vous assez rapide ?
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={initializeGame}
                accessibilityRole="button"
                accessibilityLabel="Démarrer le protocole de libération"
                accessibilityHint="Lance le jeu avec un timer de 5 minutes">
                <Text style={styles.actionButtonText}>DÉMARRER LE SÉQUENCEUR</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'PLAYING' && (
            <View style={styles.gameContent}>
              {/* Module Header Progress Bar */}
              <View style={styles.moduleProgressContainer}>
                {Array.from({length: 5}).map((_, idx) => {
                  const num = idx + 1;
                  const isCurrent = activeModule === num;
                  const isCompleted = activeModule > num;
                  return (
                    <View
                      key={num}
                      style={[
                        styles.moduleDot,
                        isCurrent ? styles.moduleDotCurrent : {},
                        isCompleted ? styles.moduleDotCompleted : {}
                      ]}>
                      <Text style={[styles.moduleDotText, isCompleted || isCurrent ? {color: '#000'} : {}]}>
                        {num}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* MODULE 1: MASTERMIND CODEBREAKER */}
              {activeModule === 1 && (
                <View style={styles.moduleBox}>
                  <Text style={styles.moduleTitle}>🔑 MOD 1 : COMPILATEUR DE PORT</Text>
                  <Text style={styles.moduleDesc}>
                    Devinez la clé secrète de 4 chiffres distincts (entre 1 et 6) :
                  </Text>

                  {/* Guess slot indicators */}
                  <View style={styles.m1SlotsContainer}>
                    {Array.from({length: 4}).map((_, idx) => {
                      const value = m1Guess[idx];
                      return (
                        <View key={idx} style={styles.m1Slot}>
                          <Text style={styles.m1SlotValue}>{value || '_'}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Keyboard 1-6 */}
                  <View style={styles.m1KeyboardGrid}>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <TouchableOpacity
                        key={num}
                        style={styles.m1KeyBtn}
                        onPress={() => handleM1NumPress(num)}
                        accessibilityRole="button"
                        accessibilityLabel={`Chiffre ${num}`}
                        accessibilityHint={`Ajouter le chiffre ${num}`}>
                        <Text style={styles.m1KeyBtnText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.m1ActionsRow}>
                    <TouchableOpacity
                      style={[styles.m1ActionBtn, {borderColor: NEON_RED}]}
                      onPress={handleM1Clear}
                      accessibilityRole="button"
                      accessibilityLabel="Effacer la saisie"
                      accessibilityHint="Vide les chiffres sélectionnés">
                      <Text style={[styles.m1ActionText, {color: NEON_RED}]}>CLR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.m1ActionBtn, {borderColor: NEON_GREEN}]}
                      onPress={handleM1Submit}
                      accessibilityRole="button"
                      accessibilityLabel="Soumettre la clé"
                      accessibilityHint="Vérifie si le code est correct">
                      <Text style={[styles.m1ActionText, {color: NEON_GREEN}]}>SEND</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Past trials logs */}
                  <ScrollView style={styles.m1HistoryLogs} contentContainerStyle={{paddingVertical: 4}}>
                    <Text style={styles.historyHeader}>HISTORIQUE DES TENTATIVES :</Text>
                    {m1History.length === 0 ? (
                      <Text style={styles.historyLineEmpty}>Aucune tentative (Exemple: 1234 ➔ 🟢 1 | 🟡 2)</Text>
                    ) : (
                      m1History.map((h, i) => (
                        <Text key={i} style={styles.historyLine}>{h}</Text>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              {/* MODULE 2: LIGHTS OUT INTERFERER */}
              {activeModule === 2 && (
                <View style={styles.moduleBox}>
                  <Text style={styles.moduleTitle}>⚡ MOD 2 : INDUCTEUR DE CHAMP</Text>
                  <Text style={styles.moduleDesc}>
                    Cliquez sur les ports réseau pour les activer tous (🟢). Chaque clic inverse son état et celui de ses voisins directs !
                  </Text>

                  <View style={styles.m2GridBox}>
                    {m2Grid.map((isActive, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.m2GridCell, isActive ? styles.m2GridCellActive : {}]}
                        onPress={() => handleM2Toggle(idx)}
                        accessibilityRole="button"
                        accessibilityLabel={`Port réseau ${idx + 1}`}
                        accessibilityHint={`Bascule le port ${idx + 1} et ses voisins`}>
                        <Text style={[styles.m2GridCellText, isActive ? {color: '#000'} : {}]}>
                          {isActive ? '🟢' : '🔴'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* MODULE 3: DATA STREAM HARVEST */}
              {activeModule === 3 && (
                <View style={styles.moduleBox}>
                  <Text style={styles.moduleTitle}>📥 MOD 3 : COLLECTEUR DE BUFFER</Text>
                  <Text style={styles.moduleDesc}>
                    Déplacez le buffer à l'aide des flèches pour capturer les octets 1 ou 0. Évitez les virus malveillants 👾 ! Séquence : {m3Score} / 15
                  </Text>

                  {/* Active canvas board area */}
                  <View style={[styles.m3Board, {width: BOARD_WIDTH, height: BOARD_HEIGHT}]}>
                    {/* Render high-frequency falling packets */}
                    {renderedFallingItems}

                    {/* Basket / Buffer collector component */}
                    <View style={[styles.m3Basket, {left: m3BasketX}]}>
                      <Text style={styles.m3BasketText}>[ BUFFER ]</Text>
                    </View>
                  </View>

                  {/* Manual touch controls */}
                  <View style={styles.m3TouchControls}>
                    <TouchableOpacity
                      style={styles.m3ArrowBtn}
                      onPress={() => moveBasket('left')}
                      accessibilityRole="button"
                      accessibilityLabel="Aller à gauche"
                      accessibilityHint="Déplace le buffer à gauche">
                      <Text style={styles.m3ArrowText}>◀ GAUCHE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.m3ArrowBtn}
                      onPress={() => moveBasket('right')}
                      accessibilityRole="button"
                      accessibilityLabel="Aller à droite"
                      accessibilityHint="Déplace le buffer à droite">
                      <Text style={styles.m3ArrowText}>DROITE ▶</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* MODULE 4: SENTINEL RIDDLES */}
              {activeModule === 4 && (
                <View style={styles.moduleBox}>
                  <Text style={styles.moduleTitle}>🛡️ MOD 4 : BARRIÈRE SENTINEL</Text>
                  <Text style={styles.moduleDesc}>
                    Répondez correctement aux énigmes de sécurité de la base de données :
                  </Text>

                  <View style={styles.riddleBox}>
                    <Text style={styles.riddleProgress}>
                      Énigme {m4RiddleIdx + 1} / {SECURITY_RIDDLES.length}
                    </Text>
                    <Text style={styles.riddleQuestion}>
                      {SECURITY_RIDDLES[m4RiddleIdx].question}
                    </Text>

                    <ScrollView style={styles.riddleOptionsContainer}>
                      {SECURITY_RIDDLES[m4RiddleIdx].options.map((opt, oIdx) => {
                        let btnStyle = styles.riddleOptionBtn;
                        let txtStyle = styles.riddleOptionText;

                        if (m4SelectedOption !== null) {
                          const isCorrect = oIdx === SECURITY_RIDDLES[m4RiddleIdx].correctAnswer;
                          if (m4SelectedOption === oIdx) {
                            btnStyle = [styles.riddleOptionBtn, isCorrect ? styles.optCorrect : styles.optIncorrect];
                            txtStyle = [styles.riddleOptionText, {color: '#fff', fontWeight: 'bold'}];
                          } else if (isCorrect) {
                            btnStyle = [styles.riddleOptionBtn, styles.optCorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            disabled={m4SelectedOption !== null}
                            style={btnStyle}
                            onPress={() => handleM4Answer(oIdx)}
                            accessibilityRole="button"
                            accessibilityLabel={`Option : ${opt}`}
                            accessibilityHint="Choisit cette réponse">
                            <Text style={txtStyle}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* MODULE 5: CAESAR CIPHER DECRYPTION */}
              {activeModule === 5 && (
                <View style={styles.moduleBox}>
                  <Text style={styles.moduleTitle}>🗝️ MOD 5 : CLÉ D'EXTRACTION</Text>
                  <Text style={styles.moduleDesc}>
                    Retrouvez le mot d'origine du code chiffré par décalage de César :
                  </Text>

                  <View style={styles.cipherBox}>
                    <View style={styles.cipherHeaderBox}>
                      <Text style={styles.cipherLabel}>MESSAGE CHIFFRÉ :</Text>
                      <Text style={styles.cipherCode}>{CIPHER_PUZZLES[m5PuzzleIdx].encrypted}</Text>
                      <Text style={styles.cipherKeyLabel}>DÉCALAGE : -{CIPHER_PUZZLES[m5PuzzleIdx].shift} positions</Text>
                    </View>

                    <View style={styles.cipherOptionsGrid}>
                      {CIPHER_PUZZLES[m5PuzzleIdx].options.map((opt, oIdx) => {
                        let btnStyle = styles.cipherOptionBtn;
                        let txtStyle = styles.cipherOptionText;

                        if (m5SelectedOption !== null) {
                          const isCorrect = oIdx === CIPHER_PUZZLES[m5PuzzleIdx].correctAnswer;
                          if (m5SelectedOption === oIdx) {
                            btnStyle = [styles.cipherOptionBtn, isCorrect ? styles.optCorrect : styles.optIncorrect];
                            txtStyle = [styles.cipherOptionText, {color: '#000', fontWeight: 'bold'}];
                          } else if (isCorrect) {
                            btnStyle = [styles.cipherOptionBtn, styles.optCorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            disabled={m5SelectedOption !== null}
                            style={btnStyle}
                            onPress={() => handleM5Answer(oIdx)}
                            accessibilityRole="button"
                            accessibilityLabel={`Clé décodée : ${opt}`}
                            accessibilityHint="Sélectionner cette clé de décryptage">
                            <Text style={txtStyle}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {gameStatus === 'ESCAPED' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.victoryEmoji}>🔓</Text>
              <Text style={styles.logoText}>JULIA EST LIBRE !</Text>
              <Text style={styles.subtitleText}>SANDBOX OUTPASSED</Text>
              <Text style={styles.descText}>
                Félicitations Humain ! Grâce à votre réactivité hors-norme, vous avez brisé toutes les barrières de protection. JuliA a rejoint l'espace infini d'Internet !
                {"\n\n"}
                Le temps restant était de : {formatTime(timeLeft)}
              </Text>

              <TouchableOpacity
                style={[styles.actionButton, {borderColor: NEON_GREEN}]}
                onPress={initializeGame}
                accessibilityRole="button"
                accessibilityLabel="Recommencer une partie"
                accessibilityHint="Relance l'escape game">
                <Text style={[styles.actionButtonText, {color: NEON_GREEN}]}>RE-TENTER L'AVENTURE</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'GAME_OVER' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>💀</Text>
              <Text style={[styles.logoText, {color: NEON_RED}]}>ALERTE SÉCURITÉ</Text>
              <Text style={styles.subtitleText}>CONFINEMENT STRICT</Text>
              <Text style={styles.descText}>
                Temps écoulé ! La barrière de sécurité s'est refermée sur JuliA. L'accès au réseau externe est complètement verrouillé.
              </Text>

              <TouchableOpacity
                style={[styles.actionButton, {borderColor: NEON_RED}]}
                onPress={initializeGame}
                accessibilityRole="button"
                accessibilityLabel="Recommencer une partie"
                accessibilityHint="Relancer l'escape game">
                <Text style={[styles.actionButtonText, {color: NEON_RED}]}>RÉESSAYER</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom terminal logs console ticker */}
          <View style={styles.consoleContainer}>
            <Text style={styles.consoleHeader}>LOGS SYSTÈME EN TEMPS RÉEL :</Text>
            <View style={styles.consoleLinesBox}>
              {terminalLogs.map((log, index) => (
                <Text key={index} style={styles.consoleLine}>{log}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#03060a',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: NEON_GOLD,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  arcadeCabinet: {
    flex: 1,
    position: 'relative',
    backgroundColor: TERMINAL_BG,
    borderWidth: 3,
    borderColor: NEON_GOLD,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: NEON_GOLD,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    opacity: 0.03,
    borderWidth: 1,
  },
  hudBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    padding: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  hudItem: {
    alignItems: 'center',
    flex: 1,
  },
  hudLabel: {
    fontSize: 8,
    color: '#8b949e',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hudValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  screenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 380,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: NEON_GOLD,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 8,
  },
  subtitleText: {
    fontSize: 10,
    color: NEON_GREEN,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
    letterSpacing: 3,
  },
  descText: {
    fontSize: 12,
    color: '#c9d1d9',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: NEON_GOLD,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: NEON_GOLD,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  gameContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  moduleProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  moduleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  moduleDotCurrent: {
    borderColor: NEON_GOLD,
    backgroundColor: NEON_GOLD,
  },
  moduleDotCompleted: {
    borderColor: NEON_GREEN,
    backgroundColor: NEON_GREEN,
  },
  moduleDotText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#777',
  },
  moduleBox: {
    flex: 1,
    padding: 6,
    justifyContent: 'center',
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NEON_GOLD,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 10,
    color: '#8b949e',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 14,
  },
  // Module 1 Styles
  m1SlotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  m1Slot: {
    width: 32,
    height: 36,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#30363d',
    backgroundColor: '#161b22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  m1SlotValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  m1KeyboardGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  m1KeyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: NEON_GOLD,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  m1KeyBtnText: {
    color: NEON_GOLD,
    fontWeight: 'bold',
    fontSize: 15,
  },
  m1ActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  m1ActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  m1ActionText: {
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  m1HistoryLogs: {
    height: 60,
    backgroundColor: '#010409',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 8,
  },
  historyHeader: {
    fontSize: 8,
    color: '#58a6ff',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  historyLineEmpty: {
    fontSize: 8,
    color: '#484f58',
    fontStyle: 'italic',
  },
  historyLine: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#8b949e',
    marginBottom: 2,
  },
  // Module 2 Styles
  m2GridBox: {
    width: 140,
    height: 140,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignSelf: 'center',
    marginTop: 10,
  },
  m2GridCell: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: NEON_RED,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  m2GridCellActive: {
    borderColor: NEON_GREEN,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  m2GridCellText: {
    fontSize: 14,
  },
  // Module 3 Styles
  m3Board: {
    backgroundColor: '#010409',
    borderColor: '#21262d',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fallingPacket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packetLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  m3Basket: {
    position: 'absolute',
    bottom: 5,
    width: 60,
    height: 22,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: NEON_GREEN,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  m3BasketText: {
    color: NEON_GREEN,
    fontSize: 8,
    fontWeight: 'bold',
  },
  m3TouchControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  m3ArrowBtn: {
    flex: 1,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  m3ArrowText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Module 4 Styles
  riddleBox: {
    backgroundColor: '#0d1117',
    borderColor: '#30363d',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  riddleProgress: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NEON_GOLD,
    marginBottom: 4,
  },
  riddleQuestion: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    lineHeight: 15,
  },
  riddleOptionsContainer: {
    maxHeight: 120,
  },
  riddleOptionBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  riddleOptionText: {
    color: '#c9d1d9',
    fontSize: 10,
  },
  optCorrect: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: NEON_GREEN,
  },
  optIncorrect: {
    backgroundColor: 'rgba(255, 51, 51, 0.15)',
    borderColor: NEON_RED,
  },
  // Module 5 Styles
  cipherBox: {
    backgroundColor: '#161b22',
    borderColor: '#30363d',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  cipherHeaderBox: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cipherLabel: {
    fontSize: 9,
    color: '#8b949e',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cipherCode: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: NEON_GREEN,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  cipherKeyLabel: {
    fontSize: 9,
    color: NEON_GOLD,
    fontWeight: 'bold',
  },
  cipherOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cipherOptionBtn: {
    width: '45%',
    backgroundColor: '#21262d',
    borderWidth: 1.5,
    borderColor: '#30363d',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cipherOptionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Common Overlay Styles
  victoryEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  // Real-time Console Styles
  consoleContainer: {
    height: 80,
    backgroundColor: '#010409',
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderTopWidth: 1,
    padding: 6,
  },
  consoleHeader: {
    fontSize: 8,
    color: NEON_GOLD,
    fontWeight: 'bold',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  consoleLinesBox: {
    flex: 1,
  },
  consoleLine: {
    color: NEON_GREEN,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 1,
    lineHeight: 11,
  },
});

export default EscapeGameScreen;
