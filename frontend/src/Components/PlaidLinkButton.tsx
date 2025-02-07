import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkButtonProps {
  className?: string;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ className = '' }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        console.log('Fetching link token', `${process.env.REACT_APP_BASE_URL}/plaid/create-link-token`);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/plaid/create-link-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Link token response:', data);
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

    fetchLinkToken();
  }, []);

  const onSuccess = async (public_token: string, metadata: any) => {
    try {
      console.log('Plaid Link success:', metadata);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/plaid/exchange-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ public_token }),
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