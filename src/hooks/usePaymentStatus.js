import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export function usePaymentStatus() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [accessCheck, setAccessCheck] = useState(null);
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
    }
  };

  const fetchAccessCheck = async () => {
    try {
      const response = await apiClient.checkAccess();
      setAccessCheck(response);
    } catch (err) {
      console.error('Error fetching access check:', err);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPaymentStatus(), fetchAccessCheck()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    paymentStatus,
    accessCheck,
    loading,
    error,
    refetch: fetchPaymentStatus,
    refetchAccessCheck: fetchAccessCheck,
    refetchAll: fetchAll
  };
}