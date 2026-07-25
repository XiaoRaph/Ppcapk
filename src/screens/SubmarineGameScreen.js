import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
const isWeb = Platform.OS === 'web';

// Default config
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1600;
const SUB_SIZE = 30;
const HULL_REPAIR_COST = 15;
const ENERGY_REFUEL_COST = 10;

// Game states
const STATE_MENU = 'MENU';
const STATE_PLAYING = 'PLAYING';
const STATE_GAMEOVER = 'GAMEOVER';
const STATE_VICTORY = 'VICTORY';
const STATE_BASE = 'BASE';

const SubmarineGameScreen = ({ navigation }) => {
  // Screen size management
  const [dimensions, setDimensions] = useState({
    width: windowWidth,
    height: windowHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
    };
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  // Primary Game States
  const [gameState, setGameState] = useState(STATE_MENU);
  const [gold, setGold] = useState(0);
  const [currentCargo, setCurrentCargo] = useState([]);
  const [logs, setLogs] = useState([
    'PROTOCOLE JULIA: Système de simulation sous-marine initialisé.',
    'Commandant, préparez-vous à plonger dans la Fosse des Mariannes.',
  ]);

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    coque: 1, // Max Hull (1: 100, 2: 150, 3: 200, 4: 300)
    batterie: 1, // Max Energy (1: 100, 2: 150, 3: 220, 4: 350)
    oxygene: 1, // Max Oxygen (1: 100, 2: 180, 3: 280, 4: 450)
    moteur: 1, // Speed / propulsion factor
    sonar: 1, // Radius of active radar scan
  });

  // Calculate stats based on upgrades
  const maxHull = useMemo(() => {
    switch (upgrades.coque) {
      case 2: return 150;
      case 3: return 220;
      case 4: return 320;
      default: return 100;
    }
  }, [upgrades.coque]);

  const maxEnergy = useMemo(() => {
    switch (upgrades.batterie) {
      case 2: return 160;
      case 3: return 240;
      case 4: return 350;
      default: return 100;
    }
  }, [upgrades.batterie]);

  const maxOxygen = useMemo(() => {
    switch (upgrades.oxygene) {
      case 2: return 180;
      case 3: return 280;
      case 4: return 450;
      default: return 100;
    }
  }, [upgrades.oxygene]);

  const maxSpeed = useMemo(() => {
    return 3 + upgrades.moteur * 0.8;
  }, [upgrades.moteur]);

  const sonarRadius = useMemo(() => {
    return 150 + upgrades.sonar * 80;
  }, [upgrades.sonar]);

  // Submarine Realtime stats (using refs for the physical simulation and state for React visual rendering)
  const [hull, setHull] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [oxygen, setOxygen] = useState(100);
  const [subX, setSubX] = useState(1000);
  const [subY, setSubY] = useState(120); // 0-100 is surface/base zone
  const [isSonarActive, setIsSonarActive] = useState(false);
  const [sonarPingProgress, setSonarPingProgress] = useState(0);

  // High-frequency values in refs to prevent React loop stale closure and render lag
  const subStateRef = useRef({
    x: 1000,
    y: 120,
    vx: 0,
    vy: 0,
    hull: 100,
    energy: 100,
    oxygen: 100,
    maxHull: 100,
    maxEnergy: 100,
    maxOxygen: 100,
    sonarRadius: 150,
    maxSpeed: 3.8,
  });

  // Keep refs updated with current upgrades/max values
  useEffect(() => {
    subStateRef.current.maxHull = maxHull;
    subStateRef.current.maxEnergy = maxEnergy;
    subStateRef.current.maxOxygen = maxOxygen;
    subStateRef.current.sonarRadius = sonarRadius;
    subStateRef.current.maxSpeed = maxSpeed;
  }, [maxHull, maxEnergy, maxOxygen, sonarRadius, maxSpeed]);

  // Sync state to ref on manual restore/refuel
  const syncRefWithState = (updatedHull, updatedEnergy, updatedOxygen, x, y) => {
    subStateRef.current.hull = updatedHull;
    subStateRef.current.energy = updatedEnergy;
    subStateRef.current.oxygen = updatedOxygen;
    subStateRef.current.x = x;
    subStateRef.current.y = y;
    subStateRef.current.vx = 0;
    subStateRef.current.vy = 0;
    setHull(updatedHull);
    setEnergy(updatedEnergy);
    setOxygen(updatedOxygen);
    setSubX(x);
    setSubY(y);
  };

  // Keyboard control tracking (for Arrow keys, WASD, and ZS/QD on French layouts)
  const activeKeysRef = useRef({});

  // Dynamic lists of items (Treasures, Hazards, Sonar scanned points)
  const [treasures, setTreasures] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [sonarSignals, setSonarSignals] = useState([]); // Signals currently "revealed" by sonar
  const [bubbles, setBubbles] = useState([]);

  // Generate game world elements
  const generateWorld = useCallback(() => {
    const newTreasures = [];
    const newHazards = [];

    // Base zone is 0 - 200 depth (safe and empty)
    // Create treasures progressively harder & more valuable as we go deeper
    const treasureTypes = [
      { name: 'Échantillon Hydrothermal', val: 20, color: '#3498db', depthMin: 250 },
      { name: 'Épave de Galion', val: 50, color: '#f1c40f', depthMin: 500 },
      { name: 'Relique Atlante', val: 120, color: '#9b59b6', depthMin: 900 },
      { name: 'Fragment d\'Énergie Pure', val: 250, color: '#e74c3c', depthMin: 1300 },
    ];

    // Generate treasures
    for (let i = 0; i < 45; i++) {
      const type = treasureTypes.filter(t => t.depthMin <= WORLD_HEIGHT)[
        Math.floor(Math.random() * treasureTypes.length)
      ];
      // Distribute appropriately by depth
      const y = type.depthMin + Math.random() * (WORLD_HEIGHT - type.depthMin - 100);
      const x = 50 + Math.random() * (WORLD_WIDTH - 100);
      newTreasures.push({
        id: `treasure_${i}`,
        x,
        y,
        name: type.name,
        value: type.val,
        color: type.color,
        size: 15,
        collected: false,
      });
    }

    // Generate active mines & dangerous rocks
    // Deep water is dense with hazards
    for (let i = 0; i < 60; i++) {
      const x = 50 + Math.random() * (WORLD_WIDTH - 100);
      const y = 250 + Math.random() * (WORLD_HEIGHT - 350);
      const size = 18 + Math.random() * 12;
      const type = Math.random() > 0.4 ? 'mine' : 'rock'; // mines might cause more damage
      newHazards.push({
        id: `hazard_${i}`,
        x,
        y,
        size,
        type,
        damage: type === 'mine' ? 30 : 15,
        color: type === 'mine' ? '#e74c3c' : '#7f8c8d',
      });
    }

    setTreasures(newTreasures);
    setHazards(newHazards);
    setSonarSignals([]);

    // Reset bubble particles
    const initialBubbles = Array.from({ length: 30 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      speed: 0.5 + Math.random() * 1.5,
      size: 1 + Math.random() * 3,
    }));
    setBubbles(initialBubbles);
  }, []);

  // Initialize/Restart Game
  const startNewGame = useCallback(() => {
    generateWorld();
    syncRefWithState(100, 100, 100, 1000, 120);
    setGold(0);
    setCurrentCargo([]);
    setUpgrades({
      coque: 1,
      batterie: 1,
      oxygene: 1,
      moteur: 1,
      sonar: 1,
    });
    setLogs([
      'PROTOCOLE JULIA: Nouveau simulateur sous-marin démarré.',
      'Objectif : Explorez les abysses, ramenez des trésors au port (profondeur < 150) et améliorez votre sous-marin.',
      'Faites attention à votre coque et aux niveaux d\'oxygène !',
    ]);
    setGameState(STATE_PLAYING);
  }, [generateWorld]);

  // Log message helper
  const addLog = useCallback((msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 12)]);
  }, []);

  // Upgrades shop execution
  const buyUpgrade = useCallback((type) => {
    const VALID_UPGRADES = ['coque', 'batterie', 'oxygene', 'moteur', 'sonar'];
    if (!VALID_UPGRADES.includes(type)) {
      console.warn(`[Sentinel] Upgrade non autorisée : ${type}`);
      return;
    }

    const currentLevel = upgrades[type];
    if (currentLevel >= 4) {
      addLog(`[Boutique] ${type.toUpperCase()} est déjà au niveau maximum.`);
      return;
    }

    const cost = currentLevel * 100; // upgrade scale cost: 100g, 200g, 300g
    if (gold < cost) {
      addLog(`[Boutique] Or insuffisant pour améliorer ${type}. Requis: ${cost} Or.`);
      return;
    }

    setGold(prev => prev - cost);
    setUpgrades(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    addLog(`[Boutique] Succès! Amélioration ${type} niveau ${currentLevel + 1} installée.`);
  }, [upgrades, gold, addLog]);

  // Port/Base operations
  const dockAtBase = useCallback(() => {
    if (subStateRef.current.y > 150) {
      addLog('Impossible d\'accoster ici. Vous devez remonter à la surface (Profondeur < 150).');
      return;
    }
    // Stop movement and open Base view
    subStateRef.current.vx = 0;
    subStateRef.current.vy = 0;
    setGameState(STATE_BASE);
  }, [addLog]);

  const leaveBase = useCallback(() => {
    // Docking automatically refills Oxygen and Battery
    const updatedEnergy = maxEnergy;
    const updatedOxygen = maxOxygen;
    syncRefWithState(hull, updatedEnergy, updatedOxygen, subStateRef.current.x, 120);
    setGameState(STATE_PLAYING);
    addLog('Départ de la station. Bonne plongée, Commandant.');
  }, [hull, maxEnergy, maxOxygen, addLog]);

  const sellCargo = useCallback(() => {
    if (currentCargo.length === 0) {
      addLog('[Base] Votre soute est vide.');
      return;
    }
    let totalEarnings = 0;
    currentCargo.forEach(item => {
      totalEarnings += item.value;
    });
    setGold(prev => prev + totalEarnings);
    setCurrentCargo([]);
    addLog(`[Base] Cargaison vendue avec succès ! Gain : +${totalEarnings} Or.`);
  }, [currentCargo, addLog]);

  const repairHullFull = useCallback(() => {
    const missingHull = maxHull - hull;
    if (missingHull <= 0) {
      addLog('[Base] La coque est déjà intacte (100%).');
      return;
    }
    if (gold < HULL_REPAIR_COST) {
      addLog(`[Base] Or insuffisant pour les réparations. Requis: ${HULL_REPAIR_COST} Or.`);
      return;
    }
    setGold(prev => prev - HULL_REPAIR_COST);
    setHull(maxHull);
    subStateRef.current.hull = maxHull;
    addLog('[Base] Coque réparée à 100%.');
  }, [hull, maxHull, gold, addLog]);

  // Sonar trigger scan
  const triggerSonarPing = useCallback(() => {
    if (subStateRef.current.energy < 15) {
      addLog('Énergie insuffisante pour un Scan Sonar (Requis: 15 Énergie).');
      return;
    }

    // Spend energy
    setEnergy(prev => {
      const next = Math.max(0, prev - 15);
      subStateRef.current.energy = next;
      return next;
    });

    setIsSonarActive(true);
    setSonarPingProgress(0);
    addLog('🔊 SONAR : Impulsion acoustique envoyée...');

    // Locate elements in radius
    const currentSubX = subStateRef.current.x;
    const currentSubY = subStateRef.current.y;
    const currentRadius = subStateRef.current.sonarRadius;

    // We keep discovered items highlighted for 6 seconds
    const pingId = Date.now();

    // Check treasures & hazards near
    const detectedTreasures = treasures
      .filter(t => !t.collected)
      .map(t => {
        const dx = t.x - currentSubX;
        const dy = t.y - currentSubY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return { item: t, dist };
      })
      .filter(entry => entry.dist <= currentRadius);

    const detectedHazards = hazards
      .map(h => {
        const dx = h.x - currentSubX;
        const dy = h.y - currentSubY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return { item: h, dist };
      })
      .filter(entry => entry.dist <= currentRadius);

    if (detectedTreasures.length === 0 && detectedHazards.length === 0) {
      addLog('SONAR : Écho vide. Aucun obstacle ou trésor détecté à proximité.');
    } else {
      addLog(`SONAR : ${detectedTreasures.length} signal(aux) utiles et ${detectedHazards.length} danger(s) localisés.`);
    }

    // Add temporary visual radar markers
    const newSignals = [
      ...detectedTreasures.map(d => ({
        id: `sig_t_${d.item.id}_${pingId}`,
        x: d.item.x,
        y: d.item.y,
        color: '#00ffcc',
        size: d.item.size + 4,
        type: 'treasure',
        expiresAt: pingId + 6000,
      })),
      ...detectedHazards.map(d => ({
        id: `sig_h_${d.item.id}_${pingId}`,
        x: d.item.x,
        y: d.item.y,
        color: '#ff3333',
        size: d.item.size + 4,
        type: 'hazard',
        expiresAt: pingId + 6000,
      }))
    ];

    setSonarSignals(prev => [...prev, ...newSignals]);
  }, [treasures, hazards, addLog]);

  // Handle keyboard inputs
  useEffect(() => {
    if (!isWeb || gameState !== STATE_PLAYING) {
      return;
    }

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      activeKeysRef.current[key] = true;

      // Sonar hotkey [p] or [space]
      if (key === 'p' || key === ' ') {
        e.preventDefault();
        triggerSonarPing();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      activeKeysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, triggerSonarPing]);

  // Main high-frequency Physics / Game Loop Tick (25 runs per second)
  useEffect(() => {
    if (gameState !== STATE_PLAYING) {
      return;
    }

    const intervalId = setInterval(() => {
      const sub = subStateRef.current;

      // 1. Process propulsion / key inputs
      let ax = 0;
      let ay = 0;
      const thrust = 0.35 + (upgrades.moteur * 0.1);

      if (isWeb) {
        // Horizontal inputs (ArrowLeft, ArrowRight, A, D, Q, D for AZERTY)
        if (activeKeysRef.current['arrowleft'] || activeKeysRef.current['a'] || activeKeysRef.current['q']) {
          ax = -thrust;
        }
        if (activeKeysRef.current['arrowright'] || activeKeysRef.current['d']) {
          ax = thrust;
        }
        // Vertical inputs (ArrowUp, ArrowDown, W, S, Z for AZERTY)
        if (activeKeysRef.current['arrowup'] || activeKeysRef.current['w'] || activeKeysRef.current['z']) {
          ay = -thrust;
        }
        if (activeKeysRef.current['arrowdown'] || activeKeysRef.current['s']) {
          ay = thrust;
        }
      }

      // Check if engines are firing & consume battery
      const isPropelling = ax !== 0 || ay !== 0;
      if (isPropelling) {
        sub.energy = Math.max(0, sub.energy - 0.25);
        if (sub.energy <= 0) {
          // No battery means sluggish drift/slower movement
          ax *= 0.15;
          ay *= 0.15;
        }
      }

      // 2. Physics / Inertia & Drag
      sub.vx += ax;
      sub.vy += ay;

      // Constant underwater drag
      sub.vx *= 0.92;
      sub.vy *= 0.92;

      // Limit speed
      const speed = Math.sqrt(sub.vx * sub.vx + sub.vy * sub.vy);
      if (speed > sub.maxSpeed) {
        sub.vx = (sub.vx / speed) * sub.maxSpeed;
        sub.vy = (sub.vy / speed) * sub.maxSpeed;
      }

      // Update positions
      sub.x += sub.vx;
      sub.y += sub.vy;

      // Clamp to World Bounds
      if (sub.x < SUB_SIZE) {
        sub.x = SUB_SIZE;
        sub.vx = 0;
      }
      if (sub.x > WORLD_WIDTH - SUB_SIZE) {
        sub.x = WORLD_WIDTH - SUB_SIZE;
        sub.vx = 0;
      }
      if (sub.y < 30) {
        sub.y = 30; // Surface ceiling
        sub.vy = 0;
      }
      if (sub.y > WORLD_HEIGHT - SUB_SIZE) {
        sub.y = WORLD_HEIGHT - SUB_SIZE;
        sub.vy = 0;
      }

      // 3. Vital Resource consumption (Oxygen)
      // Base zone has oxygen refill
      if (sub.y < 150) {
        sub.oxygen = Math.min(sub.maxOxygen, sub.oxygen + 3.0);
        sub.energy = Math.min(sub.maxEnergy, sub.energy + 2.0);
      } else {
        // Deeper uses slightly more oxygen
        const depthFactor = 1 + (sub.y / WORLD_HEIGHT) * 0.5;
        sub.oxygen = Math.max(0, sub.oxygen - 0.14 * depthFactor);
      }

      // Energy recovery when idle near surface
      if (!isPropelling && sub.y < 250) {
        sub.energy = Math.min(sub.maxEnergy, sub.energy + 0.3);
      }

      // 4. Trigger state changes / damages
      if (sub.oxygen <= 0) {
        // Lack of oxygen causes rapid hull decay
        sub.hull = Math.max(0, sub.hull - 2);
        if (Math.random() < 0.15) {
          addLog('🚨 ALERTE : Asphyxie de l\'équipage ! La coque subit des dégâts critiques.');
        }
      }

      // Save/Render updates
      setSubX(sub.x);
      setSubY(sub.y);
      setHull(Math.ceil(sub.hull));
      setOxygen(Math.ceil(sub.oxygen));
      setEnergy(Math.ceil(sub.energy));

      // Check Game Over
      if (sub.hull <= 0) {
        setGameState(STATE_GAMEOVER);
        addLog('💥 NAVIRE PERDU : Le sous-marin a implosé dans les profondeurs.');
      }

      // 5. Particles animation
      setBubbles(prev =>
        prev.map(b => {
          let nextY = b.y - b.speed;
          if (nextY < 0) {
            nextY = WORLD_HEIGHT;
          }
          return { ...b, y: nextY };
        })
      );

      // 6. Handle active Sonar Pings animations
      if (isSonarActive) {
        setSonarPingProgress(prev => {
          if (prev >= 1) {
            setIsSonarActive(false);
            return 0;
          }
          return prev + 0.04;
        });
      }

      // Prune expired sonar signals
      const now = Date.now();
      setSonarSignals(prev => prev.filter(s => s.expiresAt > now));

      // 7. Check collisions (Treasures and Hazards)
      // Collect Treasures
      setTreasures(prev => {
        let changed = false;
        const nextTreasures = prev.map(t => {
          if (t.collected) return t;
          const dx = t.x - sub.x;
          const dy = t.y - sub.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < SUB_SIZE / 2 + t.size) {
            changed = true;
            // Add to cargo
            setCurrentCargo(cargo => {
              if (cargo.length >= 6) {
                addLog('⚠️ SOUTE PLEINE : Impossible de ramasser plus de cargaison ! Déchargez-la à la surface.');
                return cargo;
              }
              addLog(`🎒 COLLECTÉ : ${t.name} (+${t.value} Or estimé)`);
              return [...cargo, t];
            });
            return { ...t, collected: true };
          }
          return t;
        });
        return changed ? nextTreasures : prev;
      });

      // Hit Hazards
      setHazards(prev => {
        let changed = false;
        const nextHazards = prev.filter(h => {
          const dx = h.x - sub.x;
          const dy = h.y - sub.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < SUB_SIZE / 2 + h.size) {
            changed = true;
            // Apply hull damage
            const actualDamage = Math.max(5, Math.ceil(h.damage / (upgrades.coque * 0.9)));
            sub.hull = Math.max(0, sub.hull - actualDamage);
            addLog(`💥 COLLISION : Impact avec un(e) ${h.type === 'mine' ? 'Mîne Marine' : 'Récif'} ! Dégâts : -${actualDamage} Coque`);

            // Mine explodes, rock stays but we bounce back slightly
            sub.vx = -sub.vx * 1.5;
            sub.vy = -sub.vy * 1.5;

            return h.type !== 'mine'; // remove mine upon explosion
          }
          return true;
        });
        return changed ? nextHazards : prev;
      });

    }, 40);

    return () => clearInterval(intervalId);
  }, [gameState, upgrades, treasures, hazards, isSonarActive, addLog]);

  // Touch screen movement triggers (tactile screen controls fallback)
  const applyTactileThrust = useCallback((direction) => {
    const VALID_DIRECTIONS = ['up', 'down', 'left', 'right', 'ping'];
    if (!VALID_DIRECTIONS.includes(direction)) {
      console.warn(`[Sentinel] Direction tactile non autorisée : ${direction}`);
      return;
    }

    if (direction === 'ping') {
      triggerSonarPing();
      return;
    }

    const sub = subStateRef.current;
    const thrust = 1.4 + (upgrades.moteur * 0.3);

    switch (direction) {
      case 'up':
        sub.vy = -thrust;
        break;
      case 'down':
        sub.vy = thrust;
        break;
      case 'left':
        sub.vx = -thrust;
        break;
      case 'right':
        sub.vx = thrust;
        break;
      default:
        break;
    }

    // Spend energy
    setEnergy(prev => {
      const next = Math.max(0, prev - 0.8);
      subStateRef.current.energy = next;
      return next;
    });
  }, [upgrades.moteur, triggerSonarPing]);

  // Dynamic values for viewport camera tracking
  const cameraX = useMemo(() => {
    const desiredCameraX = subX - dimensions.width / 2;
    return Math.max(0, Math.min(WORLD_WIDTH - dimensions.width, desiredCameraX));
  }, [subX, dimensions.width]);

  const cameraY = useMemo(() => {
    const desiredCameraY = subY - (dimensions.height * 0.5) / 2;
    return Math.max(0, Math.min(WORLD_HEIGHT - (dimensions.height * 0.5), desiredCameraY));
  }, [subY, dimensions.height]);

  // Check if objects are visible on the radar/sonar scan or simply nearby
  const isRevealed = useCallback((objX, objY, size) => {
    // 1. Anything above 180 depth is fully lit (surface layer)
    if (objY < 180) {
      return true;
    }

    // 2. Anything close to the submarine light cone (radius of 110 px)
    const dx = objX - subX;
    const dy = objY - subY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 110) {
      return true;
    }

    // 3. Anything within current radar ping ripple radius
    if (isSonarActive) {
      const pingRadius = sonarPingProgress * subStateRef.current.sonarRadius;
      // Allow minor tolerance window around the ripple ring
      if (Math.abs(dist - pingRadius) < 55) {
        return true;
      }
    }

    // 4. Temporarily revealed sonar signals
    return sonarSignals.some(sig => {
      const sigDx = objX - sig.x;
      const sigDy = objY - sig.y;
      return Math.sqrt(sigDx * sigDx + sigDy * sigDy) < size + 5;
    });
  }, [subX, subY, isSonarActive, sonarPingProgress, sonarSignals]);

  // Visual render maps
  const renderedBubbles = useMemo(() => {
    return bubbles
      .filter(b => b.x >= cameraX - 50 && b.x <= cameraX + dimensions.width + 50 && b.y >= cameraY - 50 && b.y <= cameraY + dimensions.height + 50)
      .map((b, i) => (
        <View
          key={`bubble_${i}`}
          style={[
            styles.bubble,
            {
              left: b.x - cameraX,
              top: b.y - cameraY,
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
            },
          ]}
        />
      ));
  }, [bubbles, cameraX, cameraY, dimensions]);

  const renderedTreasures = useMemo(() => {
    return treasures
      .filter(t => !t.collected && t.x >= cameraX - 50 && t.x <= cameraX + dimensions.width + 50 && t.y >= cameraY - 50 && t.y <= cameraY + dimensions.height + 50)
      .map(t => {
        const visible = isRevealed(t.x, t.y, t.size);
        if (!visible) return null;
        return (
          <View
            key={t.id}
            style={[
              styles.itemSpot,
              {
                left: t.x - cameraX - t.size / 2,
                top: t.y - cameraY - t.size / 2,
                width: t.size,
                height: t.size,
                borderRadius: t.size / 2,
                backgroundColor: t.color,
                shadowColor: t.color,
                shadowRadius: 6,
                shadowOpacity: 0.8,
              },
            ]}
          />
        );
      });
  }, [treasures, cameraX, cameraY, dimensions, isRevealed]);

  const renderedHazards = useMemo(() => {
    return hazards
      .filter(h => h.x >= cameraX - 50 && h.x <= cameraX + dimensions.width + 50 && h.y >= cameraY - 50 && h.y <= cameraY + dimensions.height + 50)
      .map(h => {
        const visible = isRevealed(h.x, h.y, h.size);
        if (!visible) return null;
        return (
          <View
            key={h.id}
            style={[
              styles.itemSpot,
              {
                left: h.x - cameraX - h.size / 2,
                top: h.y - cameraY - h.size / 2,
                width: h.size,
                height: h.size,
                borderRadius: h.type === 'mine' ? h.size / 2 : 4,
                backgroundColor: h.color,
                borderWidth: 1,
                borderColor: '#ffffff55',
              },
            ]}
          >
            <Text style={styles.hazardSymbol} accessibilityElementsHidden={true} importantForAccessibility="no">
              {h.type === 'mine' ? '⚙️' : '⛰️'}
            </Text>
          </View>
        );
      });
  }, [hazards, cameraX, cameraY, dimensions, isRevealed]);

  const renderedRadarSignals = useMemo(() => {
    return sonarSignals
      .filter(s => s.x >= cameraX - 50 && s.x <= cameraX + dimensions.width + 50 && s.y >= cameraY - 50 && s.y <= cameraY + dimensions.height + 50)
      .map(s => (
        <View
          key={s.id}
          style={[
            styles.radarSignal,
            {
              left: s.x - cameraX - s.size / 2,
              top: s.y - cameraY - s.size / 2,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              borderColor: s.color,
            },
          ]}
        />
      ));
  }, [sonarSignals, cameraX, cameraY, dimensions]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HUD Header Bar */}
      <View style={styles.hudHeader}>
        <View style={styles.hudInfoRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Menu')}
            accessibilityRole="button"
            accessibilityLabel="Retour au menu principal"
            accessibilityHint="Quitte la simulation de sous-marin">
            <Text style={styles.backButtonText}>◀ MENU</Text>
          </TouchableOpacity>
          <Text style={styles.gameTitle}>📟 MISSION ABYSSES</Text>
          <View style={styles.goldWidget}>
            <Text style={styles.goldText}>🟡 {gold} Or</Text>
          </View>
        </View>

        {/* Level metrics bar */}
        <View style={styles.statGauges}>
          <View style={styles.gaugeContainer}>
            <Text style={styles.gaugeLabel}>🛡️ Coque</Text>
            <View style={styles.gaugeOuter}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${Math.min(100, (hull / maxHull) * 100)}%`,
                    backgroundColor: hull < 35 ? '#e74c3c' : '#2ecc71',
                  },
                ]}
              />
            </View>
            <Text style={styles.gaugeValue}>
              {hull}/{maxHull}
            </Text>
          </View>

          <View style={styles.gaugeContainer}>
            <Text style={styles.gaugeLabel}>🔋 Énergie</Text>
            <View style={styles.gaugeOuter}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${Math.min(100, (energy / maxEnergy) * 100)}%`,
                    backgroundColor: energy < 30 ? '#f39c12' : '#3498db',
                  },
                ]}
              />
            </View>
            <Text style={styles.gaugeValue}>
              {energy}/{maxEnergy}
            </Text>
          </View>

          <View style={styles.gaugeContainer}>
            <Text style={styles.gaugeLabel}>💨 Oxygène</Text>
            <View style={styles.gaugeOuter}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${Math.min(100, (oxygen / maxOxygen) * 100)}%`,
                    backgroundColor: oxygen < 30 ? '#e74c3c' : '#00ffcc',
                  },
                ]}
              />
            </View>
            <Text style={styles.gaugeValue}>
              {oxygen}/{maxOxygen}
            </Text>
          </View>
        </View>
      </View>

      {/* RENDER CURRENT GAME STATE SCREEN VIEWPORT */}
      {gameState === STATE_MENU && (
        <View style={styles.overlayContent}>
          <Text style={styles.introHeading}>⚓ PROTOCOLE JULIA : SIMULATEUR SOUS-MARIN ⚓</Text>
          <Text style={styles.introSub}>Défiez l'écrasante pression des fonds marins.</Text>

          <View style={styles.loreBox}>
            <Text style={styles.loreText}>
              Vous pilotez l'éclaireur abyssal <Text style={{ color: '#00ffcc', fontWeight: 'bold' }}>JuliA-DeepOne</Text>.
              Votre mission est de ramasser les trésors cachés dans l'obscurité totale et d'éviter les mines ou récifs aiguisés.
              Le sonar actif de bord [P] vous révélera périodiquement la topographie environnante.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startNewGame}
            accessibilityRole="button"
            accessibilityLabel="Commencer la plongée sous-marine"
            accessibilityHint="Démarre une nouvelle partie">
            <Text style={styles.primaryButtonText}>🚀 IMMERSION IMMÉDIATE</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === STATE_PLAYING && (
        <View style={styles.gameplayWrapper}>
          {/* Main underwater window */}
          <View style={styles.waterViewport}>
            {/* The floating base visual guide lines */}
            {cameraY < 160 && (
              <View
                style={[
                  styles.baseAnchorMarker,
                  { top: 120 - cameraY, left: 1000 - cameraX - 120 },
                ]}
              >
                <Text style={styles.baseLabelText}>🟢 BASE DE RAVITAILLEMENT (DÉCHARGEZ VOS TRÉSORS ICI)</Text>
              </View>
            )}

            {/* Rendered Bubbles */}
            {renderedBubbles}

            {/* Rendered Treasures */}
            {renderedTreasures}

            {/* Rendered Hazards */}
            {renderedHazards}

            {/* Rendered active temporary sonar ping markers */}
            {renderedRadarSignals}

            {/* Active Sonar Ping Circle Wave Animation */}
            {isSonarActive && (
              <View
                style={[
                  styles.sonarWaveRipple,
                  {
                    left: subX - cameraX - (sonarPingProgress * sonarRadius),
                    top: subY - cameraY - (sonarPingProgress * sonarRadius),
                    width: (sonarPingProgress * sonarRadius) * 2,
                    height: (sonarPingProgress * sonarRadius) * 2,
                    borderRadius: sonarPingProgress * sonarRadius,
                  },
                ]}
              />
            )}

            {/* Submarine light cone effect (purely css styled shadow cone to represent dark sea light) */}
            <View
              style={[
                styles.submarineLightCone,
                {
                  left: subX - cameraX - 110,
                  top: subY - cameraY - 110,
                },
              ]}
            />

            {/* The Submarine itself */}
            <View
              style={[
                styles.submarineScout,
                {
                  left: subX - cameraX - SUB_SIZE / 2,
                  top: subY - cameraY - SUB_SIZE / 2,
                  borderColor: hull < 40 ? '#ff3333' : '#39ff14',
                },
              ]}
            >
              <Text style={styles.submarinePropeller} accessibilityElementsHidden={true} importantForAccessibility="no">
                🛥️
              </Text>
              <View style={styles.subWindow} />
            </View>
          </View>

          {/* Submarine Dashboard controls (essential for touch support & desktop info) */}
          <View style={styles.dashboardDeck}>
            {/* Status info bar */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                ⚓ Profondeur : <Text style={styles.statusHighlight}>{Math.ceil(subY)} m</Text>
              </Text>
              <Text style={styles.statusLabel}>
                🎒 Soute : <Text style={styles.statusHighlight}>{currentCargo.length}/6 objets</Text>
              </Text>
              {subY < 150 ? (
                <TouchableOpacity
                  style={styles.dockButton}
                  onPress={dockAtBase}
                  accessibilityRole="button"
                  accessibilityLabel="Amarrer le sous-marin"
                  accessibilityHint="Ouvre l'interface de la base de ravitaillement">
                  <Text style={styles.dockButtonText}>⚡ AMARRER À LA BASE</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.warningAlertText}>Dégagement requis pour amarrage (&lt; 150m)</Text>
              )}
            </View>

            {/* Layout divided in tactile buttons and live scrolling systems logs */}
            <View style={styles.controlDeckLayout}>
              {/* Tactical console logs */}
              <View style={styles.logsConsole}>
                <Text style={styles.consoleTitle}>📟 RAPPORT DE BORD :</Text>
                <ScrollView style={styles.logsScroll}>
                  {logs.map((log, idx) => (
                    <Text key={idx} style={styles.consoleLogLine}>
                      &gt; {log}
                    </Text>
                  ))}
                </ScrollView>
              </View>

              {/* Tactical Buttons */}
              <View style={styles.dpadMatrix}>
                <View style={styles.dpadRow}>
                  <TouchableOpacity
                    style={styles.dpadBtn}
                    onPress={() => applyTactileThrust('up')}
                    accessibilityRole="button"
                    accessibilityLabel="Propulsion vers le haut"
                    accessibilityHint="Déplace le sous-marin vers le haut">
                    <Text style={styles.dpadText}>▲</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dpadRow}>
                  <TouchableOpacity
                    style={styles.dpadBtn}
                    onPress={() => applyTactileThrust('left')}
                    accessibilityRole="button"
                    accessibilityLabel="Propulsion vers la gauche"
                    accessibilityHint="Déplace le sous-marin vers la gauche">
                    <Text style={styles.dpadText}>◀</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dpadBtn, styles.pingBtn]}
                    onPress={() => applyTactileThrust('ping')}
                    accessibilityRole="button"
                    accessibilityLabel="Activer le radar de bord"
                    accessibilityHint="Envoie un sonar acoustique instantané">
                    <Text style={[styles.dpadText, { color: '#00ffcc', fontSize: 13 }]}>PING [P]</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dpadBtn}
                    onPress={() => applyTactileThrust('right')}
                    accessibilityRole="button"
                    accessibilityLabel="Propulsion vers la droite"
                    accessibilityHint="Déplace le sous-marin vers la droite">
                    <Text style={styles.dpadText}>▶</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dpadRow}>
                  <TouchableOpacity
                    style={styles.dpadBtn}
                    onPress={() => applyTactileThrust('down')}
                    accessibilityRole="button"
                    accessibilityLabel="Propulsion vers le bas"
                    accessibilityHint="Déplace le sous-marin vers le bas">
                    <Text style={styles.dpadText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {gameState === STATE_BASE && (
        <View style={styles.baseScreenWrapper}>
          <Text style={styles.baseTitle}>⚓ BASE DE RAVITAILLEMENT DE SURFACE ⚓</Text>
          <Text style={styles.baseSub}>Rechargez les batteries, réparez la coque et améliorez votre technologie.</Text>

          <View style={styles.deckMetricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.cardVal}>{gold} Or</Text>
              <Text style={styles.cardLabel}>SOLDE DISPONIBLE</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.cardVal}>{currentCargo.length} objets</Text>
              <Text style={styles.cardLabel}>CARGAISON EN SOUTE</Text>
            </View>
          </View>

          {/* Action Hub */}
          <View style={styles.baseActionsList}>
            <TouchableOpacity
              style={styles.baseActionBtn}
              onPress={sellCargo}
              accessibilityRole="button"
              accessibilityLabel="Vendre toute la soute"
              accessibilityHint="Vend les trésors collectés contre de l'or">
              <Text style={styles.actionBtnText}>💰 VENDRE TOUTE LA CARGAISON</Text>
              <Text style={styles.actionBtnDesc}>Déchargez vos {currentCargo.length} trésors d'abysses.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.baseActionBtn}
              onPress={repairHullFull}
              accessibilityRole="button"
              accessibilityLabel="Réparer intégralement le sous-marin"
              accessibilityHint="Répare la coque de bord">
              <Text style={styles.actionBtnText}>🔧 RÉPARER LA COQUE COMPLET (100%)</Text>
              <Text style={styles.actionBtnDesc}>Coût: {HULL_REPAIR_COST} Or. Répare tous les dégâts de pression/mines.</Text>
            </TouchableOpacity>
          </View>

          {/* Upgrade System Panels */}
          <Text style={styles.upgradeSectionTitle}>🛠️ CENTRE DE RECHERCHE & AMÉLIORATION :</Text>
          <ScrollView style={styles.upgradesScrollArea}>
            <View style={styles.upgradeGrid}>

              {/* Upgrade 1: Coque */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upCardTitle}>🛡️ Renfort de Coque (Lvl {upgrades.coque}/4)</Text>
                <Text style={styles.upCardDesc}>Augmente la résistance maximale de la coque (HP).</Text>
                {upgrades.coque < 4 ? (
                  <TouchableOpacity
                    style={styles.upBuyBtn}
                    onPress={() => buyUpgrade('coque')}
                    accessibilityRole="button"
                    accessibilityLabel="Acheter renfort de coque"
                    accessibilityHint="Augmente le blindage">
                    <Text style={styles.upBuyBtnText}>Acheter : {upgrades.coque * 100} Or</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.maxUpgradeLabel}>MAXIMUM ATTEINT</Text>
                )}
              </View>

              {/* Upgrade 2: Batterie */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upCardTitle}>🔋 Super-Accumulateurs (Lvl {upgrades.batterie}/4)</Text>
                <Text style={styles.upCardDesc}>Augmente la réserve d'énergie utile aux propulseurs et au sonar.</Text>
                {upgrades.batterie < 4 ? (
                  <TouchableOpacity
                    style={styles.upBuyBtn}
                    onPress={() => buyUpgrade('batterie')}
                    accessibilityRole="button"
                    accessibilityLabel="Acheter extension de batterie"
                    accessibilityHint="Augmente la réserve énergétique">
                    <Text style={styles.upBuyBtnText}>Acheter : {upgrades.batterie * 100} Or</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.maxUpgradeLabel}>MAXIMUM ATTEINT</Text>
                )}
              </View>

              {/* Upgrade 3: Oxygene */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upCardTitle}>💨 Réserves d'Oxygène (Lvl {upgrades.oxygene}/4)</Text>
                <Text style={styles.upCardDesc}>Permet de rester plus longtemps en profondeur critique.</Text>
                {upgrades.oxygene < 4 ? (
                  <TouchableOpacity
                    style={styles.upBuyBtn}
                    onPress={() => buyUpgrade('oxygene')}
                    accessibilityRole="button"
                    accessibilityLabel="Acheter réserves d'oxygène"
                    accessibilityHint="Augmente l'autonomie en oxygène">
                    <Text style={styles.upBuyBtnText}>Acheter : {upgrades.oxygene * 100} Or</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.maxUpgradeLabel}>MAXIMUM ATTEINT</Text>
                )}
              </View>

              {/* Upgrade 4: Moteur */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upCardTitle}>⚙️ Turboréacteur Abyssal (Lvl {upgrades.moteur}/4)</Text>
                <Text style={styles.upCardDesc}>Propulseurs plus rapides et résistants aux courants.</Text>
                {upgrades.moteur < 4 ? (
                  <TouchableOpacity
                    style={styles.upBuyBtn}
                    onPress={() => buyUpgrade('moteur')}
                    accessibilityRole="button"
                    accessibilityLabel="Acheter propulseurs améliorés"
                    accessibilityHint="Augmente la vitesse maximale">
                    <Text style={styles.upBuyBtnText}>Acheter : {upgrades.moteur * 100} Or</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.maxUpgradeLabel}>MAXIMUM ATTEINT</Text>
                )}
              </View>

              {/* Upgrade 5: Sonar */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upCardTitle}>📡 Sonar à Résonance (Lvl {upgrades.sonar}/4)</Text>
                <Text style={styles.upCardDesc}>Élargit considérablement le rayon de détection du radar actif.</Text>
                {upgrades.sonar < 4 ? (
                  <TouchableOpacity
                    style={styles.upBuyBtn}
                    onPress={() => buyUpgrade('sonar')}
                    accessibilityRole="button"
                    accessibilityLabel="Acheter sonar amélioré"
                    accessibilityHint="Augmente la portée du ping">
                    <Text style={styles.upBuyBtnText}>Acheter : {upgrades.sonar * 100} Or</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.maxUpgradeLabel}>MAXIMUM ATTEINT</Text>
                )}
              </View>

            </View>
          </ScrollView>

          {/* Leave Button */}
          <TouchableOpacity
            style={styles.leaveBaseBtn}
            onPress={leaveBase}
            accessibilityRole="button"
            accessibilityLabel="Retourner plonger"
            accessibilityHint="Quitte la base de ravitaillement pour retourner dans l'eau">
            <Text style={styles.leaveBaseBtnText}>🌊 REPRENDRE LA PLONGÉE</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === STATE_GAMEOVER && (
        <View style={styles.overlayContent}>
          <Text style={[styles.introHeading, { color: '#e74c3c' }]}>☠️ RECONSTITUTION DU NAUFRAGE ☠️</Text>
          <Text style={styles.loreText}>
            Votre coque a cédé sous l'effet combiné de la pression des abysses et des obstacles.
            La mission scientifique a échoué.
          </Text>

          <View style={styles.loreBox}>
            <Text style={styles.scoreSummaryTitle}>Rapport d'activité :</Text>
            <Text style={styles.scoreLine}>- Profondeur max atteinte : {Math.ceil(subY)} m</Text>
            <Text style={styles.scoreLine}>- Fortune accumulée : {gold} Or</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startNewGame}
            accessibilityRole="button"
            accessibilityLabel="Recommencer une partie"
            accessibilityHint="Relance une nouvelle partie de simulation sous-marine">
            <Text style={styles.primaryButtonText}>🔄 TENTATIVE DE SAUVETAGE</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a13',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  hudHeader: {
    backgroundColor: '#0c1326',
    borderBottomWidth: 2,
    borderColor: '#00ffcc55',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  hudInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  backButtonText: {
    color: '#00ffcc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00ffcc',
    letterSpacing: 1.5,
  },
  goldWidget: {
    backgroundColor: 'rgba(241, 196, 15, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1c40f55',
  },
  goldText: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statGauges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  gaugeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gaugeLabel: {
    color: '#a4b0be',
    fontSize: 10,
    marginBottom: 3,
  },
  gaugeOuter: {
    width: '100%',
    height: 8,
    backgroundColor: '#1b263b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeValue: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
  },
  introHeading: {
    fontSize: 22,
    color: '#00ffcc',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  introSub: {
    fontSize: 13,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 20,
  },
  loreBox: {
    backgroundColor: 'rgba(12, 19, 38, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ffcc33',
    padding: 15,
    width: '100%',
    marginBottom: 25,
  },
  loreText: {
    color: '#ecf0f1',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#00ffcc',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: '#00ffcc',
    shadowRadius: 10,
    shadowOpacity: 0.5,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  primaryButtonText: {
    color: '#070a13',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  gameplayWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  waterViewport: {
    flex: 1.4,
    backgroundColor: '#030508',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 2,
    borderColor: '#00ffcc33',
  },
  baseAnchorMarker: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(46, 204, 113, 0.25)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2ecc71',
    alignItems: 'center',
    width: 240,
  },
  baseLabelText: {
    color: '#2ecc71',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  itemSpot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarSignal: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  hazardSymbol: {
    fontSize: 11,
    color: '#ffffff',
  },
  sonarWaveRipple: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00ffcc',
    backgroundColor: 'transparent',
    opacity: 0.65,
  },
  submarineLightCone: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  submarineScout: {
    position: 'absolute',
    width: SUB_SIZE,
    height: SUB_SIZE,
    borderRadius: SUB_SIZE / 2,
    backgroundColor: '#0c1326',
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submarinePropeller: {
    fontSize: 18,
  },
  subWindow: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ffcc',
    top: 6,
    right: 6,
  },
  dashboardDeck: {
    flex: 1,
    backgroundColor: '#070c18',
    padding: 10,
    borderTopWidth: 2,
    borderColor: '#00ffcc44',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#0c1428',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusLabel: {
    color: '#95a5a6',
    fontSize: 12,
    fontWeight: '600',
  },
  statusHighlight: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dockButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  dockButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  warningAlertText: {
    color: '#e74c3c',
    fontSize: 10,
    fontStyle: 'italic',
  },
  controlDeckLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  logsConsole: {
    flex: 1.5,
    backgroundColor: '#03050a',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#00ffcc22',
    padding: 6,
  },
  consoleTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 4,
  },
  logsScroll: {
    flex: 1,
  },
  consoleLogLine: {
    color: '#00ffcc',
    fontSize: 9.5,
    fontFamily: 'monospace',
    marginBottom: 3,
    lineHeight: 12,
  },
  dpadMatrix: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 160,
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dpadBtn: {
    backgroundColor: '#11192e',
    width: 44,
    height: 40,
    margin: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffcc55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingBtn: {
    width: 60,
  },
  dpadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  baseScreenWrapper: {
    flex: 1,
    backgroundColor: '#0c1326',
    padding: 15,
  },
  baseTitle: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  baseSub: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 15,
  },
  deckMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#11192e',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ecc7144',
    alignItems: 'center',
  },
  cardVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: 9,
    color: '#7f8c8d',
    marginTop: 3,
  },
  baseActionsList: {
    gap: 8,
    marginBottom: 15,
  },
  baseActionBtn: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtnText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionBtnDesc: {
    color: '#95a5a6',
    fontSize: 10.5,
    marginTop: 2,
  },
  upgradeSectionTitle: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  upgradesScrollArea: {
    flex: 1,
    marginBottom: 10,
  },
  upgradeGrid: {
    gap: 8,
  },
  upgradeCard: {
    backgroundColor: '#11192e',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 200, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upCardTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  upCardDesc: {
    fontSize: 10,
    color: '#95a5a6',
    flex: 1.2,
    paddingRight: 10,
  },
  upBuyBtn: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upBuyBtnText: {
    color: '#070a13',
    fontSize: 10,
    fontWeight: 'bold',
  },
  maxUpgradeLabel: {
    color: '#7f8c8d',
    fontSize: 9,
    fontWeight: 'bold',
  },
  leaveBaseBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveBaseBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  scoreSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  scoreLine: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default SubmarineGameScreen;