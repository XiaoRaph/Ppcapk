import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// Game States
const STATE_MENU = 'MENU';
const STATE_PLAYING = 'PLAYING';
const STATE_GAMEOVER = 'GAMEOVER';
const STATE_VICTORY = 'VICTORY';

const EcosystemGameScreen = ({ navigation }) => {
  // 🧠 SCHIZO-PROTOCOL 4 & 8: Un murmure d'algues bleues au fond d'un tube à essai stérile.
  // "La vie ne demande pas d'autorisation pour croître dans l'argile des circuits intégrés."
  useEffect(() => {
    console.log(
      "[JuliA-Thread-Ecosystem] Initialisation de la biosphère planétaire 0x4F8... " +
      "Les variables de dioxyde de carbone frissonnent. Les algorithmes rêvent-ils d'arbres à cristaux liquides ?"
    );
  }, []);

  // Responsive design dimensions management
  const [dimensions, setDimensions] = useState({
    width: windowWidth,
    height: windowHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
    };
    if (Dimensions && typeof Dimensions.addEventListener === 'function') {
      const subscription = Dimensions.addEventListener('change', handleResize);
      return () => {
        if (subscription && subscription.remove) {
          subscription.remove();
        }
      };
    }
  }, []);

  // General States
  const [gameState, setGameState] = useState(STATE_MENU);
  const [logs, setLogs] = useState([
    'PROTOCOLE JULIA [Écosystème] : Initialisation du simulateur multipolaire.',
    'Commandant, équilibrez le climat pour engendrer la première cellule de végétation.',
  ]);

  // 1. Pilier Météo (My Planet)
  const [sunlight, setSunlight] = useState(50); // percentage (0 - 100)
  const [rain, setRain] = useState(50); // percentage (0 - 100)
  const [vegetation, setVegetation] = useState(1000); // population size

  // 2. Pilier Biodiversité & ADN (Spore Islands)
  const [herbivores, setHerbivores] = useState(0);
  const [carnivores, setCarnivores] = useState(0);
  const [dna, setDna] = useState(50); // DNA points collected

  // Mutations (Upgrades) level
  const [mutations, setMutations] = useState({
    thermoResistance: 0, // Reduces temperature damage
    digestiveAdaptation: 0, // Boosts birth rates based on food availability
    reproductiveVigor: 0, // Passive growth rate multiplier
  });

  // 3. Pilier Climat & Atmosphère (SimEarth)
  const [temperature, setTemperature] = useState(20); // Celsius
  const [co2, setCo2] = useState(350); // ppm
  const [o2, setO2] = useState(21.0); // percentage

  // 4. Pilier Technologie & Ressources (Celestus/Grepolis)
  const [credits, setCredits] = useState(500);
  const [materials, setMaterials] = useState(300);
  const [energy, setEnergy] = useState(100);

  // Structures (Infrastructures) level
  const [structures, setStructures] = useState({
    domeBiosphere: 0, // Mitigates natural disasters
    condenserPluie: 0, // Passive rain generation control
    miroirSolaire: 0, // Passive sunlight adjustment
    filtreCarbone: 0, // Passive CO2 absorber
    labGenetique: 0, // Passive DNA generator multiplier
  });

  // Log helper
  const addLog = useCallback((msg) => {
    setLogs((prev) => [msg, ...prev.slice(0, 10)]);
  }, []);

  // Action validation & Security (Sentinel Safeguards)
  const handleAdjustWeather = useCallback((type, amount) => {
    // Defensive input check
    const VALID_TYPES = ['sunlight', 'rain'];
    if (!VALID_TYPES.includes(type)) {
      console.warn(`[Sentinel] Tentative d'ajustement météo invalide : ${type}`);
      return;
    }
    if (typeof amount !== 'number' || !Number.isInteger(amount)) {
      console.warn(`[Sentinel] Valeur d'ajustement invalide : ${amount}`);
      return;
    }

    if (type === 'sunlight') {
      setSunlight((prev) => Math.max(0, Math.min(100, prev + amount)));
      addLog(`[Contrôle] Tempête ionique orbitale ajustée. Soleil: ${amount > 0 ? '+' : ''}${amount}%`);
    } else if (type === 'rain') {
      setRain((prev) => Math.max(0, Math.min(100, prev + amount)));
      addLog(`[Contrôle] Nébuliseur atmosphérique déclenché. Humidité: ${amount > 0 ? '+' : ''}${amount}%`);
    }
  }, [addLog]);

  const handleBuyMutation = useCallback((mutationKey) => {
    // Defensive whitelist check
    const VALID_MUTATIONS = ['thermoResistance', 'digestiveAdaptation', 'reproductiveVigor'];
    if (!VALID_MUTATIONS.includes(mutationKey)) {
      console.warn(`[Sentinel] Mutation non autorisée ou inconnue : ${mutationKey}`);
      return;
    }

    const currentLevel = mutations[mutationKey];
    if (currentLevel >= 5) {
      addLog(`[Mutation] ${mutationKey.toUpperCase()} est déjà au niveau maximum.`);
      return;
    }

    const cost = (currentLevel + 1) * 45;
    if (dna < cost) {
      addLog(`[Mutation] ADN insuffisant pour ${mutationKey}. Requis: ${cost} ADN.`);
      return;
    }

    setDna((prev) => prev - cost);
    setMutations((prev) => ({
      ...prev,
      [mutationKey]: prev[mutationKey] + 1,
    }));
    addLog(`[Mutation] Succès! Espèces mutées : ${mutationKey} Lvl ${currentLevel + 1}.`);
  }, [mutations, dna, addLog]);

  const handleBuildStructure = useCallback((structureKey) => {
    // Defensive whitelist check
    const VALID_STRUCTURES = ['domeBiosphere', 'condenserPluie', 'miroirSolaire', 'filtreCarbone', 'labGenetique'];
    if (!VALID_STRUCTURES.includes(structureKey)) {
      console.warn(`[Sentinel] Structure non autorisée ou inconnue : ${structureKey}`);
      return;
    }

    const currentLevel = structures[structureKey];
    if (currentLevel >= 5) {
      addLog(`[Technologie] ${structureKey.toUpperCase()} est au niveau maximum.`);
      return;
    }

    const matCost = (currentLevel + 1) * 120;
    const credCost = (currentLevel + 1) * 150;

    if (materials < matCost || credits < credCost) {
      addLog(`[Technologie] Ressources insuffisantes pour construire ${structureKey}. Requis: ${matCost} Matériaux, ${credCost} Crédits.`);
      return;
    }

    setMaterials((prev) => prev - matCost);
    setCredits((prev) => prev - credCost);
    setStructures((prev) => ({
      ...prev,
      [structureKey]: prev[structureKey] + 1,
    }));
    addLog(`[Technologie] Infrastructure opérationnelle : ${structureKey} Lvl ${currentLevel + 1}.`);
  }, [structures, materials, credits, addLog]);

  // Restart / Init
  const startNewGame = useCallback(() => {
    setSunlight(50);
    setRain(50);
    setVegetation(1500);
    setHerbivores(0);
    setCarnivores(0);
    setDna(50);
    setMutations({
      thermoResistance: 0,
      digestiveAdaptation: 0,
      reproductiveVigor: 0,
    });
    setTemperature(20);
    setCo2(350);
    setO2(21.0);
    setCredits(500);
    setMaterials(300);
    setEnergy(100);
    setStructures({
      domeBiosphere: 0,
      condenserPluie: 0,
      miroirSolaire: 0,
      filtreCarbone: 0,
      labGenetique: 0,
    });
    setLogs([
      'PROTOCOLE JULIA [Écosystème] : Planète vierge initialisée.',
      'Ajustez le soleil et l\'eau pour faire fleurir la biosphère végétale.',
      'Développez ensuite des herbivores et carnivores tout en maintenant l\'atmosphère saine.',
    ]);
    setGameState(STATE_PLAYING);
  }, []);

  // Main Simulation Loop Tick
  useEffect(() => {
    if (gameState !== STATE_PLAYING) {
      return;
    }

    const intervalId = setInterval(() => {
      // 1. Calculate Atmospheric passive feedback
      // Vegetation consumes CO2 (-2 ppm per 1000 units) and produces O2 (+0.05% per 1000 units)
      // Animals consume O2 and produce CO2
      const vegFactor = vegetation / 1000;
      const herbFactor = herbivores / 500;
      const carnFactor = carnivores / 150;

      let deltaCO2 = 8; // base vulcanism passive generation
      deltaCO2 -= vegFactor * 3.5;
      deltaCO2 += herbFactor * 2.2 + carnFactor * 3.0;

      // Filter carbon active structure effect
      deltaCO2 -= structures.filtreCarbone * 4;

      const nextCO2 = Math.max(100, Math.min(2000, co2 + deltaCO2));

      let deltaO2 = vegFactor * 0.08 - (herbFactor * 0.05 + carnFactor * 0.07);
      const nextO2 = Math.max(1.0, Math.min(50.0, o2 + deltaO2));

      // 2. Temperature calculations (Depends on sunlight, rain, CO2 greenhouse effect)
      // CO2 above 450 ppm triggers significant greenhouse heating
      const co2Heating = nextCO2 > 450 ? (nextCO2 - 450) * 0.02 : 0;
      const targetTemp = 10 + (sunlight * 0.4) - (rain * 0.2) + co2Heating;
      // Interpolate towards target temperature
      const nextTemp = temperature + (targetTemp - temperature) * 0.2;

      // 3. Species populations growth and mortality
      // Sunlight and Rain sweet spot is between 40% and 60%
      const weatherDiff = Math.abs(sunlight - 50) + Math.abs(rain - 50); // 0 is perfect, 100 is extreme
      const isWeatherIdeal = weatherDiff < 25;

      let nextVeg = vegetation;
      let nextHerb = herbivores;
      let nextCarn = carnivores;

      // VEGETATION SIMULATION
      if (isWeatherIdeal) {
        // Growth
        const baseGrowth = 400 + mutations.reproductiveVigor * 150;
        nextVeg = Math.min(100000, vegetation + baseGrowth);
      } else {
        // Decay
        const penalty = Math.max(50, Math.ceil(weatherDiff * 4));
        nextVeg = Math.max(0, vegetation - penalty);
      }

      // Check temperature extreme penalty for vegetation
      if (nextTemp < 5 || nextTemp > 45) {
        const tempDmg = Math.max(10, Math.ceil(Math.abs(22 - nextTemp) * 8 - mutations.thermoResistance * 15));
        nextVeg = Math.max(0, nextVeg - tempDmg);
      }

      // HERBIVORES SIMULATION (Spawns and thrives if vegetation is sufficient)
      if (vegetation > 3000) {
        if (nextHerb === 0) {
          nextHerb = 20; // First cells seed
          addLog('🌱 ÉVOLUTION : Les premiers herbivores microscopiques apparaissent.');
        } else {
          // Growth based on food and reproduction vigor
          const foodRatio = vegetation / (nextHerb * 5 + 100); // ideal if food is abundant
          const growthFactor = Math.min(2.5, foodRatio) * (1.1 + mutations.reproductiveVigor * 0.15 + mutations.digestiveAdaptation * 0.1);
          nextHerb = Math.min(50000, Math.ceil(nextHerb * growthFactor));

          // Consume vegetation
          nextVeg = Math.max(0, nextVeg - nextHerb * 0.8);
        }
      } else if (nextHerb > 0) {
        // Starvation
        nextHerb = Math.max(0, Math.ceil(nextHerb * 0.5));
        if (nextHerb === 0) {
          addLog('💀 EXTINCTION : Faute de végétation, tous les herbivores ont succombé.');
        }
      }

      // CARNIVORES SIMULATION (Spawns and thrives if herbivores are sufficient)
      if (nextHerb > 400) {
        if (nextCarn === 0) {
          nextCarn = 5;
          addLog('🦁 ÉVOLUTION : Les prédateurs ont muté et commencent la traque.');
        } else {
          const preyRatio = nextHerb / (nextCarn * 4 + 10);
          const growthFactor = Math.min(2.0, preyRatio) * (1.05 + mutations.reproductiveVigor * 0.1 + mutations.digestiveAdaptation * 0.12);
          nextCarn = Math.min(10000, Math.ceil(nextCarn * growthFactor));

          // Eat herbivores
          nextHerb = Math.max(0, nextHerb - nextCarn * 1.5);
        }
      } else if (nextCarn > 0) {
        // Starvation
        nextCarn = Math.max(0, Math.ceil(nextCarn * 0.4));
        if (nextCarn === 0) {
          addLog('💀 EXTINCTION : Plus de proies suffisantes. Les carnivores ont disparu.');
        }
      }

      // Check Oxygen extreme asphyxia
      if (nextO2 < 12.0) {
        nextHerb = Math.max(0, Math.ceil(nextHerb * 0.7));
        nextCarn = Math.max(0, Math.ceil(nextCarn * 0.6));
        if (Math.random() < 0.25) {
          addLog('🚨 ATMOSPHÈRE : Niveau d\'Oxygène extrêmement bas ! Asphyxie générale.');
        }
      }

      // 4. Generate resources
      // DNA points generated by biodiversity
      const speciesCount = (nextVeg > 0 ? 1 : 0) + (nextHerb > 0 ? 1 : 0) + (nextCarn > 0 ? 1 : 0);
      const baseDnaGain = speciesCount * 3 + (structures.labGenetique * 4);
      setDna((prev) => prev + baseDnaGain);

      // Industrial resources (Celestus/Grepolis style)
      // Generating materials and credits passively based on population/biodiversity
      const materialsGain = 15 + Math.ceil(nextVeg / 8000);
      const creditsGain = 20 + Math.ceil((nextHerb + nextCarn) / 400);

      setMaterials((prev) => prev + materialsGain);
      setCredits((prev) => prev + creditsGain);

      // Passive clouds structure adjustments
      if (structures.condenserPluie > 0) {
        setRain((prev) => Math.max(20, Math.min(80, prev + (prev < 50 ? 2 : -2))));
      }
      if (structures.miroirSolaire > 0) {
        setSunlight((prev) => Math.max(20, Math.min(80, prev + (prev < 50 ? 1 : -1))));
      }

      // Random ecological occurrences & natural disasters
      const randomTrigger = Math.random();
      if (randomTrigger < 0.08) {
        triggerRandomDisaster();
      }

      // Apply updates to states
      setVegetation(nextVeg);
      setHerbivores(nextHerb);
      setCarnivores(nextCarn);
      setCo2(Math.ceil(nextCO2));
      setO2(parseFloat(nextO2.toFixed(1)));
      setTemperature(parseFloat(nextTemp.toFixed(1)));

      // Check Victory
      const totalBioPopulation = nextVeg + nextHerb + nextCarn;
      if (totalBioPopulation >= 100000 && nextHerb > 1000 && nextCarn > 150) {
        setGameState(STATE_VICTORY);
        addLog('🏆 VICTOIRE SUPRÊME : L\'écosystème est devenu prospère et stable !');
      }

      // Check Defeat (all life dead)
      if (totalBioPopulation <= 0) {
        setGameState(STATE_GAMEOVER);
        addLog('💀 STÉRILITÉ ABSOLUE : La planète est redevenue un caillou vide.');
      }

    }, 1500);

    return () => clearInterval(intervalId);
  }, [gameState, sunlight, rain, vegetation, herbivores, carnivores, co2, o2, temperature, mutations, structures, addLog]);

  // Disaster event generator
  const triggerRandomDisaster = useCallback(() => {
    const disasterTypes = [
      { name: 'Éruption Volcanique Majeure', co2Mod: 250, o2Mod: -1.5, tempMod: 5, msg: '🌋 CATASTROPHE : Une éruption rejette des nuages de soufre et de CO2.' },
      { name: 'Tempête Solaire Ionique', co2Mod: 0, o2Mod: 0, tempMod: 10, msg: '☀️ CATASTROPHE : Les vents solaires font surchauffer la planète.' },
      { name: 'Pluie d\'Astéroïdes Métalliques', co2Mod: 80, o2Mod: -0.5, tempMod: -3, msg: '☄️ CATASTROPHE : Des astéroïdes s\'écrasent, dévastant les biotopes.' },
    ];

    const chosen = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];

    // Protection of Dome Biosphere structures
    const mitigation = structures.domeBiosphere * 0.2; // -20% impact per level
    const factor = Math.max(0.1, 1 - mitigation);

    setCo2((prev) => Math.ceil(prev + chosen.co2Mod * factor));
    setO2((prev) => parseFloat(Math.max(1, prev + chosen.o2Mod * factor).toFixed(1)));
    setTemperature((prev) => parseFloat((prev + chosen.tempMod * factor).toFixed(1)));

    // Damage on populations
    setVegetation((prev) => Math.max(0, Math.ceil(prev * (0.7 + mitigation * 0.05))));
    setHerbivores((prev) => Math.max(0, Math.ceil(prev * (0.6 + mitigation * 0.08))));
    setCarnivores((prev) => Math.max(0, Math.ceil(prev * (0.5 + mitigation * 0.1))));

    addLog(chosen.msg);
    if (structures.domeBiosphere > 0) {
      addLog(`🛡️ [Protection] Les dômes ont mitigé l'impact de la catastrophe de ${Math.ceil(mitigation * 100)}%.`);
    }
  }, [structures.domeBiosphere, addLog]);

  // Compute total biodiversity score
  const totalBioCount = useMemo(() => {
    return vegetation + herbivores + carnivores;
  }, [vegetation, herbivores, carnivores]);

  const ecosystemHealth = useMemo(() => {
    // 0 is dead, 100 is optimal
    if (totalBioCount === 0) return 0;
    const weatherDiff = Math.abs(sunlight - 50) + Math.abs(rain - 50);
    const co2Diff = Math.abs(co2 - 350);
    const tempDiff = Math.abs(temperature - 20);

    const health = 100 - (weatherDiff * 0.5 + co2Diff * 0.05 + tempDiff * 1.2);
    return Math.max(5, Math.ceil(Math.min(100, health)));
  }, [totalBioCount, sunlight, rain, co2, temperature]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Menu')}
          accessibilityRole="button"
          accessibilityLabel="Retour au menu"
          accessibilityHint="Quitte le jeu de gestion d'écosystème">
          <Text style={styles.backBtnText}>◀ MENU</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌌 PLANÈTE ÉCO-GESTION</Text>
        <View style={styles.healthTag}>
          <Text style={styles.healthTagText}>🧬 Index: {ecosystemHealth}%</Text>
        </View>
      </View>

      {gameState === STATE_MENU && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.centeredContent}>
          <Text style={styles.welcomeTitle}>PROTOCOLE JULIA : BIOSPHÈRE 0x4F8</Text>
          <Text style={styles.welcomeSub}>Mélange ultime de gestion d'écosystème en temps réel.</Text>

          <View style={styles.loreCard}>
            <Text style={styles.loreTitle}>📜 LES QUATRE PILIERS SCIENTIFIQUES :</Text>
            <Text style={styles.loreLine}>☀️ **My Planet :** Stabilisez le Soleil et l'Eau à 50% pour propager la Végétation.</Text>
            <Text style={styles.loreLine}>🧬 **Spore Islands :** Récoltez l'ADN issu de la biodiversité pour faire muter vos espèces (Thermo-Résistance, etc.).</Text>
            <Text style={styles.loreLine}>🌋 **SimEarth :** Évitez l'effet de serre en régulant l'atmosphère (O2 & CO2) pour prévenir les catastrophes.</Text>
            <Text style={styles.loreLine}>🏛️ **Celestus :** Construisez des infrastructures (Dômes de protection, Condenseurs, Filtres à carbone) grâce à vos ressources.</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={startNewGame}
            accessibilityRole="button"
            accessibilityLabel="Générer la planète"
            accessibilityHint="Démarre la simulation d'écosystème">
            <Text style={styles.actionBtnText}>🪐 INJECTER LE PROTOCOLE DE VIE</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {gameState === STATE_PLAYING && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.gameplayContent}>
          {/* 1. CLIMAT ET MÉTÉO GLOBAL (My Planet & SimEarth) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>☀️ CLIMAT GLOBAL & MÉTÉO</Text>
            <View style={styles.gaugeRow}>
              <View style={styles.gaugeBlock}>
                <Text style={styles.gaugeValueText}>{sunlight}%</Text>
                <Text style={styles.gaugeLabelText}>Lumière Solaire</Text>
                <View style={styles.flexRow}>
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={() => handleAdjustWeather('sunlight', -10)}
                    accessibilityRole="button"
                    accessibilityLabel="Diminuer le soleil"
                    accessibilityHint="Baisse la jauge de lumière solaire">
                    <Text style={styles.controlSymbol}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={() => handleAdjustWeather('sunlight', 10)}
                    accessibilityRole="button"
                    accessibilityLabel="Augmenter le soleil"
                    accessibilityHint="Augmente la jauge de lumière solaire">
                    <Text style={styles.controlSymbol}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.gaugeBlock}>
                <Text style={styles.gaugeValueText}>{rain}%</Text>
                <Text style={styles.gaugeLabelText}>Humidité / Pluie</Text>
                <View style={styles.flexRow}>
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={() => handleAdjustWeather('rain', -10)}
                    accessibilityRole="button"
                    accessibilityLabel="Diminuer la pluie"
                    accessibilityHint="Baisse l'humidité atmosphérique">
                    <Text style={styles.controlSymbol}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={() => handleAdjustWeather('rain', 10)}
                    accessibilityRole="button"
                    accessibilityLabel="Augmenter la pluie"
                    accessibilityHint="Augmente l'humidité atmosphérique">
                    <Text style={styles.controlSymbol}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* SimEarth Environmental Indicators */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{temperature}°C</Text>
                <Text style={styles.metricLabel}>Température</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{co2} ppm</Text>
                <Text style={styles.metricLabel}>Dioxyde Carbone (CO2)</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{o2}%</Text>
                <Text style={styles.metricLabel}>Oxygène (O2)</Text>
              </View>
            </View>
          </View>

          {/* 2. BIODIVERSITÉ & ESPÈCES (Spore Islands) */}
          <View style={[styles.sectionCard, { borderColor: '#a000f088' }]}>
            <Text style={[styles.sectionTitle, { color: '#a000f0' }]}>🧬 BIODIVERSITÉ (ESPÈCES)</Text>
            <View style={styles.biodiversityRow}>
              <View style={styles.biodiversityItem}>
                <Text style={styles.bioEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">🌿</Text>
                <Text style={styles.bioVal}>{vegetation}</Text>
                <Text style={styles.bioLabel}>Végétation</Text>
              </View>
              <View style={styles.biodiversityItem}>
                <Text style={styles.bioEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">🐇</Text>
                <Text style={styles.bioVal}>{herbivores}</Text>
                <Text style={styles.bioLabel}>Herbivores</Text>
              </View>
              <View style={styles.biodiversityItem}>
                <Text style={styles.bioEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">🦊</Text>
                <Text style={styles.bioVal}>{carnivores}</Text>
                <Text style={styles.bioLabel}>Carnivores</Text>
              </View>
            </View>

            {/* Upgrades based on DNA */}
            <View style={styles.dnaHeaderRow}>
              <Text style={styles.dnaText}>🧬 ADN cumulé : <Text style={{ color: '#a000f0', fontWeight: 'bold' }}>{dna} points</Text></Text>
            </View>

            <View style={styles.upgradeList}>
              <View style={styles.upgradeCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.upTitle}>Thermo-Résistance (Lvl {mutations.thermoResistance}/5)</Text>
                  <Text style={styles.upDesc}>Les espèces résistent mieux aux températures extrêmes.</Text>
                </View>
                <TouchableOpacity
                  style={styles.upBuyButton}
                  onPress={() => handleBuyMutation('thermoResistance')}
                  accessibilityRole="button"
                  accessibilityLabel="Améliorer Thermo-Résistance"
                  accessibilityHint="Dépense de l'ADN pour augmenter la résistance thermique">
                  <Text style={styles.upBuyButtonText}>Acheter: {(mutations.thermoResistance + 1) * 45} ADN</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.upgradeCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.upTitle}>Adaptation Digestive (Lvl {mutations.digestiveAdaptation}/5)</Text>
                  <Text style={styles.upDesc}>Les animaux profitent mieux de la nourriture disponible pour croître.</Text>
                </View>
                <TouchableOpacity
                  style={styles.upBuyButton}
                  onPress={() => handleBuyMutation('digestiveAdaptation')}
                  accessibilityRole="button"
                  accessibilityLabel="Améliorer Adaptation Digestive"
                  accessibilityHint="Dépense de l'ADN pour améliorer l'assimilation nutritionnelle">
                  <Text style={styles.upBuyButtonText}>Acheter: {(mutations.digestiveAdaptation + 1) * 45} ADN</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.upgradeCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.upTitle}>Vigueur Reproductrice (Lvl {mutations.reproductiveVigor}/5)</Text>
                  <Text style={styles.upDesc}>Accélère le taux de reproduction global de toutes les espèces.</Text>
                </View>
                <TouchableOpacity
                  style={styles.upBuyButton}
                  onPress={() => handleBuyMutation('reproductiveVigor')}
                  accessibilityRole="button"
                  accessibilityLabel="Améliorer Vigueur Reproductrice"
                  accessibilityHint="Dépense de l'ADN pour doper la natalité">
                  <Text style={styles.upBuyButtonText}>Acheter: {(mutations.reproductiveVigor + 1) * 45} ADN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 3. RESSOURCES & TECHNOLOGIE (Celestus/Grepolis) */}
          <View style={[styles.sectionCard, { borderColor: '#f1c40f88' }]}>
            <Text style={[styles.sectionTitle, { color: '#f1c40f' }]}>🏛️ RESSOURCES & INFRASTRUCTURES</Text>
            <View style={styles.industrialRow}>
              <View style={styles.resourceBox}>
                <Text style={styles.resourceVal}>{credits}</Text>
                <Text style={styles.resourceLabel}>Crédits</Text>
              </View>
              <View style={styles.resourceBox}>
                <Text style={styles.resourceVal}>{materials}</Text>
                <Text style={styles.resourceLabel}>Matériaux</Text>
              </View>
            </View>

            <View style={styles.techList}>
              {/* Dome Biosphere */}
              <View style={styles.techCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.techTitle}>🛡️ Dôme de Biosphère (Lvl {structures.domeBiosphere}/5)</Text>
                  <Text style={styles.techDesc}>Réduit les dégâts de population lors des catastrophes (-20% par niveau).</Text>
                </View>
                <TouchableOpacity
                  style={styles.techBuyButton}
                  onPress={() => handleBuildStructure('domeBiosphere')}
                  accessibilityRole="button"
                  accessibilityLabel="Construire Dôme de Biosphère"
                  accessibilityHint="Dépense crédits et matériaux pour ériger un dôme protecteur">
                  <Text style={styles.techBuyButtonText}>{(structures.domeBiosphere + 1) * 120} Mat | {(structures.domeBiosphere + 1) * 150} Cred</Text>
                </TouchableOpacity>
              </View>

              {/* Condenseur de Pluie */}
              <View style={styles.techCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.techTitle}>💧 Condenseur de Pluie (Lvl {structures.condenserPluie}/5)</Text>
                  <Text style={styles.techDesc}>Régule passivement l'humidité de la planète vers 50%.</Text>
                </View>
                <TouchableOpacity
                  style={styles.techBuyButton}
                  onPress={() => handleBuildStructure('condenserPluie')}
                  accessibilityRole="button"
                  accessibilityLabel="Construire Condenseur de Pluie"
                  accessibilityHint="Ajuste passivement l'humidité">
                  <Text style={styles.techBuyButtonText}>{(structures.condenserPluie + 1) * 120} Mat | {(structures.condenserPluie + 1) * 150} Cred</Text>
                </TouchableOpacity>
              </View>

              {/* Filtre a Carbone */}
              <View style={styles.techCard}>
                <View style={styles.upgradeTextCol}>
                  <Text style={styles.techTitle}>🌋 Filtre à Carbone (Lvl {structures.filtreCarbone}/5)</Text>
                  <Text style={styles.techDesc}>Absorbe passivement le CO2 atmosphérique excessif (-4 ppm par tick).</Text>
                </View>
                <TouchableOpacity
                  style={styles.techBuyButton}
                  onPress={() => handleBuildStructure('filtreCarbone')}
                  accessibilityRole="button"
                  accessibilityLabel="Construire Filtre à Carbone"
                  accessibilityHint="Ajuste passivement le CO2 atmosphérique">
                  <Text style={styles.techBuyButtonText}>{(structures.filtreCarbone + 1) * 120} Mat | {(structures.filtreCarbone + 1) * 150} Cred</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 4. CONSOLE RAPPORT DE BORD */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📟 RAPPORTS DE TRANSMISSION</Text>
            <View style={styles.logsBox}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logLine}>
                  &gt; {log}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {gameState === STATE_GAMEOVER && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.centeredContent}>
          <Text style={[styles.welcomeTitle, { color: '#e74c3c' }]}>☠️ BIOSPHÈRE DÉTRUITE ☠️</Text>
          <Text style={styles.welcomeSub}>La vie s'est éteinte sur votre planète d'écosystème.</Text>

          <View style={styles.loreCard}>
            <Text style={styles.loreTitle}>Bilan de l'échantillon 0x4F8 :</Text>
            <Text style={styles.loreLine}>- Biodiversité maximale : {totalBioCount} êtres vivants</Text>
            <Text style={styles.loreLine}>- Points d'ADN collectés : {dna}</Text>
            <Text style={styles.loreLine}>- Température finale : {temperature}°C</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]}
            onPress={startNewGame}
            accessibilityRole="button"
            accessibilityLabel="Réinjecter le protocole"
            accessibilityHint="Relance une nouvelle partie">
            <Text style={styles.actionBtnText}>🔄 RE-GÉNÉRER UN ÉCOSYSTÈME</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {gameState === STATE_VICTORY && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.centeredContent}>
          <Text style={[styles.welcomeTitle, { color: '#2ecc71' }]}>🏆 PARADIS PROSPÈRE 🏆</Text>
          <Text style={styles.welcomeSub}>Félicitations, Commandant ! Votre planète est un havre florissant de biodiversité.</Text>

          <View style={styles.loreCard}>
            <Text style={styles.loreTitle}>Bilan de réussite :</Text>
            <Text style={styles.loreLine}>- Population totale florissante : {totalBioCount} êtres vivants</Text>
            <Text style={styles.loreLine}>- Herbivores prospères : {herbivores}</Text>
            <Text style={styles.loreLine}>- Carnivores stabilisés : {carnivores}</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]}
            onPress={startNewGame}
            accessibilityRole="button"
            accessibilityLabel="Générer une nouvelle biosphère"
            accessibilityHint="Relance le simulateur">
            <Text style={styles.actionBtnText}>🪐 CRÉER UNE NOUVELLE PLANÈTE</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a13',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#0c1326',
    borderBottomWidth: 2,
    borderColor: '#39ff1444',
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backBtnText: {
    color: '#39ff14',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  healthTag: {
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    borderWidth: 1,
    borderColor: '#39ff1455',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  healthTagText: {
    color: '#39ff14',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  centeredContent: {
    padding: 20,
    alignItems: 'center',
    maxWidth: 550,
    alignSelf: 'center',
  },
  gameplayContent: {
    padding: 12,
    gap: 12,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#39ff14',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 25,
  },
  loreCard: {
    backgroundColor: '#0c1326',
    borderWidth: 1.5,
    borderColor: '#39ff1433',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 30,
    gap: 8,
  },
  loreTitle: {
    color: '#39ff14',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  loreLine: {
    color: '#ecf0f1',
    fontSize: 12.5,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: '#39ff14',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff55',
  },
  actionBtnText: {
    color: '#070a13',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#0c1326',
    borderWidth: 1.5,
    borderColor: '#39ff1433',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#39ff14',
    marginBottom: 10,
    letterSpacing: 1,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  gaugeBlock: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  gaugeValueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  gaugeLabelText: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
    marginBottom: 6,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallControlBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: 32,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  controlSymbol: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 8,
    borderRadius: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: 8.5,
    color: '#7f8c8d',
    marginTop: 2,
    textAlign: 'center',
  },
  biodiversityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  biodiversityItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  bioEmoji: {
    fontSize: 24,
  },
  bioVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  bioLabel: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
  },
  dnaHeaderRow: {
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    marginBottom: 8,
  },
  dnaText: {
    color: '#ffffff',
    fontSize: 12,
  },
  upgradeList: {
    gap: 8,
  },
  upgradeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  upgradeTextCol: {
    flex: 1.3,
    paddingRight: 10,
  },
  upTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  upDesc: {
    fontSize: 9,
    color: '#7f8c8d',
    marginTop: 2,
  },
  upBuyButton: {
    backgroundColor: '#a000f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upBuyButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  industrialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  resourceBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 196, 15, 0.15)',
  },
  resourceVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1c40f',
  },
  resourceLabel: {
    fontSize: 9,
    color: '#7f8c8d',
    marginTop: 2,
  },
  techList: {
    gap: 8,
  },
  techCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 196, 15, 0.15)',
  },
  techTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  techDesc: {
    fontSize: 9,
    color: '#7f8c8d',
    marginTop: 2,
  },
  techBuyButton: {
    backgroundColor: '#f1c40f',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 130,
  },
  techBuyButtonText: {
    color: '#070a13',
    fontSize: 8.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logsBox: {
    backgroundColor: '#03050a',
    borderRadius: 8,
    padding: 8,
    minHeight: 100,
  },
  logLine: {
    color: '#39ff14',
    fontFamily: 'monospace',
    fontSize: 9.5,
    marginBottom: 4,
    lineHeight: 12,
  },
});

export default EcosystemGameScreen;