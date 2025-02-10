import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID as string,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID as string,
    }
  }
}); 