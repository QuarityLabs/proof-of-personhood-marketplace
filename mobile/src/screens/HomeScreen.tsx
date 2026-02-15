/**
 * Home screen
 * Main navigation hub with buttons to wallet, portfolio, and scan
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Portfolio: undefined;
  SignRequest: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proof of Personhood</Text>
      <Text style={styles.subtitle}>
        Secure Signer for Personhood Marketplace
      </Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.cardIcon}>👛</Text>
          <Text style={styles.cardTitle}>Wallet</Text>
          <Text style={styles.cardDescription}>
            Manage your Ethereum wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Portfolio')}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardTitle}>Portfolio</Text>
          <Text style={styles.cardDescription}>View active rentals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SignRequest')}
        >
          <Text style={styles.cardIcon}>📷</Text>
          <Text style={styles.cardTitle}>Scan QR</Text>
          <Text style={styles.cardDescription}>Scan sign request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Protocol v2.0 - Off-chain first</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
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
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
