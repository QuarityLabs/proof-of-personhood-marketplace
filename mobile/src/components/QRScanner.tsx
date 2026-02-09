/**
 * QR Code Scanner component
 * Uses react-native-camera to scan QR codes
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import type { SignRequest } from '../types';
import { SignRequestParser } from '../services';

interface QRScannerProps {
  onScanComplete: (request: SignRequest) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export function QRScanner({
  onScanComplete,
  onError,
  onCancel,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    setIsScanning(true);
    setLastScan(null);
  }, []);

  const handleBarCodeRead = (event: BarCodeReadEvent) => {
    if (!isScanning) {
      return;
    }

    const data = event.data;

    if (data === lastScan) {
      return;
    }

    setLastScan(data);
    setIsScanning(false);

    try {
      const request = SignRequestParser.parseQRCode(data);
      onScanComplete(request);
    } catch (error) {
      const scanError =
        error instanceof Error ? error : new Error('Failed to parse QR code');
      onError(scanError);
      setIsScanning(true);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        onBarCodeRead={handleBarCodeRead}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <Text style={styles.scanText}>
            {isScanning ? 'Align QR code within frame' : 'Scanning...'}
          </Text>
        </View>
      </RNCamera>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
  },
  scanText: {
    marginTop: 20,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
