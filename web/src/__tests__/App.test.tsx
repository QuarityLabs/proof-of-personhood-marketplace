import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders main application window', () => {
    render(<App />);
    expect(screen.getByText('ProofOfPersonhood.exe')).toBeInTheDocument();
  });

  it('renders wallet connection component', () => {
    render(<App />);
    expect(screen.getByText('wallet.exe')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows info message when wallet not connected', () => {
    render(<App />);
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Connect wallet to create offers and rent personhood.')).toBeInTheDocument();
  });

  it('renders offer list section', () => {
    render(<App />);
    expect(screen.getByText('offers.exe')).toBeInTheDocument();
    expect(screen.getByText('No offers available.')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('Browse Offers')).toBeInTheDocument();
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
  });

  it('renders taskbar with start button', () => {
    render(<App />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
