import React,_useEffect,_useState_from_'react';
import_{_Modal,_Text,_View,_StyleSheet,_TouchableOpacity,_ScrollView,_ActivityIndicator_}_from_'react-native';
// Since we are outside of the 'src' directory for assets, adjust the path.
// React Native's bundler will handle the 'require' for text files if configured,
// otherwise, we might need to use fs or include the text directly.
// For simplicity with bundler, let's assume a direct import or fetch is needed if 'require' doesn't work.
// However, 'react-native-fs' would be a more robust way for runtime file reading.
// Given the constraints, let's try a simpler approach or simulate it.

// Placeholder for the text content. In a real scenario, you might fetch this.
// For now, to ensure it works without complex file system access setup in React Native:
const aboutTextContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const AboutModal = ({ visible, onClose }) => {
  // const [text, setText] = useState('');
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // This is a common pattern for fetching local data, but .txt might not be directly requirable.
  //   // If direct require is not supported for .txt files by default in your Metro bundler config,
  //   // this would need a different approach (e.g., bundling text as JS module, or using react-native-fs).
  //   // For now, let's use the hardcoded text.
  //   // try {
  //   //   const fileContent = require('../../assets/text/about.txt'); // Path relative to this file
  //   //   setText(fileContent);
  //   // } catch (error) {
  //   //   console.error("Failed to load about text:", error);
  //   //   setText("Failed to load content.");
  //   // }
  //   // setLoading(false);
  //   // Simulating loading for now:
  //   setText(aboutTextContent);
  //   setLoading(false);
  // }, []);

  // if (loading) {
  //   return (
  //     <Modal
  //       animationType="slide"
  //       transparent={true}
  //       visible={visible}
  //       onRequestClose={onClose}
  //     >
  //       <View style={styles.centeredView}>
  //         <View style={styles.modalView}>
  //           <ActivityIndicator size="large" />
  //         </View>
  //       </View>
  //     </Modal>
  //   );
  // }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalTextTitle}>À Propos</Text>
            <Text style={styles.modalText}>{aboutTextContent}</Text>
          </ScrollView>
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: '#2196F3' }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
    marginBottom: 15,
  },
  modalTextTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AboutModal;
