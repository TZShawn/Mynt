import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID as string,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID as string,
      loginWith: {
        oauth: {
          domain: `mynt-budget-tracker-dev-auth.auth.us-east-1.amazoncognito.com`,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['http://localhost:3000'],
          redirectSignOut: ['http://localhost:3000'],
          responseType: 'code'
        },
        username: true,
        email: true
      }
    }
  },
  API: {
    REST: {
      api: {
        endpoint: process.env.REACT_APP_BASE_URL as string,
        region: 'us-east-1',
      },
    },
  },
}); 