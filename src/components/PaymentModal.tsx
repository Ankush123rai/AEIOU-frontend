// components/PaymentModal.jsx
import { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('Loading Razorpay script...');
      
      // Check if already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    console.log('Starting Razorpay payment...');
    setLoading(true);
    setError('');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create order
      console.log('Creating order...');
      const data = await apiClient.createOrder(amount);
      console.log('Order created:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // FIX: Use the key from API response
      const razorpayKey = data.key;
      console.log('Using Razorpay key:', razorpayKey);

      if (!razorpayKey) {
        throw new Error('Razorpay key not received from server');
      }

      const options = {
        key: razorpayKey, // Use the key from API response
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Assessment Platform',
        description: 'Unlock Assessment Modules',
        order_id: data.order.id,
        handler: async function (response: any) {
          console.log('Payment handler called:', response);
          try {
            const verifyData = await apiClient.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              console.log('Payment verified successfully');
              onSuccess();
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError);
            setError(verifyError.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          },
        },
      };

      console.log('Opening Razorpay with options:', { ...options, key: 'HIDDEN' });

      const paymentObject = new window.Razorpay(options);
      
      // Add error handling
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      paymentObject.open();
      console.log('Razorpay modal opened');

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Mock payment for development
  const displayMockPayment = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isSuccess = window.confirm(
        'TEST MODE: Click OK for successful payment (₹100)\n\n' +
        'This will unlock your assessment modules.'
      );
      
      if (isSuccess) {
        console.log('Processing mock payment...');
        const result = await apiClient.mockPayment();
        console.log('Mock payment result:', result);
        
        if (result.success) {
          onSuccess();
        } else {
          setError('Mock payment failed: ' + (result.message || 'Unknown error'));
        }
      } else {
        setError('Payment was cancelled');
      }
    } catch (error: any) {
      console.error('Mock payment error:', error);
      setError(error.message || 'Mock payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Use mock payment in development, real payment in production
  const handlePayment = import.meta.env.NODE_ENV === 'development' 
    ? displayMockPayment 
    : displayRazorpay;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-poppins font-bold text-gray-900">
            Unlock Assessment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {loading ? (
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CreditCard className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {loading ? 'Processing...' : 'Complete Payment'}
            </h3>
            <p className="text-gray-600 mb-4">
              Pay ₹{amount / 100} to unlock all 4 assessment modules
            </p>
            
            {import.meta.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 text-sm font-medium">
                    🧪 Development Mode
                  </span>
                </div>
                <p className="text-yellow-600 text-xs mt-1 text-center">
                  {loading ? 'Processing mock payment...' : 'Using mock payment system'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Assessment Fee</span>
              <span className="font-semibold">₹{amount / 100}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Includes all 4 modules</span>
              <span className="text-green-600 font-medium">One-time payment</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    Pay ₹{amount / 100}
                    {import.meta.env.NODE_ENV === 'development' && ' (Test)'}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure payment powered by Razorpay</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Full access to all 4 modules</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Lifetime access to completed assessments</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Expert evaluation and feedback</span>
            </div>
          </div>

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 text-center">
                Check browser console (F12) for detailed logs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}