/**
 * Portfolio screen
 * View active rentals as lender
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PortfolioItem } from '@/types';
import { OfferStatus } from '@/types';
import { WalletService } from '@/services';

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Portfolio: undefined;
};

type PortfolioScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Portfolio'
>;

export function PortfolioScreen() {
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const hasWallet = await WalletService.hasWallet();
      if (!hasWallet) {
        Alert.alert('No Wallet', 'Please create a wallet first');
        navigation.navigate('Wallet');
        return;
      }

      const walletInfo = await WalletService.getWalletInfo();
      if (!walletInfo) {
        return;
      }

      const mockOffers: PortfolioItem[] = [
        {
          offer: {
            offerId: 1n,
            submitter: walletInfo.address,
            renter: ('0x' + '1'.repeat(40)) as `0x${string}`,
            usageContext: 'Polkadot Forum Voting',
            weeklyPayment: BigInt('10000000000000000'),
            deposit: BigInt('100000000000000000'),
            lockedPayment: BigInt('100000000000000000'),
            createdAt: BigInt(Math.floor(Date.now() / 1000) - 604800),
            rentedAt: BigInt(Math.floor(Date.now() / 1000) - 604800),
            expiresAt: BigInt(Math.floor(Date.now() / 1000) + 604800),
            status: OfferStatus.ACTIVE,
            totalRentals: 5n,
            lenderOffences: 0,
            renterInvalidDisputes: 0,
            activeDisputeId: 0n,
          },
          earnings: BigInt('500000000000000000'),
          pendingRequests: 2,
          offences: 0,
        },
        {
          offer: {
            offerId: 2n,
            submitter: walletInfo.address,
            renter: ('0x' + '2'.repeat(40)) as `0x${string}`,
            usageContext: 'Kusama Governance',
            weeklyPayment: BigInt('20000000000000000'),
            deposit: BigInt('200000000000000000'),
            lockedPayment: BigInt('200000000000000000'),
            createdAt: BigInt(Math.floor(Date.now() / 1000) - 1209600),
            rentedAt: BigInt(Math.floor(Date.now() / 1000) - 1209600),
            expiresAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
            status: OfferStatus.EXPIRED,
            totalRentals: 10n,
            lenderOffences: 1,
            renterInvalidDisputes: 0,
            activeDisputeId: 0n,
          },
          earnings: BigInt('1000000000000000000'),
          pendingRequests: 0,
          offences: 1,
        },
      ];

      setPortfolioItems(mockOffers);
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to load portfolio: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPortfolio();
  };

  const getStatusColor = (status: OfferStatus): string => {
    switch (status) {
      case OfferStatus.ACTIVE:
        return '#10b981';
      case OfferStatus.EXPIRED:
        return '#f59e0b';
      case OfferStatus.PENDING:
        return '#3b82f6';
      case OfferStatus.REMOVED:
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: OfferStatus): string => {
    switch (status) {
      case OfferStatus.ACTIVE:
        return 'Active';
      case OfferStatus.EXPIRED:
        return 'Expired';
      case OfferStatus.PENDING:
        return 'Pending';
      case OfferStatus.REMOVED:
        return 'Removed';
      default:
        return 'Unknown';
    }
  };

  const formatEarnings = (earnings: bigint): string => {
    const weiPerEth = 1_000_000_000_000_000_000n;
    const whole = earnings / weiPerEth;
    const frac = ((earnings % weiPerEth) * 10_000n) / weiPerEth;
    return `${whole}.${frac.toString().padStart(4, '0')} ETH`;
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
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {portfolioItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Active Rentals</Text>
          <Text style={styles.emptyText}>
            Your portfolio is empty. Start by creating offers on the web
            platform.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {portfolioItems.map((item) => (
            <View key={item.offer.offerId.toString()} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.statusBadge}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.offer.status) },
                    ]}
                  >
                    {getStatusText(item.offer.status)}
                  </Text>
                </View>
                <Text style={styles.offerId}>
                  #{item.offer.offerId.toString()}
                </Text>
              </View>

              <Text style={styles.context}>{item.offer.usageContext}</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Earnings</Text>
                  <Text style={styles.statValue}>
                    {formatEarnings(item.earnings)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Rentals</Text>
                  <Text style={styles.statValue}>
                    {item.offer.totalRentals.toString()}
                  </Text>
                </View>
              </View>

              <View style={styles.subStatsRow}>
                <View style={styles.subStat}>
                  <Text style={styles.subStatLabel}>Pending</Text>
                  <Text style={styles.subStatValue}>
                    {item.pendingRequests}
                  </Text>
                </View>
                <View style={styles.subStat}>
                  <Text style={styles.subStatLabel}>Offences</Text>
                  <Text
                    style={[
                      styles.subStatValue,
                      item.offences > 0 && styles.subStatValueWarning,
                    ]}
                  >
                    {item.offences}
                  </Text>
                </View>
              </View>

              {item.offer.expiresAt > 0n && (
                <View style={styles.expiryRow}>
                  <Text style={styles.expiryLabel}>Expires:</Text>
                  <Text style={styles.expiryValue}>
                    {new Date(
                      Number(item.offer.expiresAt) * 1000
                    ).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offerId: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  context: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  subStatsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  subStat: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  subStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  subStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  subStatValueWarning: {
    color: '#ef4444',
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  expiryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
