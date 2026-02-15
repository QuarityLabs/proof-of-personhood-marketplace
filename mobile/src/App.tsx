import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  HomeScreen,
  WalletScreen,
  PortfolioScreen,
  SignRequestScreen,
} from '@/screens';

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Portfolio: undefined;
  SignRequest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Portfolio" component={PortfolioScreen} />
            <Stack.Screen name="SignRequest" component={SignRequestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
