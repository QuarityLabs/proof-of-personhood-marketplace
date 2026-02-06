import { useState } from 'react';
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
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

import { config } from './services/wagmi';
import { WalletConnect, OfferList, CreateOfferForm, RentalDashboard } from './components';
import type { Offer, Dispute } from './types';
import { OfferStatus } from './types';

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

const App = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [myRentals, setMyRentals] = useState<Offer[]>([]);
  const [myDisputes] = useState<Dispute[]>([]);
  const [isLoading] = useState(false);

  const handleCreateOffer = (context: string, weeklyPayment: bigint, deposit: bigint) => {
    setOffers((prev) => {
      const newOffer: Offer = {
        offerId: BigInt(prev.length + 1),
        submitter: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        renter: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        usageContext: context,
        weeklyPayment,
        deposit,
        lockedPayment: 0n,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        rentedAt: 0n,
        expiresAt: 0n,
        status: OfferStatus.PENDING,
        totalRentals: 0n,
        lenderOffences: 0,
        renterInvalidDisputes: 0,
        activeDisputeId: 0n,
      };
      return [...prev, newOffer];
    });
    setMyOffers((prev) => {
      const newOffer: Offer = {
        offerId: BigInt(prev.length + 1),
        submitter: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        renter: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        usageContext: context,
        weeklyPayment,
        deposit,
        lockedPayment: 0n,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        rentedAt: 0n,
        expiresAt: 0n,
        status: OfferStatus.PENDING,
        totalRentals: 0n,
        lenderOffences: 0,
        renterInvalidDisputes: 0,
        activeDisputeId: 0n,
      };
      return [...prev, newOffer];
    });
    alert('Offer created successfully!');
  };

  const handleRent = (offerId: bigint) => {
    setOffers((prev) => {
      const updatedOffers = prev.map((offer) =>
        offer.offerId === offerId
          ? { ...offer, status: OfferStatus.ACTIVE, rentedAt: BigInt(Math.floor(Date.now() / 1000)), expiresAt: BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60), lockedPayment: offer.weeklyPayment }
          : offer
      );
      const rentedOffer = updatedOffers.find((o) => o.offerId === offerId);
      if (rentedOffer) {
        setMyRentals((prevRentals) => [...prevRentals, rentedOffer]);
      }
      return updatedOffers;
    });
    alert('Rental started successfully!');
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={original as unknown as import('styled-components').DefaultTheme}>
          <GlobalStyles />
          
          <div className="h-screen w-screen bg-[#008080] flex flex-col p-4 overflow-hidden">
            <div className="flex-1 flex gap-4 overflow-hidden">
              <div className="flex flex-col gap-4">
                <WalletConnect />
                <CreateOfferForm onSubmit={handleCreateOffer} />
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <Window style={{ flex: 1 }}>
                  <WindowHeader>ProofOfPersonhood.exe</WindowHeader>
                  <WindowContent>
                    <Tabs value={activeTab} onChange={(value) => setActiveTab(value as number)}>
                      <Tab>Browse Offers</Tab>
                      <Tab>My Dashboard</Tab>
                    </Tabs>
                    
                    <ScrollView style={{ height: 'calc(100vh - 250px)', marginTop: '16px' }}>
                      {activeTab === 0 && (
                        <OfferList 
                          offers={offers} 
                          onRent={handleRent}
                          isLoading={isLoading}
                        />
                      )}
                      {activeTab === 1 && (
                        <RentalDashboard
                          myOffers={myOffers}
                          myRentals={myRentals}
                          myDisputes={myDisputes}
                          isLoading={isLoading}
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
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
