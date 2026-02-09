/**
 * Wallet service for secure key storage and management
 * Uses react-native-keychain for secure storage
 */

import * as Keychain from 'react-native-keychain';
import { ethers } from 'ethers';
import type {
  WalletInfo,
  CreateWalletParams,
  ImportWalletParams,
} from '../types';

const WALLET_SERVICE = 'proof-of-personhood-wallet';
const PRIVATE_KEY_KEY = 'private-key';
const HAS_BACKUP_KEY = 'has-backup';

/**
 * Wallet service for managing Ethereum wallets securely
 */
export class WalletService {
  /**
   * Check if a wallet exists
   */
  static async hasWallet(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: WALLET_SERVICE,
      });
      return credentials !== false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet information
   */
  static async getWalletInfo(): Promise<WalletInfo | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: WALLET_SERVICE,
      });
      if (!credentials) {
        return null;
      }

      const privateKey = credentials.password;
      const wallet = new ethers.Wallet(privateKey);

      const hasBackupData = await Keychain.getGenericPassword({
        service: `${WALLET_SERVICE}-backup`,
      });
      const hasBackup = hasBackupData !== false;

      return {
        address: wallet.address as `0x${string}`,
        hasBackup,
      };
    } catch (error) {
      throw new Error(
        `Failed to get wallet info: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Create a new wallet with the given password
   */
  static async createWallet(params: CreateWalletParams): Promise<WalletInfo> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password } = params;

      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;

      await Keychain.setGenericPassword(
        `${WALLET_SERVICE}-${PRIVATE_KEY_KEY}`,
        privateKey,
        { service: WALLET_SERVICE }
      );

      return {
        address: wallet.address as `0x${string}`,
        hasBackup: false,
      };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Import a wallet from private key with the given password
   */
  static async importWallet(params: ImportWalletParams): Promise<WalletInfo> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { privateKey, password: _password } = params;

      const wallet = new ethers.Wallet(privateKey);

      await Keychain.setGenericPassword(
        `${WALLET_SERVICE}-${PRIVATE_KEY_KEY}`,
        privateKey,
        { service: WALLET_SERVICE }
      );

      return {
        address: wallet.address as `0x${string}`,
        hasBackup: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to import wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get the wallet private key for signing
   */
  static async getPrivateKey(): Promise<string> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: WALLET_SERVICE,
      });
      if (!credentials) {
        throw new Error('Wallet not found');
      }

      return credentials.password;
    } catch (error) {
      throw new Error(
        `Failed to get private key: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Sign a message with the wallet's private key
   */
  static async signMessage(message: string): Promise<string> {
    try {
      const privateKey = await this.getPrivateKey();
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error(
        `Failed to sign message: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Sign a hash with the wallet's private key
   */
  static async signHash(hash: string): Promise<string> {
    try {
      const privateKey = await this.getPrivateKey();
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(ethers.getBytes(hash));
      return signature;
    } catch (error) {
      throw new Error(
        `Failed to sign hash: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Mark wallet as backed up
   */
  static async markBackupComplete(): Promise<void> {
    try {
      await Keychain.setGenericPassword(HAS_BACKUP_KEY, 'true', {
        service: `${WALLET_SERVICE}-backup`,
      });
    } catch (error) {
      throw new Error(
        `Failed to mark backup complete: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Clear all wallet data
   */
  static async clearWallet(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: WALLET_SERVICE });
      await Keychain.resetGenericPassword({
        service: `${WALLET_SERVICE}-backup`,
      });
    } catch (error) {
      throw new Error(
        `Failed to clear wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
