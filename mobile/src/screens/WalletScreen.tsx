/**
 * Wallet screen
 * Display wallet info, create/import wallet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  WalletInfo,
  CreateWalletParams,
  ImportWalletParams,
} from '../types';
import { WalletService } from '../services';

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Portfolio: undefined;
};

type WalletScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Wallet'
>;

interface CreateWalletForm {
  password: string;
  confirmPassword: string;
}

interface ImportWalletForm {
  privateKey: string;
  password: string;
}

export function WalletScreen() {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [createForm, setCreateForm] = useState<CreateWalletForm>({
    password: '',
    confirmPassword: '',
  });
  const [importForm, setImportForm] = useState<ImportWalletForm>({
    privateKey: '',
    password: '',
  });

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const hasWallet = await WalletService.hasWallet();
      if (hasWallet) {
        const info = await WalletService.getWalletInfo();
        setWalletInfo(info);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to load wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (createForm.password !== createForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (createForm.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      const params: CreateWalletParams = {
        password: createForm.password,
      };
      const info = await WalletService.createWallet(params);
      setWalletInfo(info);
      setShowCreate(false);
      setCreateForm({ password: '', confirmPassword: '' });
      Alert.alert('Success', 'Wallet created successfully!');
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to create wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (
      !importForm.privateKey.startsWith('0x') ||
      importForm.privateKey.length !== 66
    ) {
      Alert.alert('Error', 'Invalid private key format');
      return;
    }

    if (importForm.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      const params: ImportWalletParams = {
        privateKey: importForm.privateKey as `0x${string}`,
        password: importForm.password,
      };
      const info = await WalletService.importWallet(params);
      setWalletInfo(info);
      setShowImport(false);
      setImportForm({ privateKey: '', password: '' });
      Alert.alert('Success', 'Wallet imported successfully!');
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to import wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearWallet = async () => {
    Alert.alert(
      'Clear Wallet',
      'Are you sure you want to clear the wallet? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletService.clearWallet();
              setWalletInfo(null);
              Alert.alert('Success', 'Wallet cleared successfully!');
            } catch (error) {
              Alert.alert(
                'Error',
                `Failed to clear wallet: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Wallet</Text>

        {walletInfo ? (
          <>
            <View style={styles.walletCard}>
              <Text style={styles.cardTitle}>Your Wallet</Text>
              <Text style={styles.address}>
                {walletInfo.address.slice(0, 10)}...
                {walletInfo.address.slice(-8)}
              </Text>

              {walletInfo.hasBackup ? (
                <View style={styles.backupStatusRow}>
                  <Text style={styles.backupStatusSuccess}>
                    ✓ Backup Complete
                  </Text>
                </View>
              ) : (
                <View style={styles.backupStatusRow}>
                  <Text style={styles.backupStatusWarning}>⚠ No Backup</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Portfolio')}
              >
                <Text style={styles.actionButtonText}>View Portfolio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={handleClearWallet}
              >
                <Text style={[styles.actionButtonText, styles.clearButtonText]}>
                  Clear Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No Wallet Found</Text>
              <Text style={styles.cardText}>
                Create a new wallet or import an existing one to get started.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowCreate(true)}
              >
                <Text style={styles.primaryButtonText}>Create New Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowImport(true)}
              >
                <Text style={styles.secondaryButtonText}>Import Wallet</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showCreate && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Wallet</Text>

            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              secureTextEntry
              value={createForm.password}
              onChangeText={(text) =>
                setCreateForm({ ...createForm, password: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={createForm.confirmPassword}
              onChangeText={(text) =>
                setCreateForm({ ...createForm, confirmPassword: text })
              }
            />

            <View style={styles.formButtonContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setShowCreate(false);
                  setCreateForm({ password: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateWallet}
              >
                <Text style={styles.primaryButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showImport && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Import Wallet</Text>

            <TextInput
              style={styles.input}
              placeholder="Private Key (0x...)"
              value={importForm.privateKey}
              onChangeText={(text) =>
                setImportForm({ ...importForm, privateKey: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              secureTextEntry
              value={importForm.password}
              onChangeText={(text) =>
                setImportForm({ ...importForm, password: text })
              }
            />

            <View style={styles.formButtonContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setShowImport(false);
                  setImportForm({ privateKey: '', password: '' });
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleImportWallet}
              >
                <Text style={styles.primaryButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#6b7280',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  address: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  backupStatusRow: {
    marginBottom: 20,
  },
  backupStatusSuccess: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  backupStatusWarning: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#000000',
  },
  formButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
