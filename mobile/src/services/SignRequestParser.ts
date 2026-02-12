/**
 * Sign-Request parser and validator
 * Validates and parses QR code data containing sign requests
 */

import { ethers } from 'ethers';
import type { SignRequest, SignRequestQR } from '@/types';
import { SIGN_REQUEST_EXPIRY_MS, MAX_QR_DATA_SIZE } from '@/types';

/**
 * Parse and validate sign request from QR code data
 */
export class SignRequestParser {
  /**
   * Parse QR code data and extract sign request
   */
  static parseQRCode(data: string): SignRequest {
    if (!data || data.length === 0) {
      throw new Error('Empty QR code data');
    }

    if (data.length > MAX_QR_DATA_SIZE) {
      throw new Error('QR code data exceeds maximum size');
    }

    try {
      const parsed = JSON.parse(data, (_key, value) => {
        if (typeof value === 'string' && value.startsWith('BIGINT:')) {
          return BigInt(value.slice(7));
        }
        if (
          typeof value === 'number' &&
          ['offerId', 'requestId', 'timestamp'].includes(_key)
        ) {
          return BigInt(value);
        }
        return value;
      }) as SignRequestQR;

      if (parsed.type !== 'SIGN_REQUEST') {
        throw new Error('Invalid QR code type');
      }

      return this.validateSignRequest(parsed.data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unexpected token')
      ) {
        throw new Error('Invalid JSON format');
      }
      throw error;
    }
  }

  /**
   * Validate sign request structure and values
   */
  static validateSignRequest(request: SignRequest): SignRequest {
    if (request.offerId === undefined || request.offerId === null) {
      throw new Error('Missing offer ID');
    }

    if (request.requestId === undefined || request.requestId === null) {
      throw new Error('Missing request ID');
    }

    if (request.timestamp === undefined || request.timestamp === null) {
      throw new Error('Missing timestamp');
    }

    if (!request.expectedPayload) {
      throw new Error('Missing expected payload');
    }

    if (!request.renter) {
      throw new Error('Missing renter address');
    }

    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const requestTimestamp = request.timestamp;

    const timeDiff = currentTimestamp - requestTimestamp;
    if (timeDiff < 0) {
      throw new Error('Request timestamp is in the future');
    }

    const timeDiffMs = Number(timeDiff) * 1000;
    if (timeDiffMs > SIGN_REQUEST_EXPIRY_MS) {
      throw new Error('Request has expired');
    }

    if (!ethers.isAddress(request.renter)) {
      throw new Error('Invalid renter address');
    }

    if (
      !request.expectedPayload.startsWith('0x') ||
      request.expectedPayload.length <= 2
    ) {
      throw new Error('Invalid expected payload format');
    }

    return request;
  }

  /**
   * Verify renter's signature on the sign request
   */
  static verifyRenterSignature(request: SignRequest): boolean {
    if (!request.renterSignature) {
      return false;
    }

    try {
      const message = this.createMessageHash(request);
      const signerAddress = ethers.recoverAddress(
        message,
        request.renterSignature
      );
      return signerAddress.toLowerCase() === request.renter.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create message hash from sign request
   */
  static createMessageHash(request: SignRequest): string {
    const message = ethers.solidityPacked(
      ['uint256', 'uint256', 'uint256', 'bytes', 'address'],
      [
        request.offerId,
        request.requestId,
        request.timestamp,
        request.expectedPayload,
        request.renter,
      ]
    );

    return ethers.keccak256(message);
  }

  /**
   * Format sign request for display
   */
  static formatForDisplay(request: SignRequest): Record<string, string> {
    return {
      'Offer ID': request.offerId.toString(),
      'Request ID': request.requestId.toString(),
      Renter: `${request.renter.slice(0, 6)}...${request.renter.slice(-4)}`,
      Timestamp: new Date(Number(request.timestamp) * 1000).toLocaleString(),
      Payload: `${request.expectedPayload.slice(
        0,
        10
      )}...${request.expectedPayload.slice(-8)}`,
      'Payload Length': `${(request.expectedPayload.length - 2) / 2} bytes`,
    };
  }

  /**
   * Check if request is still valid (not expired)
   */
  static isRequestValid(request: SignRequest): boolean {
    try {
      this.validateSignRequest(request);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get remaining time before request expires
   */
  static getTimeRemaining(request: SignRequest): number {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const requestTimestamp = request.timestamp;
    const expiryTimestamp =
      requestTimestamp + BigInt(Math.floor(SIGN_REQUEST_EXPIRY_MS / 1000));

    const remaining = expiryTimestamp - currentTimestamp;
    return Number(remaining) * 1000;
  }
}
