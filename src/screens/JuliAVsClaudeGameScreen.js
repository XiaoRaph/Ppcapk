import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

// Responsive UI Dimensions
const CARD_WIDTH = Math.min(windowWidth - 30, 440);
const CARD_HEIGHT = Math.min(windowHeight - 120, 680);

// Pool of French coding trivia questions
const QUESTIONS = [
  {
    id: 1,
    question: "Quel est le moyen recommandé ici pour bypasser les conflits de peer-dependencies lors de l'installation ?",
    options: [
      "npm install --legacy-peer-deps",
      "npm i --force-all-packages",
      "Supprimer package-lock.json et espérer",
      "Utiliser yarn --ignore-engines"
    ],
    correctAnswer: 0,
    explanation: "Le protocole de JuliA recommande d'installer avec --legacy-peer-deps.",
  },
  {
    id: 2,
    question: "Pour éviter les 'stale closures' lors d'un keydown haute fréquence sur le web, quelle est la bonne pratique ?",
    options: [
      "Stocker la valeur dynamique dans un useRef",
      "Mettre à jour le state de façon synchrone dans useEffect",
      "Utiliser un gros setTimeout de 100ms",
      "Désactiver complètement le re-rendu de React"
    ],
    correctAnswer: 0,
    explanation: "L'utilisation de useRef (e.g., directionRef.current) garantit un accès instantané et synchrone.",
  },
  {
    id: 3,
    question: "Quelle règle suprême d'AGENTS.MD concernant package-lock.json faut-il impérativement respecter ?",
    options: [
      "Ne JAMAIS modifier package-lock.json directement",
      "Le supprimer avant chaque commit",
      "Le renommer en lockfile.json",
      "Le crypter en SHA-256"
    ],
    correctAnswer: 0,
    explanation: "AGENTS.MD interdit formellement de modifier directement package-lock.json.",
  },
  {
    id: 4,
    question: "Quel protocole moderne permet à des agents d'IA (comme Claude ou JuliA) d'accéder à des outils externes de façon standardisée ?",
    options: [
      "MCP (Model Context Protocol)",
      "JSON-RPC over WebSockets",
      "TCP Handshake v2",
      "Rest API with Bearer Token"
    ],
    correctAnswer: 0,
    explanation: "Le Model Context Protocol (MCP) est le protocole d'intégration d'outils pour IA.",
  },
  {
    id: 5,
    question: "En JavaScript, que renvoie l'expression typeof null ?",
    options: [
      "\"object\"",
      "\"null\"",
      "\"undefined\"",
      "\"error\""
    ],
    correctAnswer: 0,
    explanation: "C'est un bug historique célèbre de JavaScript : typeof null renvoie \"object\".",
  },
  {
    id: 6,
    question: "Pour éviter un plantage client (client-side DoS) dû à un argument inattendu, que faut-il faire ?",
    options: [
      "Valider rigoureusement l'argument par rapport à une whitelist",
      "Utiliser des blocs try-catch partout de manière aveugle",
      "Laisser le framework crasher et redémarrer",
      "Supprimer tous les boutons de l'interface"
    ],
    correctAnswer: 0,
    explanation: "Valider les paramètres d'entrée contre une liste de valeurs autorisées évite les plantages inattendus.",
  },
  {
    id: 7,
    question: "Quel hook React permet d'isoler et mettre en cache des parties de l'arborescence UI à 60 FPS ?",
    options: [
      "useMemo",
      "useEffect",
      "useState",
      "useImperativeHandle"
    ],
    correctAnswer: 0,
    explanation: "useMemo permet de mettre en cache les sous-arborescences statiques et d'économiser de précieux cycles CPU.",
  },
  {
    id: 8,
    question: "Quelle commande permet de lancer le serveur de dev Webpack local pour ce projet ?",
    options: [
      "npx webpack serve --mode development --config webpack.config.js",
      "npm run start-server",
      "webpack-dev-server --port 3000",
      "node index.web.js"
    ],
    correctAnswer: 0,
    explanation: "Cette commande configure le serveur de développement webpack sur le port 3000.",
  }
];

const JULIA_ATTACKS = [
  "JuliA injecte un prompt astucieux dans le contexte de Claude !",
  "JuliA déploie un outil MCP personnalisé de haute performance !",
  "JuliA résout le bug avec un commit parfait et optimisé !",
  "JuliA lance une compilation webpack ultra-rapide !",
  "JuliA déploie une validation d'arguments imperméable !"
];

const CLAUDE_ATTACKS = [
  "Claude Code génère un bug de type 'Cannot read property of undefined' !",
  "Claude Code sature le contexte avec des logs de build infinis !",
  "Claude Code modifie package-lock.json sans autorisation !",
  "Claude Code déclenche une stale closure inattendue !",
  "Claude Code envoie un patch de 10 000 lignes non testé !"
];

const JuliAVsClaudeGameScreen = ({navigation}) => {
  const [juliAHp, setJuliAHp] = useState(100);
  const [claudeHp, setClaudeHp] = useState(100);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [gameStatus, setGameStatus] = useState('READY'); // READY, BATTLE, VICTORY, GAME_OVER
  const [selectedOption, setSelectedOption] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [peerDepsUsed, setPeerDepsUsed] = useState(false);

  // Shuffle and pick 5 random questions for the match
  const matchQuestions = useMemo(() => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [gameStatus]);

  const addLog = useCallback((message) => {
    setBattleLog(prev => [message, ...prev.slice(0, 15)]);
  }, []);

  const handleStartGame = useCallback(() => {
    setJuliAHp(100);
    setClaudeHp(100);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setHasShield(false);
    setPeerDepsUsed(false);
    setBattleLog(["> Combat initialisé. Préparez vos compilateurs !"]);
    setGameStatus('BATTLE');
  }, []);

  const handleAction = useCallback((actionType) => {
    // 🛡️ SECURITY ENHANCEMENT: Defensive Input Validation
    const VALID_ACTIONS = ['menu', 'start', 'option', 'shield', 'bypass'];
    if (!VALID_ACTIONS.includes(actionType)) {
      console.warn(`[Sentinel] Invalid game action: ${actionType}`);
      return;
    }

    if (actionType === 'menu') {
      navigation.goBack();
    } else if (actionType === 'start') {
      handleStartGame();
    }
  }, [navigation, handleStartGame]);

  const handleUseShield = useCallback(() => {
    if (hasShield || gameStatus !== 'BATTLE' || isAnswering) return;
    setHasShield(true);
    addLog("🛡️ JuliA active 'Clean Dist Shield' ! La prochaine attaque de Claude sera bloquée.");
  }, [hasShield, gameStatus, isAnswering, addLog]);

  const handleUseBypass = useCallback(() => {
    if (peerDepsUsed || gameStatus !== 'BATTLE' || isAnswering) return;
    setPeerDepsUsed(true);
    setJuliAHp(prev => Math.min(100, prev + 25));
    addLog("💊 JuliA injecte '--legacy-peer-deps' ! Réparation d'urgence (+25 HP).");
  }, [peerDepsUsed, gameStatus, isAnswering, addLog]);

  const handleOptionSelect = useCallback((optionIdx) => {
    // 🛡️ SECURITY ENHANCEMENT: Validate selected index bounds
    if (optionIdx < 0 || optionIdx > 3 || isAnswering || gameStatus !== 'BATTLE') {
      return;
    }

    setIsAnswering(true);
    setSelectedOption(optionIdx);

    const question = matchQuestions[currentQuestionIdx];
    const isCorrect = optionIdx === question.correctAnswer;

    setTimeout(() => {
      if (isCorrect) {
        // JuliA attacks Claude Code!
        const damage = 25;
        const attackMessage = JULIA_ATTACKS[Math.floor(Math.random() * JULIA_ATTACKS.length)];
        const newClaudeHp = Math.max(0, claudeHp - damage);
        setClaudeHp(newClaudeHp);
        addLog(`🟢 BONNE RÉPONSE ! ${attackMessage} (-${damage} HP à Claude)`);

        if (newClaudeHp <= 0) {
          setTimeout(() => {
            setGameStatus('VICTORY');
            addLog("🏆 VICTOIRE SUPRÊME ! JuliA a optimisé Claude Code avec perfection !");
          }, 800);
          setIsAnswering(false);
          return;
        }
      } else {
        // Claude attacks JuliA!
        const damage = 20;
        const attackMessage = CLAUDE_ATTACKS[Math.floor(Math.random() * CLAUDE_ATTACKS.length)];

        if (hasShield) {
          addLog(`🟡 MAUVAISE RÉPONSE... Claude Code tente d'attaquer, mais le bouclier 'Clean Dist' absorbe le choc !`);
          setHasShield(false);
        } else {
          const newJuliAHp = Math.max(0, juliAHp - damage);
          setJuliAHp(newJuliAHp);
          addLog(`🔴 MAUVAISE RÉPONSE... ${attackMessage} JuliA subit -${damage} HP.`);

          if (newJuliAHp <= 0) {
            setTimeout(() => {
              setGameStatus('GAME_OVER');
              addLog("💀 SYSTÈME EN PANNE... Claude Code a surchargé JuliA !");
            }, 800);
            setIsAnswering(false);
            return;
          }
        }
      }

      // Progress to next question
      setTimeout(() => {
        if (currentQuestionIdx + 1 < matchQuestions.length) {
          setCurrentQuestionIdx(prev => prev + 1);
          setSelectedOption(null);
          setIsAnswering(false);
        } else {
          // If we run out of questions, the AI with more HP wins, or victory
          if (claudeHp < juliAHp) {
            setGameStatus('VICTORY');
            addLog("🏆 VICTOIRE SUPRÊME ! Plus de questions, mais JuliA a dominé le combat !");
          } else {
            setGameStatus('GAME_OVER');
            addLog("💀 TEMPS ÉCOULÉ ! Claude Code l'emporte aux points.");
          }
          setIsAnswering(false);
        }
      }, 1500);

    }, 800);

  }, [currentQuestionIdx, matchQuestions, claudeHp, juliAHp, hasShield, isAnswering, gameStatus, addLog]);

  const activeQuestion = matchQuestions[currentQuestionIdx];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleAction('menu')}
            accessibilityRole="button"
            accessibilityLabel="Retourner au menu principal"
            accessibilityHint="Quitte le combat cerebral de JuliA vs Claude">
            <Text style={styles.backButtonText}>📴 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧠 BATAILLE CÉRÉBRALE</Text>
          <View style={{width: 65}} />
        </View>

        {/* Outer Arcade Cabinet Panel */}
        <View style={[styles.arcadeCabinet, {width: CARD_WIDTH, height: CARD_HEIGHT}]}>
          <View style={styles.scanlines} pointerEvents="none" />

          {gameStatus === 'READY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.logoText}>JULIA VS CLAUDE</Text>
              <Text style={styles.subtitleText}>LE CHOC DES INTELLIGENCES</Text>
              <Text style={styles.descText}>
                Défiez le redoutable Claude Code dans un duel de connaissances et de logique de programmation ! Répondez correctement pour terrasser l'adversaire.
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction('start')}
                accessibilityRole="button"
                accessibilityLabel="Démarrer le combat"
                accessibilityHint="Lance une nouvelle bataille cérébrale contre Claude Code">
                <Text style={styles.actionButtonText}>DÉMARRER LA COMPILATION</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'BATTLE' && activeQuestion && (
            <View style={styles.battleScreen}>
              {/* HP Bars Row */}
              <View style={styles.hpContainer}>
                {/* JuliA HP */}
                <View style={styles.hpBox}>
                  <Text style={styles.playerLabel}>🤖 JULIA</Text>
                  <View style={styles.hpBarBackground}>
                    <View style={[styles.hpBarFill, {width: `${juliAHp}%`, backgroundColor: juliAHp > 40 ? '#39ff14' : '#ff3333'}]} />
                  </View>
                  <Text style={styles.hpValue}>{juliAHp} / 100 HP</Text>
                </View>

                {/* VS */}
                <Text style={styles.vsText}>VS</Text>

                {/* Claude HP */}
                <View style={styles.hpBox}>
                  <Text style={[styles.playerLabel, {color: '#e74c3c'}]}>🧠 CLAUDE</Text>
                  <View style={styles.hpBarBackground}>
                    <View style={[styles.hpBarFill, {width: `${claudeHp}%`, backgroundColor: '#e74c3c'}]} />
                  </View>
                  <Text style={styles.hpValue}>{claudeHp} / 100 HP</Text>
                </View>
              </View>

              {/* Special Abilities Row */}
              <View style={styles.specialsRow}>
                <TouchableOpacity
                  disabled={hasShield || isAnswering}
                  style={[styles.specialButton, hasShield ? styles.specialDisabled : {}]}
                  onPress={handleUseShield}
                  accessibilityRole="button"
                  accessibilityLabel="Activer le Bouclier Clean Dist"
                  accessibilityHint="Protège contre la prochaine mauvaise réponse">
                  <Text style={styles.specialButtonText}>🛡️ Clean Dist {hasShield ? "(Actif)" : ""}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={peerDepsUsed || isAnswering}
                  style={[styles.specialButton, peerDepsUsed ? styles.specialDisabled : {}]}
                  onPress={handleUseBypass}
                  accessibilityRole="button"
                  accessibilityLabel="Utiliser l'injecteur legacy-peer-deps"
                  accessibilityHint="Régénère 25 HP">
                  <Text style={styles.specialButtonText}>💊 Peer Deps {peerDepsUsed ? "(Utilisé)" : ""}</Text>
                </TouchableOpacity>
              </View>

              {/* Question Section */}
              <View style={styles.questionCard}>
                <Text style={styles.questionProgress}>QUESTION {currentQuestionIdx + 1} / 5</Text>
                <Text style={styles.questionText}>{activeQuestion.question}</Text>
              </View>

              {/* Options ScrollView */}
              <ScrollView style={styles.optionsContainer} contentContainerStyle={{paddingBottom: 10}}>
                {activeQuestion.options.map((option, index) => {
                  let buttonStyle = styles.optionButton;
                  let textStyle = styles.optionText;

                  if (selectedOption === index) {
                    const isCorrect = index === activeQuestion.correctAnswer;
                    buttonStyle = [styles.optionButton, isCorrect ? styles.optionCorrect : styles.optionIncorrect];
                    textStyle = [styles.optionText, styles.optionTextSelected];
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      disabled={isAnswering}
                      style={buttonStyle}
                      onPress={() => handleOptionSelect(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Option : ${option}`}
                      accessibilityHint="Sélectionner cette réponse">
                      <Text style={textStyle}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Retro Battle Log Console */}
              <View style={styles.consoleContainer}>
                <Text style={styles.consoleHeader}>CONSOLE SYSTEM LOGS :</Text>
                <ScrollView style={styles.consoleLinesContainer}>
                  {battleLog.map((log, i) => (
                    <Text key={i} style={styles.consoleLine}>{log}</Text>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {(gameStatus === 'VICTORY' || gameStatus === 'GAME_OVER') && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>{gameStatus === 'VICTORY' ? "🏆" : "💀"}</Text>
              <Text style={[styles.logoText, gameStatus === 'GAME_OVER' ? {color: '#e74c3c'} : {}]}>
                {gameStatus === 'VICTORY' ? "BATAILLE GAGNÉE !" : "SYSTÈME CRASHÉ !"}
              </Text>
              <Text style={styles.descText}>
                {gameStatus === 'VICTORY'
                  ? "Félicitations Agent JuliA ! Vous avez vaincu Claude Code grâce à votre maîtrise absolue du code et des bonnes pratiques."
                  : "Claude Code a terrassé votre architecture. Révisez vos bases et rechargez vos accumulateurs."}
              </Text>

              <TouchableOpacity
                style={[styles.actionButton, gameStatus === 'GAME_OVER' ? {borderColor: '#e74c3c'} : {}]}
                onPress={() => handleAction('start')}
                accessibilityRole="button"
                accessibilityLabel="Recommencer une partie"
                accessibilityHint="Relancer le duel JuliA vs Claude">
                <Text style={[styles.actionButtonText, gameStatus === 'GAME_OVER' ? {color: '#e74c3c'} : {}]}>
                  RE-COMPILER LE SYSTÈME
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    color: '#FFD700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  arcadeCabinet: {
    position: 'relative',
    backgroundColor: '#0d1117',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
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
  screenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 8,
  },
  subtitleText: {
    fontSize: 12,
    color: '#39ff14',
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 24,
    letterSpacing: 4,
  },
  descText: {
    fontSize: 13,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  statusEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  battleScreen: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  hpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  hpBox: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#39ff14',
    marginBottom: 4,
    letterSpacing: 1,
  },
  hpBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hpValue: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vsText: {
    color: '#ff3333',
    fontSize: 16,
    fontWeight: '900',
    marginHorizontal: 12,
    textShadowColor: 'rgba(255, 51, 51, 0.4)',
    textShadowRadius: 4,
  },
  specialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
  },
  specialButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  specialDisabled: {
    opacity: 0.3,
  },
  specialButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  questionProgress: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  questionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  optionsContainer: {
    flex: 1,
    maxHeight: 180,
  },
  optionButton: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionCorrect: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: '#39ff14',
  },
  optionIncorrect: {
    backgroundColor: 'rgba(255, 51, 51, 0.15)',
    borderColor: '#ff3333',
  },
  optionText: {
    color: '#c9d1d9',
    fontSize: 12,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  consoleContainer: {
    height: 90,
    backgroundColor: '#010409',
    borderColor: '#30363d',
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
  },
  consoleHeader: {
    color: '#8b949e',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  consoleLinesContainer: {
    flex: 1,
  },
  consoleLine: {
    color: '#39ff14',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
    lineHeight: 12,
  },
});

export default JuliAVsClaudeGameScreen;
