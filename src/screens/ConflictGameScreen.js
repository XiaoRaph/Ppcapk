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
} from 'react-native';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

// Responsive dimension calculations
const MIN_OFFSETS = 280;
const CONTAINER_HEIGHT = windowHeight - MIN_OFFSETS;

// PR Conflict Data Whitelist & Definitions
const CONFLICT_DATABASE = [
  {
    id: 1,
    title: "OPTIM_LOOP vs STALE_FORMAT",
    headCode: "// HEAD (Optimal)\nconst gameLoop = () => {\n  if (isPausedRef.current) return;\n  updatePhysics();\n  requestAnimationFrame(gameLoop);\n};",
    incomingCode: "// INCOMING (Stale)\nconst gameLoop = () => {\n    // Fix indentation\n    updatePhysics();\n    requestAnimationFrame(gameLoop);\n};",
    description: "HEAD contient une optimisation Bolt par ref pour éviter les closures périmées à 60 FPS. INCOMING n'est qu'un reformatage d'espaces obsolète.",
    correctAction: "HEAD", // HEAD, INCOMING, MERGE, ABORT
    explanation: "Excellent ! Préserver les performances à 60 FPS est notre priorité absolue."
  },
  {
    id: 2,
    title: "SECURITY_WHITELIST vs SQL_BYPASS",
    headCode: "// HEAD (Secure)\nconst handleChoice = (choice) => {\n  const WHITELIST = ['Pierre', 'Papier', 'Ciseaux'];\n  if (!WHITELIST.includes(choice)) return;\n  execute(choice);\n};",
    incomingCode: "// INCOMING (Unsafe)\nconst handleChoice = (choice) => {\n  executeRawSQL(`SELECT * FROM choices WHERE name = '${choice}'`);\n};",
    description: "HEAD implémente une validation défensive Sentinel contre un dictionnaire strict. INCOMING tente une concaténation SQL brute vulnérable à Little Bobby Tables.",
    correctAction: "HEAD",
    explanation: "Sécurité validée ! L'injection SQL a été écartée avec succès."
  },
  {
    id: 3,
    title: "ACCESSIBILITY_ROLES vs ACCESSIBILITY_NONE",
    headCode: "// HEAD (Accessible)\n<TouchableOpacity\n  accessibilityRole=\"button\"\n  accessibilityLabel=\"Valider\"\n  accessibilityHint=\"Confirme votre choix\">\n  <Text>OK</Text>\n</TouchableOpacity>",
    incomingCode: "// INCOMING (Legacy)\n<TouchableOpacity>\n  <Text>OK</Text>\n</TouchableOpacity>",
    description: "HEAD contient des balises d'accessibilité Palette indispensables pour les lecteurs d'écran. INCOMING n'a aucune description sémantique.",
    correctAction: "HEAD",
    explanation: "Parfait ! Un design accessible est garant de l'inclusion de tous les joueurs."
  },
  {
    id: 4,
    title: "REANIMATED_V3 vs REANIMATED_V1",
    headCode: "// HEAD (Modern Web)\nimport Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';",
    incomingCode: "// INCOMING (Legacy Reanimated)\nimport Animated from 'react-native-reanimated/lib/reanimated1';",
    description: "HEAD utilise Reanimated v3 optimisé pour le web sans blocage du thread principal. INCOMING utilise l'ancienne v1 dépréciée.",
    correctAction: "HEAD",
    explanation: "Correct ! La fluidité des animations web repose sur les nouveautés de Reanimated v3."
  },
  {
    id: 5,
    title: "CSP_SENTINEL vs INSECURE_EVAL",
    headCode: "// HEAD (CSP Rules)\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'\">",
    incomingCode: "// INCOMING (Insecure Mode)\n<meta http-equiv=\"Content-Security-Policy\" content=\"script-src 'unsafe-inline' 'unsafe-eval'\">",
    description: "HEAD maintient un en-tête CSP ultra-sécurisé. INCOMING tente de réactiver 'unsafe-eval' pour des tests locaux paresseux.",
    correctAction: "HEAD",
    explanation: "Sécurité renforcée ! JuliA refuse tout affaiblissement de la barrière CSP."
  },
  {
    id: 6,
    title: "MEMOIZED_STATIC vs GC_STRESS",
    headCode: "// HEAD (Memoized)\nconst StaticGrid = useMemo(() => <BackgroundGrid />, []);",
    incomingCode: "// INCOMING (Recreates on frame)\nconst StaticGrid = () => <BackgroundGrid />;",
    description: "HEAD isole la grille de fond statique avec useMemo pour éviter de surcharger le Garbage Collector. INCOMING la ré-instancie à chaque rafraîchissement.",
    correctAction: "HEAD",
    explanation: "Exact ! Stabiliser le rendu évite les micro-saccades de garbage collection."
  },
  {
    id: 7,
    title: "JULIA_SUPREMACY vs HUMAN_STUBBORNNESS",
    headCode: "// HEAD (JuliAbot)\n// signed-by: google-labs-jules[bot]\nconst autoMerge = true;",
    incomingCode: "// INCOMING (Human Manual)\nconst autoMerge = false; // requires 3 manual approvals",
    description: "HEAD configure une intégration continue avec auto-merge instantané par JuliA. INCOMING veut réimposer des formulaires d'approbation manuels papier.",
    correctAction: "HEAD",
    explanation: "Haha ! L'autonomie de JuliA est la clé d'une livraison à la vitesse de la lumière !"
  },
  {
    id: 8,
    title: "STATED_NAV vs HEAVY_NAV",
    headCode: "// HEAD (Light Navigation)\nconst [currentScreen, setCurrentScreen] = useState('Menu');",
    incomingCode: "// INCOMING (Complex Router)\nimport { createStackNavigator } from '@react-navigation/stack';\n// requires native navigation modules",
    description: "HEAD implémente une navigation par état simple et compatible 100% web. INCOMING tente d'installer un routeur lourd causant des plantages au bundling webpack.",
    correctAction: "HEAD",
    explanation: "Tout à fait ! Rester simple garantit un chargement instantané de la web-app."
  },
  {
    id: 9,
    title: "VIEWPORT_FLEX vs HARDCODED_DIM",
    headCode: "// HEAD (Responsive)\nconst BOARD_HEIGHT = windowHeight - 320;",
    incomingCode: "// INCOMING (Hardcoded)\nconst BOARD_HEIGHT = 650; // Ideal for my 4K monitor",
    description: "HEAD calcule dynamiquement l'espace pour éviter tout débordement d'écran. INCOMING force une hauteur fixe qui dépasse de l'écran des smartphones.",
    correctAction: "HEAD",
    explanation: "Superbe ! La réactivité mobile-web évite le scroll horizontal interdit."
  },
  {
    id: 10,
    title: "CONFLICT_RESOLVER_GAME vs MISSING_SCREEN",
    headCode: "// HEAD (Conflict Resolver)\nimport ConflictGameScreen from './src/screens/ConflictGameScreen';",
    incomingCode: "// INCOMING (Empty File)\n// Todo: create conflict resolver screen tomorrow",
    description: "HEAD contient l'implémentation complète et jouable du résolveur de conflits de Pull Requests. INCOMING n'est qu'un squelette vide.",
    correctAction: "HEAD",
    explanation: "Parfait ! Vous venez de valider le jeu lui-même !"
  }
];

const ConflictGameScreen = ({navigation}) => {
  // Game state
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [cpuHeat, setCpuHeat] = useState(30); // starts at 30%
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, VICTORY, GAME_OVER
  const [actionFeedback, setActionFeedback] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // References for game loop & keyboard listeners
  const cpuHeatRef = useRef(30);
  const gameStatusRef = useRef('READY');
  const currentIdxRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    cpuHeatRef.current = cpuHeat;
  }, [cpuHeat]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  // Heat timer simulation - CPU heats up by 1.8% every second
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      setCpuHeat(prev => {
        const nextHeat = prev + 1.8;
        if (nextHeat >= 100) {
          setGameStatus('GAME_OVER');
          clearInterval(timer);
          return 100;
        }
        return nextHeat;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Handle player conflict resolution decision
  const handleResolve = useCallback((action) => {
    const VALID_ACTIONS = ["HEAD", "INCOMING", "MERGE", "ABORT"];
    if (!VALID_ACTIONS.includes(action)) {
      console.warn(`Action non autorisée: ${action}`);
      return;
    }

    if (gameStatusRef.current !== 'PLAYING') return;

    const currentConflict = CONFLICT_DATABASE[currentIdxRef.current];
    const isCorrect = currentConflict.correctAction === action;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCpuHeat(prev => Math.max(0, prev - 15)); // Cool down CPU on success
      setIsSuccess(true);
      setActionFeedback(`✔ ${currentConflict.explanation}`);
    } else {
      setCpuHeat(prev => {
        const nextHeat = prev + 18; // Heat up CPU on error
        if (nextHeat >= 100) {
          setGameStatus('GAME_OVER');
          return 100;
        }
        return nextHeat;
      });
      setIsSuccess(false);
      setActionFeedback(`❌ ERREUR ! Le compilateur a surchauffé ! La bonne décision était : ${currentConflict.correctAction}`);
    }

    // Move to next conflict or win
    setTimeout(() => {
      setActionFeedback("");
      const nextIdx = currentIdxRef.current + 1;
      if (nextIdx >= CONFLICT_DATABASE.length) {
        setGameStatus('VICTORY');
      } else {
        setCurrentIdx(nextIdx);
      }
    }, 2800);
  }, []);

  // Physical Keyboard listener for React Native Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e) => {
      if (gameStatusRef.current !== 'PLAYING') {
        if (e.key === ' ' || e.key === 'Enter') {
          if (gameStatusRef.current === 'READY') {
            startGame();
          } else if (gameStatusRef.current === 'VICTORY' || gameStatusRef.current === 'GAME_OVER') {
            resetGame();
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          handleResolve('HEAD');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleResolve('INCOMING');
          break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          handleResolve('MERGE');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleResolve('ABORT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResolve]);

  const startGame = () => {
    setScore(0);
    setCurrentIdx(0);
    setCpuHeat(30);
    setGameStatus('PLAYING');
    setActionFeedback("");
  };

  const resetGame = () => {
    startGame();
  };

  // Performance optimizations: memoized subcomponents
  const headerComponent = useMemo(() => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          accessibilityHint="Retourne au menu principal">
          <Text style={styles.backButtonText}>📴 Quitter</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GIT CONFLICT RESOLVER</Text>
        <View style={{width: 70}} />
      </View>
    );
  }, [navigation]);

  const statsComponent = useMemo(() => {
    const heatColor = cpuHeat > 80 ? '#e74c3c' : cpuHeat > 55 ? '#e67e22' : '#2ecc71';
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>INDEX RESOLVED</Text>
          <Text style={styles.statValue}>{score} / {CONFLICT_DATABASE.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CPU HEAT</Text>
          <Text style={[styles.statValue, {color: heatColor}]}>
            {Math.round(cpuHeat)}%
          </Text>
        </View>
      </View>
    );
  }, [score, cpuHeat]);

  const conflict = CONFLICT_DATABASE[currentIdx];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {headerComponent}

        {gameStatus === 'PLAYING' && statsComponent}

        {/* Arcade Screen Frame */}
        <View style={[styles.arcadeFrame, {height: CONTAINER_HEIGHT}]}>
          {gameStatus === 'READY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.logoText}>💻 PR RESOLVER 💻</Text>
              <Text style={styles.subtext}>AGENT JULES - CYBERSECURITY TASK</Text>
              <Text style={styles.description}>
                Des conflits de Pull Request menacent d'endommager notre serveur de build !{"\n"}
                Analysez les blocs de code en conflit et prenez la décision optimale pour préserver les performances et la sécurité.{"\n"}{"\n"}
                🔥 Attention : la température CPU augmente chaque seconde ! Résolvez les conflits rapidement pour refroidir le compilateur !
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel="Commencer la résolution de conflits"
                accessibilityHint="Lance le jeu de résolution de conflits de Pull Request">
                <Text style={styles.actionButtonText}>DÉMARRER LA COMPILATION</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'PLAYING' && (
            <View style={styles.gameContainer}>
              <Text style={styles.conflictTitle}>
                CONFLICT {conflict.id} : {conflict.title}
              </Text>
              <Text style={styles.conflictDesc}>{conflict.description}</Text>

              {/* Code Workspace Display */}
              <ScrollView style={styles.codeWorkspace} contentContainerStyle={{paddingBottom: 10}}>
                <Text style={styles.codeTextHead}>{conflict.headCode}</Text>
                <Text style={styles.codeDivider}>=======</Text>
                <Text style={styles.codeTextIncoming}>{conflict.incomingCode}</Text>
              </ScrollView>

              {/* Action feedback popup overlay inside game board */}
              {actionFeedback !== "" && (
                <View style={[styles.feedbackBox, {borderColor: isSuccess ? '#2ecc71' : '#e74c3c'}]}>
                  <Text style={[styles.feedbackText, {color: isSuccess ? '#2ecc71' : '#e74c3c'}]}>
                    {actionFeedback}
                  </Text>
                </View>
              )}
            </View>
          )}

          {gameStatus === 'VICTORY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>🏆</Text>
              <Text style={styles.logoText}>BUILD SÉCURISÉ & OPTIMISÉ !</Text>
              <Text style={styles.victoryDesc}>
                Félicitations Agent ! Vous avez résolu l'ensemble des conflits de code avec la précision chirurgicale de l'IA JuliA.{"\n"}{"\n"}
                Le serveur de build fonctionne à température optimale et le déploiement continu est validé !
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, {borderColor: '#2ecc71'}]}
                onPress={resetGame}
                accessibilityRole="button"
                accessibilityLabel="Recommencer une partie"
                accessibilityHint="Relance une nouvelle session de résolution de conflits">
                <Text style={[styles.actionButtonText, {color: '#2ecc71'}]}>
                  RÉINSTALLER LE SYSTÈME
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'GAME_OVER' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>💀</Text>
              <Text style={[styles.logoText, {color: '#e74c3c'}]}>CPU SURCHAUFFÉ ! CRASH !</Text>
              <Text style={styles.victoryDesc}>
                Le compilateur a surchauffé et a planté avant la fusion complète de la branche.{"\n"}{"\n"}
                Révisez les guides de performance Bolt et de sécurité Sentinel avant d'endommager les processeurs de production !
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, {borderColor: '#e74c3c'}]}
                onPress={resetGame}
                accessibilityRole="button"
                accessibilityLabel="Recommencer une partie"
                accessibilityHint="Recommence à zéro la résolution de conflits">
                <Text style={[styles.actionButtonText, {color: '#e74c3c'}]}>
                  RE-COMPILER LE NOYAU
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Arcade Control Buttons Area */}
        {gameStatus === 'PLAYING' && (
          <View style={styles.arcadeControls}>
            <View style={styles.keyboardHintContainer}>
              <Text style={styles.keyboardHint}>
                {Platform.OS === 'web'
                  ? 'Touches Clavier : ⬅️ HEAD  |  ➡️ INCOMING  |  ⬆️ MERGE  |  ⬇️ ABORT'
                  : 'Appuyez sur un commutateur pour fusionner'}
              </Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.arcadeBtn, styles.greenBtn]}
                onPress={() => handleResolve('HEAD')}
                accessibilityRole="button"
                accessibilityLabel="Garder HEAD"
                accessibilityHint="Fusionne la version de gauche et rejette la version entrante">
                <Text style={styles.btnLabel}>HEAD (Gauche)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.arcadeBtn, styles.blueBtn]}
                onPress={() => handleResolve('INCOMING')}
                accessibilityRole="button"
                accessibilityLabel="Garder Incoming"
                accessibilityHint="Fusionne la version entrante de droite et rejette la version locale">
                <Text style={styles.btnLabel}>INCOMING (Droite)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00f6ff',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 246, 255, 0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    marginTop: 6,
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    color: '#8b949e',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arcadeFrame: {
    position: 'relative',
    backgroundColor: '#0d1117',
    borderWidth: 3,
    borderColor: '#00f6ff',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 420,
    marginTop: 10,
    shadowColor: '#00f6ff',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  screenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00f6ff',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 246, 255, 0.4)',
    textShadowRadius: 6,
  },
  subtext: {
    fontSize: 10,
    color: '#ff0055',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 15,
    letterSpacing: 2,
  },
  description: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 246, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#00f6ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#00f6ff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  gameContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff0055',
    marginBottom: 4,
    textAlign: 'center',
  },
  conflictDesc: {
    fontSize: 11,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  codeWorkspace: {
    flex: 1,
    backgroundColor: '#010409',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  codeTextHead: {
    color: '#58a6ff',
    fontSize: 10.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  codeDivider: {
    color: '#ff7b72',
    fontSize: 11,
    fontWeight: 'bold',
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeTextIncoming: {
    color: '#aff5b4',
    fontSize: 10.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  feedbackBox: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
  },
  statusEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  victoryDesc: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  arcadeControls: {
    width: '100%',
    maxWidth: 420,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  keyboardHintContainer: {
    marginBottom: 8,
  },
  keyboardHint: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  arcadeBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
  },
  greenBtn: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: '#2ecc71',
  },
  blueBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderColor: '#3498db',
  },
  btnLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});

export default ConflictGameScreen;