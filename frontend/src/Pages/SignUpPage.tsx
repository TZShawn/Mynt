import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [email, setEmail] = useState('');

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
        },
      });
      
      setEmail(username);
      setIsConfirmStep(true);
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'Error during sign up');
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      await Auth.confirmSignUp(email, code);
      navigate('/login');
    } catch (error: any) {
      console.error('Error confirming sign up:', error);
      setError(error.message || 'Error confirming code');
    }
  };

  if (isConfirmStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Verify Email</h1>
          
          {error && (
            <div className="mb-4 p-2 text-red-500 text-sm text-center bg-red-50 rounded">
              {error}
            </div>
          )}

          <p className="mb-4 text-sm text-gray-600 text-center">
            We've sent a verification code to {email}. Please enter it below.
          </p>

          <form onSubmit={handleConfirmSignUp}>
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
              Verify Email
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        {error && (
          <div className="mb-4 p-2 text-red-500 text-sm text-center bg-red-50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
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
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
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