import 'react-native';
import React from 'react';
import EcosystemGameScreen from '../src/screens/EcosystemGameScreen';
import renderer from 'react-test-renderer';

describe('EcosystemGameScreen', () => {
  it('se monte correctement et s\'initialise sans erreur', () => {
    const dummyNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const rendered = renderer.create(<EcosystemGameScreen navigation={dummyNavigation} />);
    expect(rendered).toBeTruthy();
  });
});
