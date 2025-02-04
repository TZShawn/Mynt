import React from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkButtonProps {
  className?: string;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ className = '' }) => {
  const { open, ready } = usePlaidLink({
    token: 'your-link-token', // This should come from your backend
    onSuccess: (public_token: any, metadata: any) => {
      // Handle success
      console.log('Success:', public_token, metadata);
      // Send public_token to your backend
    },
    onExit: (err: any, metadata: any) => {
      // Handle exit
      console.log('Exit:', err, metadata);
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