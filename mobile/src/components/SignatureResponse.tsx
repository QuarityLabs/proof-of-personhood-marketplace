/**
 * Signature Response component
 * Displays signature response with QR code option
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import type { SignatureResponse } from '@/types';
import { SignerService } from '@/services';

interface SignatureResponseProps {
  response: SignatureResponse;
  onClose: () => void;
}

export function SignatureResponse({
  response,
  onClose,
}: SignatureResponseProps) {
  const details = SignerService.formatForDisplay(response);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<string>('');

  const handleCopyToClipboard = () => {
    const qrString = SignerService.createSignatureResponseQR(response);
    Alert.alert(
      'Copy Signature',
      'QR code data copied to clipboard:\n\n' + qrString.slice(0, 100) + '...',
      [{ text: 'OK' }]
    );
  };

  const handleGenerateQR = () => {
    const qrString = SignerService.createSignatureResponseQR(response);
    setQrData(qrString);
    setShowQRModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Signature Generated</Text>

        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Payload signed successfully</Text>
        </View>

        <Text style={styles.sectionTitle}>Signature Details</Text>

        {Object.entries(details).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailKey}>{key}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}

        <View style={styles.signatureBox}>
          <Text style={styles.signatureTitle}>Full Signature</Text>
          <Text style={styles.signatureValue} numberOfLines={3}>
            {response.signature}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleCopyToClipboard}
          >
            <Text style={styles.buttonText}>Copy Signature</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleGenerateQR}>
            <Text style={styles.buttonText}>Generate QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showQRModal}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Signature QR Code</Text>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>
                QR Code Data (show to renter):
              </Text>
              <Text style={styles.qrDataText} numberOfLines={8}>
                {qrData}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  successBox: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 48,
    color: '#ffffff',
    marginBottom: 8,
  },
  successText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailKey: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
  },
  signatureBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  signatureValue: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6b7280',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrPlaceholder: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  qrDataText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
