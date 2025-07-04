import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { promises as fs } from 'fs'; // Using fs.promises for async file reading in Node.js environment for RN
                                     // This will need to be replaced by react-native-fs or fetched for actual device

// Placeholder for file content until actual file reading is implemented for RN
const fallBackLoremIpsum = `
A long time ago in a galaxy far, far away....

It is a period of civil war. Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.

During the battle, Rebel spies managed to steal secret plans to the Empire's ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.

Pursued by the Empire's sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy....

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

const AboutScreen = () => {
  const [text, setText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const textHeight = useRef(0);
  const scrollViewHeight = Dimensions.get('window').height;

  useEffect(() => {
    // In a real React Native app, you'd use react-native-fs or fetch from bundled assets.
    // For now, let's simulate loading or use a fallback.
    // Simulating async load:
    setTimeout(() => {
      setText(fallBackLoremIpsum);
    }, 100);
  }, []);

  useEffect(() => {
    if (text && textHeight.current > 0) {
      scrollY.setValue(scrollViewHeight); // Start text from bottom
      Animated.timing(scrollY, {
        toValue: -textHeight.current, // Scroll to the very top (text completely disappears above)
        duration: 40000, // Adjust duration for speed
        easing: Easing.linear,
        useNativeDriver: true, // Use native driver for performance
      }).start();
    }
  }, [text, scrollY, scrollViewHeight]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable manual scrolling for the animation
        onContentSizeChange={(contentWidth, contentHeight) => {
          textHeight.current = contentHeight;
        }}
      >
        <Animated.View style={{ transform: [{ translateY: scrollY }] }}>
          <Text
            style={styles.starWarsText}
            onLayout={(event) => {
              // This onLayout on Text might be redundant if ScrollView's contentSizeChange is reliable
              // but can be a fallback or used for precise calculations if needed.
              // const { height } = event.nativeEvent.layout;
              // textHeight.current = height;
            }}
          >
            {text}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center', // Center the ScrollView content if it's smaller
    alignItems: 'center', // Center horizontally
  },
  scrollView: {
    width: '100%',
    transform: [{ perspective: 300 }, { rotateX: '25deg' }], // Star Wars perspective effect
  },
  starWarsText: {
    color: '#FFD700', // Gold color like Star Wars text
    fontSize: 40, // Larger font size
    lineHeight: 60, // Adjust line height for spacing
    textAlign: 'justify',
    paddingHorizontal: 40, // Padding to keep text from screen edges
    // fontWeight: 'bold', // Optional: if you want bolder text
  },
});

export default AboutScreen;
