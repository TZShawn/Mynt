import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plaidClient } from '../utils/plaid';
import { saveUserToken, getUserToken } from '../utils/dynamodb';
import { APIResponse, TransactionRequest } from '../types/plaid';
import { CountryCode, Products } from 'plaid';
import { Logger } from '@aws-lambda-powertools/logger/lib/cjs';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const getOrigin = (event: APIGatewayProxyEvent): string => {
  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || []) as string[];
  return allowedOrigins.includes(origin as string) ? origin as string : allowedOrigins[0];
};

const logger = new Logger();

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.USER_POOL_CLIENT_ID!
});

const getCorsHeaders = (event: APIGatewayProxyEvent) => ({
  'Access-Control-Allow-Origin': getOrigin(event),
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
});

const getUserIdFromToken = async (token: string): Promise<string | null> => {
  try {
    const payload = await verifier.verify(token);
    logger.info('Token payload: ' + String(JSON.stringify(payload, null, 2)));
    return payload.sub;
  } catch (err) {
    logger.error('Token verification failed:', err instanceof Error ? err : String(err));
    return null;
  }
};

export const createLinkToken = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'No authorization header' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    // You can verify the JWT token here if needed

    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Mynt Budget Tracker',
      products: (process.env.PLAID_PRODUCTS?.split(',').map(p => p.trim()) || ['transactions']) as Products[],
      country_codes: (process.env.PLAID_COUNTRY_CODES?.split(',').map(c => c.trim()) || ['US']) as CountryCode[],
      language: 'en',
    });
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ link_token: response.data.link_token }),
    };
  } catch (error) {
    console.error('Error creating link token:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Failed to create link token' }),
    };
  }
};

export const exchangePublicToken = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'No authorization header' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await getUserIdFromToken(token);
    
    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'Invalid token or user ID not found' }),
      };
    }

    const { public_token, metadata } = JSON.parse(event.body || '{}');
    if (!public_token || !metadata) {
      return {
        statusCode: 400,

        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'Missing public_token in request body' }),
      };
    }

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;
    const date = new Date().toISOString();
    
    logger.info('Verified userId:' +  JSON.stringify(metadata));

    const formattedUser = {
      userId,
      accessTokens: [{
        access_token, 
        bank_name: metadata.institution_name,
        accounts: metadata.accounts,
      }],
      updatedAt: date,
    }

    await saveUserToken(formattedUser);

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ success: true }),
    };
    
  } catch (error) {
    logger.error('Error exchanging public token:' + (error instanceof Error ? error : String(error)));
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Failed to exchange public token' }),
    };
  }
};

export const getTransactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'No authorization header' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'Invalid token or user ID not found' }),
      };
    }

    // const { startDate, endDate, limit = 100 } = JSON.parse(event.body || '{}') as TransactionRequest;


    const user = await getUserToken(userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // const now = new Date();
    // const end = endDate ? new Date(endDate) : now;
    // const start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30));

    const response = await plaidClient.transactionsSync({
      access_token: user.accessTokens[0],
    });

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Failed to fetch transactions' }),
    };
  }
}; 
