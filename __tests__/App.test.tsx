/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import BceBanknoteGameScreen from '../src/screens/BceBanknoteGameScreen';

it('renders correctly', () => {
  renderer.create(<App />);
});

it('renders BceBanknoteGameScreen correctly', () => {
  const dummyNavigation = {
    navigate: () => {},
    goBack: () => {},
  };
  const rendered = renderer.create(<BceBanknoteGameScreen navigation={dummyNavigation} />);
  expect(rendered).toBeTruthy();
});
