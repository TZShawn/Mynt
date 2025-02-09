import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';

interface PlaidLinkButtonProps {
  className?: string;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ className = '' }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (token) {
          fetchLinkToken(token);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setError('Authentication required');
      }
    };

    getUser();
  }, []);

  const fetchLinkToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/plaid/create-link-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      setError('Failed to initialize Plaid');
    }
  };

  const onSuccess = async (public_token: string, metadata: any) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      

      const account_metadata = []

      for (const account of metadata.accounts) {
        account_metadata.push({
          account_name: account.name,
          account_id: account.id,
          account_subtype: account.subtype,
        })
      }

      const formattedMetadata = {
        institution_name: metadata.institution.name,
        accounts: account_metadata,

      }


      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Plaid Link success:', metadata);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/plaid/exchange-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token, metadata: formattedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }

      const data = await response.json();
      console.log('Exchange token success:', data);
    } catch (error) {
      console.error('Error exchanging public token:', error);
      setError('Failed to connect bank account');
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess,
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link exit with error:', err, metadata);
        setError('Error connecting to bank');
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 ${className}`}
    >
      Connect Bank Account
    </button>
  );
};

export default PlaidLinkButton; 