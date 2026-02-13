/**
 * Sign Request screen
 * Scan and respond to sign requests
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  SignRequest,
  SignRequestState,
  SignatureResponse as SignatureResponseType,
} from '@/types';
import { SignerService } from '@/services';
import { QRScanner, SignRequestDetail, SignatureResponse } from '@/components';

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Portfolio: undefined;
  SignRequest: undefined;
};

type SignRequestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignRequest'
>;

export function SignRequestScreen(): React.JSX.Element {
  const navigation = useNavigation<SignRequestScreenNavigationProp>();

  const [state, setState] = useState<SignRequestState>({ status: 'idle' });
  const [_error, setError] = useState<Error | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  const handleScanComplete = (request: SignRequest) => {
    setState({ status: 'parsed', request });
    setError(null);
  };

  const handleScanError = (scanError: Error) => {
    setError(scanError);
    setState({ status: 'idle' });
  };

  const handleScanCancel = () => {
    navigation.navigate('Home');
  };

  const handleConfirm = () => {
    if (state.status !== 'parsed') {
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (state.status !== 'parsed' || !password) {
      return;
    }

    setShowPasswordModal(false);

    try {
      setState({ status: 'signing' });

      const response = await SignerService.signRequest(state.request, password);
      setPassword('');
      const signatureResponseType: SignatureResponseType =
        response as SignatureResponseType;

      setState({ status: 'success', response: signatureResponseType });
      setError(null);
    } catch (err) {
      const signError =
        err instanceof Error ? err : new Error('Failed to sign request');
      setError(signError);
      setState({ status: 'parsed', request: state.request });
      Alert.alert('Error', `Failed to sign: ${signError.message}`);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPassword('');
  };

  const handleDeny = () => {
    Alert.alert('Request Denied', 'Sign request has been denied.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  };

  const handleSignatureClose = () => {
    navigation.navigate('Home');
  };

  const handleRetry = () => {
    setState({ status: 'idle' });
    setError(null);
  };

  return (
    <View style={styles.container}>
      {state.status === 'idle' && (
        <QRScanner
          onScanComplete={handleScanComplete}
          onError={handleScanError}
          onCancel={handleScanCancel}
        />
      )}

      {state.status === 'scanning' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.statusText}>Scanning QR code...</Text>
        </View>
      )}

      {state.status === 'parsed' && (
        <SignRequestDetail
          request={state.request}
          onConfirm={handleConfirm}
          onDeny={handleDeny}
        />
      )}

      {state.status === 'signing' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.statusText}>Signing request...</Text>
        </View>
      )}

      {state.status === 'success' && (
        <SignatureResponse
          response={state.response}
          onClose={handleSignatureClose}
        />
      )}

      {_error && state.status !== 'success' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{_error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={handlePasswordCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Wallet Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handlePasswordCancel}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handlePasswordSubmit}
                disabled={!password}
              >
                <Text style={styles.modalSubmitButtonText}>Sign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#e5e7eb',
  },
  modalCancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    backgroundColor: '#10b981',
  },
  modalSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
