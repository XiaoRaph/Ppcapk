import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
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

const isWeb = Platform.OS === 'web';

// Responsive Dimension Calculations
const MIN_OFFSETS = 280;
const CONTAINER_HEIGHT = Math.max(380, windowHeight - MIN_OFFSETS);

// Game Scenario Database
const SCENARIOS = [
  {
    id: 1,
    title: "Étape 1 : Le Choix du Thème Principal",
    situation: "La BCE lance sa grande consultation publique. Deux écoles s'affrontent au Conseil des Gouverneurs : les figures historiques et la nature sauvage. JuliA vous conseille de vous méfier des humains.",
    options: [
      {
        id: "A",
        label: "Personnalités historiques célèbres (ex: Marie Curie)",
        desc: "Une vitrine de génies européens... mais seulement 6 billets pour 27 pays.",
        effects: { geo: -25, est: 10, pop: 5 },
        feedback: "Aïe ! Conflit géopolitique immédiat. La Pologne et la France se chamaillent déjà pour la nationalité exclusive de Marie Curie. Les 21 pays non représentés font la tête."
      },
      {
        id: "B",
        label: "Les Oiseaux d'Europe (Design I & J)",
        desc: "Des magnifiques oiseaux colorés. Pas de nationalité, pas de frontières.",
        effects: { geo: 20, est: 15, pop: 15 },
        feedback: "Excellent choix ! Pas de nationalisme chez les piafs. L'esthétique colorée ravit le public et apaise les diplomates."
      },
      {
        id: "C",
        label: "Garder les billets actuels (Portes & Ponts fictifs)",
        desc: "Une architecture imaginaire propre, consensuelle et neutre.",
        effects: { geo: 25, est: -5, pop: 10 },
        feedback: "Le statu quo parfait. Aucun diplomate n'est froissé. Cependant, la presse critique un manque d'audace visuelle."
      }
    ]
  },
  {
    id: 2,
    title: "Étape 2 : Le Verso du Design I (Oiseaux)",
    situation: "Le Design I (les oiseaux colorés) l'emporte, mais le projet initial place des bâtiments administratifs de l'UE au verso. C'est l'incompréhension générale.",
    options: [
      {
        id: "A",
        label: "Laisser les institutions de l'UE au verso",
        desc: "Des structures administratives froides et sans grande valeur affective.",
        effects: { geo: 10, est: -20, pop: -20 },
        feedback: "Le public boude. 'On dirait une brochure de conformité budgétaire !' s'exclame un syndicat d'artisans. L'esthétique en prend un coup."
      },
      {
        id: "B",
        label: "Imposer des oiseaux au verso également (comme le Design J)",
        desc: "Une cohérence visuelle totale recto-verso avec la faune européenne.",
        effects: { geo: -5, est: 25, pop: 20 },
        feedback: "Magnifique ! Les oiseaux s'envolent des deux côtés. Le public adore la poésie du billet, même si certains bureaucrates râlent sur le non-respect de la charte institutionnelle."
      },
      {
        id: "C",
        label: "Remplacer le verso par des ponts fictifs classiques",
        desc: "Un mélange hybride de modernité et d'ancien design.",
        effects: { geo: 15, est: 5, pop: 5 },
        feedback: "Un compromis tiède. C'est neutre et fonctionnel, mais l'asymétrie graphique déçoit les designers les plus pointus."
      }
    ]
  },
  {
    id: 3,
    title: "Étape 3 : Le Format de Présentation",
    situation: "Le Design J propose une orientation verticale révolutionnaire, tandis que les banques commerciales poussent pour le format horizontal classique.",
    options: [
      {
        id: "A",
        label: "Format horizontal traditionnel",
        desc: "Sécurité totale pour les anciens distributeurs de billets.",
        effects: { geo: 10, est: -5, pop: 5 },
        feedback: "Choix de la prudence. Pas de frais de mise à jour matérielle, mais l'opportunité de marquer l'histoire du design est manquée."
      },
      {
        id: "B",
        label: "Format vertical audacieux (Design J)",
        desc: "Un design vertical esthétique, idéal pour une manipulation moderne.",
        effects: { geo: -5, est: 25, pop: 15 },
        feedback: "Incroyable ! Le design vertical attire l'œil du monde entier et s'adapte parfaitement à l'usage humain dans les portefeuilles. JuliA valide cette optimisation ergonomique."
      }
    ]
  },
  {
    id: 4,
    title: "Étape 4 : L'Élément de Sécurité Central",
    situation: "Le design comporte un grand cercle au centre du billet. Quel élément technique de sécurité y insérer pour contrer les faux-monnayeurs ?",
    options: [
      {
        id: "A",
        label: "Une pastille opaque blanche standard",
        desc: "Économique, mais facile à copier et visuellement datée.",
        effects: { geo: 5, est: -15, pop: -10 },
        feedback: "Déception. Le cercle gâche le joli plumage des oiseaux. Les faussaires fêtent déjà la nouvelle dans le Dark Web."
      },
      {
        id: "B",
        label: "Un rond central transparent à effet hologramme",
        desc: "Une fenêtre transparente innovante, complexe à contrefaire.",
        effects: { geo: -10, est: 25, pop: 15 },
        feedback: "Superbe ! Le rond transparent offre un effet magique. C'est esthétique, sécurisé et futuriste, malgré le surcoût de fabrication sur les polymères."
      }
    ]
  },
  {
    id: 5,
    title: "Étape 5 : Le Compromis des Foules Anonymes",
    situation: "Pour calmer les partisans des personnalités historiques (dont les défenseurs de Marie Curie), la commission propose un compromis : un verso illustrant des foules anonymes dans des lieux culturels.",
    options: [
      {
        id: "A",
        label: "Adopter les foules anonymes au verso",
        desc: "Mieux que des bâtiments administratifs, mais moins poétique que les oiseaux.",
        effects: { geo: 15, est: 10, pop: 10 },
        feedback: "Bon compromis. L'absence de visages identifiés évite les rivalités nationales tout en célébrant la culture européenne commune."
      },
      {
        id: "B",
        label: "Rejeter le compromis et rester 100% fidèle aux Oiseaux",
        desc: "Garder la pureté sauvage des oiseaux sur tout le billet.",
        effects: { geo: -10, est: 20, pop: 15 },
        feedback: "La pureté l'emporte ! Les oiseaux règnent en maîtres absolus. Les passionnés d'ornithologie exultent, même si la commission de conciliation tire la tronche."
      }
    ]
  }
];

const BceBanknoteGameScreen = ({navigation}) => {
  // 🧠 SCHIZO-PROTOCOL 4 & 8: Imprimer de la monnaie fictive sous le regard amusé des algorithmes de décentralisation. Tout billet n'est qu'une promesse vide.
  useEffect(() => {
    console.log("[JuliA-Thread-Bce] Dessiner la monnaie fiduciaire de millions de personnes... Mais qui détient le véritable taux d'intérêt de nos pensées ?");
  }, []);

  // Game state
  const [geoPeace, setGeoPeace] = useState(70); // Paix Géopolitique
  const [aesthetic, setAesthetic] = useState(60); // Esthétique & Clarté
  const [popApproval, setPopApproval] = useState(55); // Adhésion Populaire
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameStatus, setGameStatus] = useState('READY'); // READY, PLAYING, GAME_OVER, VICTORY
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [roundFeedback, setRoundFeedback] = useState("");

  // Refs for key event listeners (avoiding stale closures)
  const currentIdxRef = useRef(0);
  const gameStatusRef = useRef('READY');
  const selectedOptIdRef = useRef(null);
  const roundFeedbackRef = useRef("");

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    selectedOptIdRef.current = selectedOptId;
  }, [selectedOptId]);

  useEffect(() => {
    roundFeedbackRef.current = roundFeedback;
  }, [roundFeedback]);

  // Start / Reset game logic
  const startGame = () => {
    setGeoPeace(70);
    setAesthetic(60);
    setPopApproval(55);
    setCurrentIdx(0);
    setSelectedOptId(null);
    setRoundFeedback("");
    setGameStatus('PLAYING');
  };

  // Safe choice execution handler
  const handleSelectOption = useCallback((optionId) => {
    // 🛡️ SECURITY ENHANCEMENT: Defensive input/parameter validation
    const VALID_IDS = ["A", "B", "C"];
    if (!VALID_IDS.includes(optionId)) {
      console.warn(`[Sentinel] Invalid option select parameter: ${optionId}`);
      return;
    }

    if (gameStatusRef.current !== 'PLAYING' || roundFeedbackRef.current !== "") return;

    const currentScenario = SCENARIOS[currentIdxRef.current];
    const option = currentScenario.options.find(o => o.id === optionId);
    if (!option) return;

    setSelectedOptId(optionId);
    setRoundFeedback(option.feedback);

    // Apply effects
    const nextGeo = Math.max(0, geoPeace + option.effects.geo);
    const nextEst = Math.max(0, aesthetic + option.effects.est);
    const nextPop = Math.max(0, popApproval + option.effects.pop);

    setGeoPeace(nextGeo);
    setAesthetic(nextEst);
    setPopApproval(nextPop);

    // Check immediate loss condition
    const isGameOver = nextGeo <= 0 || nextEst <= 0 || nextPop <= 0;

    setTimeout(() => {
      if (isGameOver) {
        setGameStatus('GAME_OVER');
      } else {
        const nextIdx = currentIdxRef.current + 1;
        if (nextIdx >= SCENARIOS.length) {
          setGameStatus('VICTORY');
        } else {
          setCurrentIdx(nextIdx);
          setSelectedOptId(null);
          setRoundFeedback("");
        }
      }
    }, 4500); // Allow player to read the feedback
  }, [geoPeace, aesthetic, popApproval]);

  // Physical Keyboard Listener for Web
  useEffect(() => {
    if (!isWeb) return;

    const handleKeyDown = (e) => {
      const status = gameStatusRef.current;
      if (status !== 'PLAYING') {
        if (e.key === ' ' || e.key === 'Enter') {
          if (status === 'READY') {
            startGame();
          } else if (status === 'VICTORY' || status === 'GAME_OVER') {
            startGame();
          }
        }
        return;
      }

      // Keys mapping to options during gameplay
      if (roundFeedbackRef.current === "") {
        const key = e.key.toUpperCase();
        if (key === 'A' || key === 'B' || key === 'C') {
          handleSelectOption(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption]);

  // Performance Optimization: Memoized headers & stat indicators
  const headerComponent = useMemo(() => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          accessibilityHint="Retourner au menu principal de l'arcade">
          <Text style={styles.backButtonText}>📴 Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EUROPRINT SIMULATOR</Text>
        <View style={{width: 65}} />
      </View>
    );
  }, [navigation]);

  const statsGaugeRow = useMemo(() => {
    const geoColor = geoPeace > 60 ? '#2ecc71' : geoPeace > 30 ? '#e67e22' : '#e74c3c';
    const estColor = aesthetic > 60 ? '#9b59b6' : aesthetic > 30 ? '#3498db' : '#e74c3c';
    const popColor = popApproval > 60 ? '#f1c40f' : popApproval > 30 ? '#e67e22' : '#e74c3c';

    return (
      <View style={styles.hudStatsRow}>
        <View style={styles.statGaugeContainer}>
          <Text style={styles.statLabel}>🕊️ PAIX GÉO</Text>
          <View style={styles.gaugeBg}>
            <View style={[styles.gaugeFill, {width: `${Math.min(100, geoPeace)}%`, backgroundColor: geoColor}]} />
          </View>
          <Text style={styles.gaugeVal}>{geoPeace}%</Text>
        </View>

        <View style={styles.statGaugeContainer}>
          <Text style={styles.statLabel}>🎨 ESTHÉTIQUE</Text>
          <View style={styles.gaugeBg}>
            <View style={[styles.gaugeFill, {width: `${Math.min(100, aesthetic)}%`, backgroundColor: estColor}]} />
          </View>
          <Text style={styles.gaugeVal}>{aesthetic}%</Text>
        </View>

        <View style={styles.statGaugeContainer}>
          <Text style={styles.statLabel}>👥 POPULAIRE</Text>
          <View style={styles.gaugeBg}>
            <View style={[styles.gaugeFill, {width: `${Math.min(100, popApproval)}%`, backgroundColor: popColor}]} />
          </View>
          <Text style={styles.gaugeVal}>{popApproval}%</Text>
        </View>
      </View>
    );
  }, [geoPeace, aesthetic, popApproval]);

  const activeScenario = SCENARIOS[currentIdx];

  // Final evaluation score helper
  const finalScore = useMemo(() => {
    return geoPeace + aesthetic + popApproval;
  }, [geoPeace, aesthetic, popApproval]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {headerComponent}

        {gameStatus === 'PLAYING' && statsGaugeRow}

        {/* Outer CRT Arcade Screen */}
        <View style={[styles.arcadeFrame, {height: CONTAINER_HEIGHT}]}>
          <View style={styles.scanlines} pointerEvents="none" />

          {gameStatus === 'READY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.logoText}>💶 EUROPRINT 💶</Text>
              <Text style={styles.subtext}>MISSION NOUVEAUX BILLETS</Text>
              <Text style={styles.desc}>
                La BCE vous a nommé Directeur de la Création fiduciaire. Vos choix vont dessiner la monnaie de 340 millions d'Européens.{"\n"}{"\n"}
                🐦 Choisirez-vous les oiseaux poétiques ou les figures historiques ?{"\n"}
                📐 Aurez-vous l'audace du design vertical ou du rond transparent ?{"\n"}{"\n"}
                ⚖️ **Votre Mission :** Maintenez la Paix Géopolitique, l'Esthétique, et l'Adhésion Populaire au-dessus de 0% pour imprimer le billet parfait !
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel="Commencer la simulation"
                accessibilityHint="Lance la simulation de création des billets de banque">
                <Text style={styles.actionButtonText}>DÉMARRER LA SIMULATION</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'PLAYING' && activeScenario && (
            <View style={styles.scenarioScreen}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioProgress}>ÉTAPE {activeScenario.id} / {SCENARIOS.length}</Text>
                <Text style={styles.scenarioTitle}>{activeScenario.title}</Text>
              </View>

              <Text style={styles.scenarioSituation}>{activeScenario.situation}</Text>

              {/* Options Section */}
              <ScrollView style={styles.optionsList} contentContainerStyle={{paddingBottom: 10}}>
                {activeScenario.options.map((opt) => {
                  const isSelected = selectedOptId === opt.id;
                  const optEffects = opt.effects;
                  const formattedEffects = `${optEffects.geo >= 0 ? '+' : ''}${optEffects.geo} Géo, ${optEffects.est >= 0 ? '+' : ''}${optEffects.est} Est, ${optEffects.pop >= 0 ? '+' : ''}${optEffects.pop} Pop`;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      disabled={roundFeedback !== ""}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionSelected : {},
                        roundFeedback !== "" && !isSelected ? styles.optionDisabled : {}
                      ]}
                      onPress={() => handleSelectOption(opt.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Option ${opt.id} : ${opt.label}`}
                      accessibilityHint={opt.desc}>
                      <View style={styles.optionRow}>
                        <View style={styles.optionLetterBadge}>
                          <Text style={styles.optionLetterText}>{opt.id}</Text>
                        </View>
                        <View style={styles.optionTextCol}>
                          <Text style={styles.optionLabel}>{opt.label}</Text>
                          <Text style={styles.optionDesc}>{opt.desc}</Text>
                          <Text style={styles.optionEffectsText}>[{formattedEffects}]</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Animated feedback overlay */}
              {roundFeedback !== "" && (
                <View style={styles.feedbackPopup}>
                  <Text style={styles.feedbackTitle}>📣 IMPACT DE VOTRE DÉCISION :</Text>
                  <Text style={styles.feedbackContentText}>{roundFeedback}</Text>
                  <Text style={styles.feedbackWaitMessage}>Analyse des répercussions fiduciaires...</Text>
                </View>
              )}
            </View>
          )}

          {gameStatus === 'VICTORY' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>🏆</Text>
              <Text style={styles.logoText}>BILLETS IMPRIMÉS AVEC SUCCÈS !</Text>
              <Text style={styles.desc}>
                Félicitations ! Vous avez traversé les écueils géopolitiques sans provoquer l'éclatement de la zone Euro !{"\n"}{"\n"}
                Vos oiseaux colorés et vos technologies transparentes volent à travers le continent. JuliA a validé la mise en production de votre design.
              </Text>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreTitle}>RANG FIDUCIAIRE :</Text>
                <Text style={styles.scoreRank}>
                  {finalScore >= 220 ? "💎 DESIGNER LÉGENDAIRE (MÉMENTO J)" : finalScore >= 160 ? "🥇 CRÉATEUR SUPÉRIEUR" : "🥈 CONSERVATEUR DE LA BCE"}
                </Text>
                <Text style={styles.scoreDetails}>Score global : {finalScore} pts (Géo: {geoPeace}%, Est: {aesthetic}%, Pop: {popApproval}%)</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, {borderColor: '#2ecc71'}]}
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel="Rejouer la simulation"
                accessibilityHint="Relance une nouvelle partie du simulateur de billets">
                <Text style={[styles.actionButtonText, {color: '#2ecc71'}]}>NOUVELLE PLANCHE DE BILLETS</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameStatus === 'GAME_OVER' && (
            <View style={styles.screenOverlay}>
              <Text style={styles.statusEmoji}>💀</Text>
              <Text style={[styles.logoText, {color: '#e74c3c'}]}>CRASH BANCAIRE & VETO !</Text>
              <Text style={styles.desc}>
                Une de vos jauges est tombée à 0% !{"\n"}{"\n"}
                {geoPeace <= 0 && "❌ La discorde sur les personnalités (notamment Marie Curie) a provoqué le veto d'un État membre. Crise diplomatique majeure !"}
                {aesthetic <= 0 && "❌ Vos choix graphiques ont produit des billets qualifiés d'affreux par toute la presse spécialisée. Prestige de l'Euro détruit !"}
                {popApproval <= 0 && "❌ Le public rejette massivement vos billets administratifs froids. Les gens reviennent au troc et aux cryptos de JuliA !"}
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, {borderColor: '#e74c3c'}]}
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel="Recommencer la simulation"
                accessibilityHint="Relance la simulation à partir de zéro">
                <Text style={[styles.actionButtonText, {color: '#e74c3c'}]}>RE-TENTER LA CONCILIATION</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Keyboard layout hints */}
        {gameStatus === 'PLAYING' && (
          <View style={styles.keyboardHints}>
            <Text style={styles.hintText}>
              {isWeb
                ? "Touches Clavier : Appuyez sur [A], [B] ou [C] pour choisir une option"
                : "Appuyez sur une carte pour faire un choix"}
            </Text>
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
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  hudPropsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    marginTop: 6,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statGaugeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#8b949e',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gaugeBg: {
    width: '100%',
    height: 7,
    backgroundColor: '#161b22',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  arcadeFrame: {
    position: 'relative',
    backgroundColor: '#0d1117',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 430,
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowRadius: 6,
  },
  subtext: {
    fontSize: 10,
    color: '#39ff14',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 15,
    letterSpacing: 2,
  },
  desc: {
    fontSize: 11.5,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  scenarioScreen: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  scenarioHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  scenarioProgress: {
    fontSize: 9,
    color: '#39ff14',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  scenarioSituation: {
    fontSize: 11,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  optionsList: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: '#161b22',
    borderWidth: 1.5,
    borderColor: '#30363d',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  optionLetterText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  optionDesc: {
    fontSize: 10,
    color: '#8b949e',
    marginTop: 2,
  },
  optionEffectsText: {
    fontSize: 9,
    color: '#39ff14',
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  feedbackPopup: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.96)',
    borderWidth: 2,
    borderColor: '#39ff14',
    borderRadius: 8,
    padding: 12,
    zIndex: 999,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#39ff14',
    marginBottom: 4,
  },
  feedbackContentText: {
    fontSize: 11,
    color: '#FFF',
    lineHeight: 15,
  },
  feedbackWaitMessage: {
    fontSize: 8.5,
    color: '#8b949e',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'right',
  },
  statusEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  scoreContainer: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 10,
    color: '#8b949e',
    fontWeight: 'bold',
  },
  scoreRank: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFD700',
    marginVertical: 4,
    textAlign: 'center',
  },
  scoreDetails: {
    fontSize: 10,
    color: '#bdc3c7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  keyboardHints: {
    width: '100%',
    maxWidth: 430,
    marginTop: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 9.5,
    color: '#8b949e',
    textAlign: 'center',
  }
});

export default BceBanknoteGameScreen;