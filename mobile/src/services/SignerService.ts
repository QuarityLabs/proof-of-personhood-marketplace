/**
 * Signer service for signing payloads with wallet's private key
 */

import { ethers } from 'ethers';
import type {
  SignRequest,
  SignatureResponse,
  SignatureResponseQR,
} from '@/types';
import { WalletService } from '@/services/WalletService';
import { toEthereumAddress } from '@/types';

/**
 * Signer service for signing payloads
 */
export class SignerService {
  /**
   * Sign a sign request and return signature response
   */
  static async signRequest(
    request: SignRequest,
    password: string
  ): Promise<SignatureResponse> {
    try {
      const privateKey = await WalletService.getPrivateKey(password);
      const wallet = new ethers.Wallet(privateKey);

      const signature = await wallet.signMessage(request.expectedPayload);

      const lenderAddress = toEthereumAddress(wallet.address);
      const response: SignatureResponse = {
        offerId: request.offerId,
        requestId: request.requestId,
        payload: request.expectedPayload,
        signature: signature as `0x${string}`,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        lender: lenderAddress,
      };

      return response;
    } catch (error) {
      throw new Error(
        `Failed to sign request: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Verify signature matches payload and signer
   */
  static verifySignature(
    payload: string,
    signature: string,
    signerAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(payload, signature);
      return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create QR code data from signature response
   */
  static createSignatureResponseQR(response: SignatureResponse): string {
    const qrData: SignatureResponseQR = {
      type: 'SIGNATURE_RESPONSE',
      data: response,
    };
    return JSON.stringify(qrData, (_key, value) => {
      if (typeof value === 'bigint') {
        return `BIGINT:${value.toString()}`;
      }
      return value;
    });
  }

  /**
   * Parse signature response from QR code data
   */
  static parseSignatureResponseQR(data: string): SignatureResponse {
    try {
      const parsed = JSON.parse(data, (_key, value) => {
        if (typeof value === 'string' && value.startsWith('BIGINT:')) {
          return BigInt(value.slice(7));
        }
        return value;
      }) as SignatureResponseQR;

      if (parsed.type !== 'SIGNATURE_RESPONSE') {
        throw new Error('Invalid QR code type');
      }

      return parsed.data;
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
   * Validate signature response structure
   */
  static validateSignatureResponse(response: SignatureResponse): boolean {
    if (response.offerId === undefined || response.offerId === null) {
      return false;
    }

    if (response.requestId === undefined || response.requestId === null) {
      return false;
    }

    if (!response.payload) {
      return false;
    }

    if (!response.signature) {
      return false;
    }

    if (response.timestamp === undefined || response.timestamp === null) {
      return false;
    }

    if (!response.lender) {
      return false;
    }

    if (!ethers.isAddress(response.lender)) {
      return false;
    }

    if (
      !this.verifySignature(
        response.payload,
        response.signature,
        response.lender
      )
    ) {
      return false;
    }

    return true;
  }

  /**
   * Format signature response for display
   */
  static formatForDisplay(response: SignatureResponse): Record<string, string> {
    return {
      'Offer ID': response.offerId.toString(),
      'Request ID': response.requestId.toString(),
      Lender: `${response.lender.slice(0, 6)}...${response.lender.slice(-4)}`,
      Timestamp: new Date(Number(response.timestamp) * 1000).toLocaleString(),
      Signature: `${response.signature.slice(
        0,
        10
      )}...${response.signature.slice(-8)}`,
    };
  }
}
