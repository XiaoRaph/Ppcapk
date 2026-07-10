// Fichier : src/components/AboutModal.js
// Version mise à jour avec le manifeste SLOP LOCAL

import React from 'react';
import {
  Modal,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const AboutModal = ({visible, onClose}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.modalTextTitle}>🥬 SLOP LOCAL</Text>
            <Text style={styles.tagline}>
              Reclaiming “slop” as a badge of honor for indie AI builders.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.paragraph}>
              A few weeks ago I saw a farmers market t-shirt that said “eat fresh shop local” but the H in SHOP was replaced with a carrot emoji. So it read “SLOP LOCAL.”
            </Text>
            <Text style={styles.paragraph}>
              I laughed, took a photo, and then couldn’t stop thinking about it.
            </Text>
            <Text style={styles.paragraph}>
              Because here’s the thing — “slop” has become the go-to dismissal for anything built with AI. Doesn’t matter if it’s genuinely useful, if a real person spent real time on it, or if people are actually using it. If AI touched it, someone will call it slop.
            </Text>
            <Text style={styles.paragraphBold}>
              And I think that’s wrong.
            </Text>
            <Text style={styles.paragraph}>
              I’ve been building tools with Claude and Codex for the past year. Some of them are rough. Some of them are weird. But I spent time on them and they solved a problem for me or provided entertainment.
            </Text>
            <Text style={styles.paragraph}>
              So I built <Text style={styles.highlightText}>SLOP LOCAL</Text> — a community directory for free, AI-built apps that are actually good. Think of it like a digital farmers market.
            </Text>

            {/* Sections */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 L'idée est simple :</Text>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Les créateurs soumettent leurs outils (toujours gratuit)
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  La communauté vote pour ce qui est vraiment utile
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Le meilleur remonte, les déchets non
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚖️ Les critères sont stricts :</Text>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Gratuit à l'utilisation</Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Résout un vrai problème ou est fun</Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Le créateur y a passé du temps — pas un projet bâclé en 5 min</Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Pas de fermes SEO, pas d'usines à contenu, pas d'arnaques</Text>
              </View>
            </View>

            <View style={styles.cardHighlighted}>
              <Text style={styles.cardTitleHighlighted}>🤖 Agent-Native dès le départ</Text>
              <Text style={styles.cardParagraphHighlighted}>
                Connectez-le à Claude Desktop via MCP et dites à votre agent : <Text style={styles.codeText}>"soumets mon dernier projet à SLOP LOCAL"</Text>. Il lit votre repo, écrit l'accroche, choisit la catégorie et publie. Sans remplir de formulaire.
              </Text>
              <Text style={styles.cardParagraphHighlighted}>
                Votre agent peut aussi parcourir les tendances, identifier les opportunités du marché (ce pour quoi la communauté vote mais que personne n'a encore construit), et vérifier quels outils IA produisent les meilleures soumissions.
              </Text>
            </View>

            <Text style={styles.paragraph}>
              J'ai lancé le site avec trois de mes propres projets. Oui, j'ai construit SLOP LOCAL avec de l'IA. Oui, mon agent a soumis mes propres projets. Oui, c'était extrêmement satisfaisant.
            </Text>
            <Text style={styles.paragraph}>
              La différence (diff) était de 4 000 lignes. J'ai approuvé quand même.
            </Text>

            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>Visitez le site :</Text>
              <Text style={styles.linkText}>👉 sloplocal.com</Text>
            </View>

            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>📚 Nouveau dans le build IA ?</Text>
              <Text style={styles.startDesc}>
                Il y a une page <Text style={styles.codeText}>/start</Text> pour vous guider de "J'utilise ChatGPT pour de petites tâches" jusqu'aux flux de travail agentiques complets. Gratuit, sans inscription.
              </Text>
              <Text style={styles.linkText}>👉 sloplocal.com/start</Text>
            </View>

            <Text style={styles.footerQuote}>
              "Built local. Shipped fast. Not sorry."
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.buttonClose}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer l'à propos"
            accessibilityHint="Ferme ce panneau d'information"
          >
            <Text style={styles.buttonCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Slightly darker background for better overlay focus
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E24', // Rich dark slate background
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#39ff14', // Neon green border matching the retro look
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    width: '90%',
    maxWidth: 550, // Nice tablet/desktop constraint
    maxHeight: '85%',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTextTitle: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700', // Neon Gold/yellow
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#39ff14', // Neon Green
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#E0E0E6',
    marginBottom: 12,
  },
  paragraphBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  highlightText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF', // Blue accent
  },
  cardHighlighted: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#39ff14', // Neon Green accent
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  cardTitleHighlighted: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#39ff14',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#39ff14',
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#E0E0E6',
  },
  cardParagraphHighlighted: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E0E0E6',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#FFD700',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  linkContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 13,
    color: '#A0A0AB',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  startContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  startTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  startDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#C0C0C8',
    marginBottom: 8,
  },
  footerQuote: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD700',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonClose: {
    backgroundColor: '#39ff14',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 16,
    shadowColor: '#39ff14',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonCloseText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default AboutModal;
