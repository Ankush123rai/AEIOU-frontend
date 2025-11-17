import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export function usePaymentStatus() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPaymentStatus();
      setPaymentStatus(response);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  return {
    paymentStatus,
    loading,
    error,
    refetch: fetchPaymentStatus
  };
}