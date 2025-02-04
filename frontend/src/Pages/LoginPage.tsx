import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoggedInUser } from '../store/authSlice';
import { Amplify, Auth } from 'aws-amplify';

// Configure Amplify
Amplify.configure({
  Auth: {
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
  },
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const user = await Auth.signIn(username, password);
      
      dispatch(setLoggedInUser({
        id: user.attributes.sub,
        email: user.attributes.email,
        name: username,
      }));

      navigate('/dashboard');
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
