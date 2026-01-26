import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText('Proof of Personhood')).toBeTruthy();
  });

  it('renders subtitle', () => {
    render(<App />);
    expect(
      screen.getByText('Mobile App Skeleton - Auth/Confirmation')
    ).toBeTruthy();
  });
});
