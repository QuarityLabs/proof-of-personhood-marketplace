/**
 * Sign Request Detail component
 * Displays sign request details and confirmation buttons
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { SignRequest } from '../types';
import { SignRequestParser } from '../services';

interface SignRequestDetailProps {
  request: SignRequest;
  onConfirm: () => void;
  onDeny: () => void;
}

export function SignRequestDetail({
  request,
  onConfirm,
  onDeny,
}: SignRequestDetailProps) {
  const details = SignRequestParser.formatForDisplay(request);
  const timeRemaining = SignRequestParser.getTimeRemaining(request);

  const isValid = SignRequestParser.isRequestValid(request);
  const hasSignature = request.renterSignature !== undefined;

  const signatureValid = hasSignature
    ? SignRequestParser.verifyRenterSignature(request)
    : false;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Sign Request</Text>

        {isValid ? (
          <Text style={styles.statusValid}>Request is valid</Text>
        ) : (
          <Text style={styles.statusInvalid}>
            Request is invalid or expired
          </Text>
        )}

        {hasSignature ? (
          signatureValid ? (
            <Text style={styles.signatureValid}>
              ✓ Renter signature verified
            </Text>
          ) : (
            <Text style={styles.signatureInvalid}>
              ✗ Renter signature invalid
            </Text>
          )
        ) : (
          <Text style={styles.signatureMissing}>
            No renter signature (unsigned request)
          </Text>
        )}

        <Text style={styles.sectionTitle}>Request Details</Text>

        {Object.entries(details).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailKey}>{key}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Time Remaining</Text>

        <Text
          style={[
            styles.timeRemaining,
            timeRemaining > 60000
              ? styles.timeRemainingSafe
              : styles.timeRemainingWarning,
          ]}
        >
          {timeRemaining > 0
            ? `${Math.floor(timeRemaining / 1000)} seconds`
            : 'Expired'}
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.denyButton]}
          onPress={onDeny}
        >
          <Text style={styles.denyButtonText}>Deny</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmButton,
            !isValid && styles.buttonDisabled,
          ]}
          onPress={onConfirm}
          disabled={!isValid}
        >
          <Text style={styles.confirmButtonText}>Sign</Text>
        </TouchableOpacity>
      </View>
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
  statusValid: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusInvalid: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  signatureValid: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 12,
  },
  signatureInvalid: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  signatureMissing: {
    color: '#f59e0b',
    fontSize: 14,
    marginBottom: 12,
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
  timeRemaining: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 20,
  },
  timeRemainingSafe: {
    color: '#10b981',
  },
  timeRemainingWarning: {
    color: '#f59e0b',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  denyButton: {
    backgroundColor: '#ef4444',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  denyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
