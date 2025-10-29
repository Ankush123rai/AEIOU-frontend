import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();


  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users/detail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.data);
      } else if (response.status === 404) {
        setUserDetails(null);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUserDetails = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users/create-detail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          motherTongue: formData.motherTongue.split(',').map(lang => ({ name: lang.trim() })),
          languagesKnown: formData.languages.split(',').map(lang => ({ name: lang.trim() })),
          highestQualification: formData.qualification,
          section: formData.section,
          residence: formData.residence
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user details');
      }

      const data = await response.json();
      setUserDetails(data.data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const refetch = () => {
    fetchUserDetails();
  };

  return {
    userDetails,
    loading,
    error,
    refetch,
    createUserDetails,
    isProfileComplete: !!userDetails
  };
};