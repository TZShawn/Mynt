import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoggedInUser } from '../store/authSlice';
import { signIn } from 'aws-amplify/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');
  const [signInError, setSignInError] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const signInOutput = await signIn({
        username,
        password
      });
      
      if (signInOutput.isSignedIn) {
        dispatch(setLoggedInUser({
          id: username,
          email: username,
          name: username,
        }));
        
        navigate('/dashboard');
      } else {
        setSignInError(true);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        
        {error && (
          <div className="mb-4 p-2 text-red-500 text-sm text-center bg-red-50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
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
            Sign In
          </button>
        </form>

        {signInError && (
          <div className="mb-4 p-2 text-red-500 text-sm text-center bg-red-50 rounded">
            Invalid username or password
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:text-blue-600">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
