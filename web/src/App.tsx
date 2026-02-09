import { useState, useEffect } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { 
  styleReset, 
  Window, 
  WindowHeader, 
  WindowContent, 
  Button,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  ScrollView,
} from 'react95';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

import { config } from './services/wagmi';
import { WalletConnect, OfferList, CreateOfferForm, RentalDashboard } from './components';
import { useOffers, useRentals, useDisputes, useAllOffers } from './hooks';
import type { Offer, Dispute } from './types';

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
  ${styleReset}
`;

const queryClient = new QueryClient();

const MarketplaceApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [myRentals, setMyRentals] = useState<Offer[]>([]);
  const [myDisputes, setMyDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { createOffer, isCreating } = useOffers();
  const { acceptOffer, isAccepting, renewRental, isRenewing, returnToMarket, isReturning, claimPayout, isClaiming, cancelRent, isCancelling } = useRentals();
  const { submitDispute, isSubmitting } = useDisputes();
  const { offers: allOffersFromHook, refetch: refetchOffers } = useAllOffers();

  // Load offers from contract
  useEffect(() => {
    if (allOffersFromHook && allOffersFromHook.length > 0) {
      setOffers(allOffersFromHook);
    }
  }, [allOffersFromHook]);

  // Load user's offers and rentals when connected
  useEffect(() => {
    if (!isConnected || !address) {
      setMyOffers([]);
      setMyRentals([]);
      setMyDisputes([]);
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Filter offers created by user
        const userOffers = offers.filter(o => 
          o.submitter.toLowerCase() === address.toLowerCase()
        );
        setMyOffers(userOffers);

        // Filter offers rented by user
        const userRentals = offers.filter(o => 
          o.renter.toLowerCase() === address.toLowerCase()
        );
        setMyRentals(userRentals);
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isConnected, address, offers]);

  const handleCreateOffer = async (context: string, weeklyPayment: bigint, deposit: bigint) => {
    try {
      setError(null);
      await createOffer(context, weeklyPayment, deposit);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
    }
  };

  const handleRent = async (offerId: bigint) => {
    try {
      setError(null);
      const offer = offers.find(o => o.offerId === offerId);
      if (!offer) throw new Error('Offer not found');
      
      await acceptOffer(offerId, offer.deposit, offer.weeklyPayment);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rent offer');
    }
  };

  const handleRenew = async (offerId: bigint) => {
    try {
      setError(null);
      const rental = myRentals.find(r => r.offerId === offerId);
      if (!rental) throw new Error('Rental not found');
      
      await renewRental(offerId, rental.weeklyPayment);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew rental');
    }
  };

  const handleReturn = async (offerId: bigint) => {
    try {
      setError(null);
      await returnToMarket(offerId);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return to market');
    }
  };

  const handleClaim = async (offerId: bigint) => {
    try {
      setError(null);
      await claimPayout(offerId);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim payout');
    }
  };

  const handleCancel = async (offerId: bigint) => {
    try {
      setError(null);
      await cancelRent(offerId);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel rent');
    }
  };

  const handleSubmitDispute = async (
    offerId: bigint,
    renterSignedRequest: `0x${string}`,
    expectedPayload: `0x${string}`
  ) => {
    try {
      setError(null);
      const offer = myRentals.find(r => r.offerId === offerId);
      if (!offer) throw new Error('Rental not found');
      
      const disputeDeposit = offer.deposit / 10n;
      await submitDispute(offerId, renterSignedRequest, expectedPayload, disputeDeposit);
      await refetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit dispute');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#008080] flex flex-col p-4 overflow-hidden">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex flex-col gap-4">
          <WalletConnect />
          {isConnected && (
            <CreateOfferForm 
              onSubmit={handleCreateOffer} 
              isLoading={isCreating} 
            />
          )}
          {!isConnected && (
            <Window style={{ width: '300px' }}>
              <WindowHeader>Info</WindowHeader>
              <WindowContent>
                <p>Connect wallet to create offers and rent personhood.</p>
              </WindowContent>
            </Window>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Window style={{ flex: 1 }}>
            <WindowHeader>ProofOfPersonhood.exe</WindowHeader>
            <WindowContent>
              {error && (
                <div style={{ 
                  background: '#ffcccc', 
                  padding: '8px', 
                  marginBottom: '8px',
                  border: '2px solid #ff0000'
                }}>
                  Error: {error}
                </div>
              )}
              
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value as number)}>
                <Tab>Browse Offers</Tab>
                <Tab>My Dashboard</Tab>
              </Tabs>
              
              <ScrollView style={{ height: 'calc(100vh - 250px)', marginTop: '16px' }}>
                {activeTab === 0 && (
                  <OfferList 
                    offers={offers} 
                    onRent={handleRent}
                    isLoading={isLoading || isAccepting}
                  />
                )}
                {activeTab === 1 && (
                  <RentalDashboard
                    myOffers={myOffers}
                    myRentals={myRentals}
                    myDisputes={myDisputes}
                    onRenew={handleRenew}
                    onReturn={handleReturn}
                    onClaim={handleClaim}
                    onCancel={handleCancel}
                    onSubmitDispute={handleSubmitDispute}
                    isLoading={isLoading || isRenewing || isReturning || isClaiming || isCancelling || isSubmitting}
                  />
                )}
              </ScrollView>
            </WindowContent>
          </Window>
        </div>
      </div>
      
      <AppBar style={{ position: 'relative', marginTop: '8px' }}>
        <Toolbar className="flex justify-between">
          <div className="relative inline-block">
            <Button variant="menu" size="lg" className="font-bold">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Windows_logo_and_wordmark_-_1995-2001.svg"
                alt="Win95"
                style={{ height: '20px', marginRight: 4 }}
              />
              Start
            </Button>
          </div>
          <div className="bg-white px-2 border-2 border-gray-400 border-inset">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={original as unknown as import('styled-components').DefaultTheme}>
          <GlobalStyles />
          <MarketplaceApp />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
