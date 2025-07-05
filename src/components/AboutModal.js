// Fichier : src/components/AboutModal.js
// Version corrigée et nettoyée

import React from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Le contenu est directement dans le fichier pour plus de simplicité.
const aboutTextContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const AboutModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Permet de fermer le modal avec le bouton "retour" d'Android
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalTextTitle}>À Propos</Text>
            <Text style={styles.modalText}>{aboutTextContent}</Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Fermer</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25, // Un peu moins de padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  scrollView: {
    width: '100%',
  },
  modalTextTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24, // Améliore la lisibilité
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 120, // Donne une largeur minimale au bouton
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AboutModal;