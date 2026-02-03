import React, { useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, TextField } from 'react95';
import styled from 'styled-components';
import { parseEther } from 'viem';

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-family: 'ms_sans_serif';
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 11px;
  margin-top: 4px;
  font-family: 'ms_sans_serif';
`;

interface CreateOfferFormProps {
  onSubmit: (context: string, weeklyPayment: bigint, deposit: bigint) => void;
  isLoading?: boolean;
}

export const CreateOfferForm: React.FC<CreateOfferFormProps> = ({ onSubmit, isLoading }) => {
  const [context, setContext] = useState('');
  const [weeklyPayment, setWeeklyPayment] = useState('');
  const [deposit, setDeposit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!context.trim()) {
      newErrors.context = 'Usage context is required';
    }

    if (!weeklyPayment) {
      newErrors.weeklyPayment = 'Weekly payment is required';
    }

    if (!deposit) {
      newErrors.deposit = 'Deposit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    try {
      const weeklyWei = parseEther(weeklyPayment);
      const depositWei = parseEther(deposit);
      onSubmit(context, weeklyWei, depositWei);
    } catch {
      setErrors({
        ...errors,
        weeklyPayment: 'Invalid ETH amount',
        deposit: 'Invalid ETH amount',
      });
    }
  };

  return (
    <Window style={{ width: '100%', maxWidth: '400px' }}>
      <WindowHeader>create_offer.exe</WindowHeader>
      <WindowContent>
        <FormGroup>
          <Label>Usage Context:</Label>
          <TextField
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Polkadot Forum Access"
            fullWidth
          />
          {errors.context && <ErrorMessage>{errors.context}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Weekly Payment (ETH):</Label>
          <TextField
            value={weeklyPayment}
            onChange={(e) => setWeeklyPayment(e.target.value)}
            placeholder="0.01"
            type="number"
            step="0.001"
            fullWidth
          />
          {errors.weeklyPayment && <ErrorMessage>{errors.weeklyPayment}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Deposit (ETH):</Label>
          <TextField
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="0.1"
            type="number"
            step="0.01"
            fullWidth
          />
          {errors.deposit && <ErrorMessage>{errors.deposit}</ErrorMessage>}
        </FormGroup>

        <Button onClick={handleSubmit} fullWidth disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Offer'}
        </Button>
      </WindowContent>
    </Window>
  );
};
