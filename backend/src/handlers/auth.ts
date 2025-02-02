import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const signUp = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    };

    const result = await cognito.signUp(params).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'User registration successful',
        userSub: result.UserSub,
      }),
    };
  } catch (error) {
    console.error('Error in signUp:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const confirmSignUp = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, code } = JSON.parse(event.body || '{}');

    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    };

    await cognito.confirmSignUp(params).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Email confirmed successfully' }),
    };
  } catch (error) {
    console.error('Error in confirmSignUp:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const signIn = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognito.initiateAuth(params).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        tokens: {
          accessToken: result.AuthenticationResult?.AccessToken,
          idToken: result.AuthenticationResult?.IdToken,
          refreshToken: result.AuthenticationResult?.RefreshToken,
        },
      }),
    };
  } catch (error) {
    console.error('Error in signIn:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}; 