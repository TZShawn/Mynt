import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp } from 'aws-amplify/auth';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('email') as string;
    const password = formData.get('password') as string;
    const email = formData.get('email') as string;

    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      
      setUsername(username);
      setShowVerification(true);
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error instanceof Error ? error.message : 'Error signing up');
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      await confirmSignUp({
        username,
        confirmationCode: code
      });
      navigate('/login');
    } catch (error) {
      console.error('Error confirming sign up:', error);
      setError(error instanceof Error ? error.message : 'Error confirming sign up');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {showVerification ? 'Verify Email' : 'Sign Up'}
        </h1>
        
        {error && (
          <div className="mb-4 p-2 text-red-500 text-sm text-center bg-red-50 rounded">
            {error}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerification}>
            <p className="mb-4 text-sm text-gray-600 text-center">
              Please enter the verification code sent to your email.
            </p>
            <input
              name="code"
              type="text"
              placeholder="Verification Code"
              required
              className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Verify
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:text-blue-600">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage; 