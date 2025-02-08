import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plaidClient } from '../utils/plaid';
import { saveUserToken, getUserToken } from '../utils/dynamodb';
import { APIResponse, TransactionRequest } from '../types/plaid';
import { CountryCode, Products } from 'plaid';

const getOrigin = (event: APIGatewayProxyEvent): string => {
  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || []) as string[];
  return allowedOrigins.includes(origin as string) ? origin as string : allowedOrigins[0];
};

const getCorsHeaders = (event: APIGatewayProxyEvent) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
});

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
    const userId = event.requestContext.authorizer?.claims.sub;
    const { public_token } = JSON.parse(event.body || '{}');

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;

    await saveUserToken({
      userId,
      accessToken: access_token,
      itemId: item_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Failed to exchange public token' }),
    };
  }
};

export const getTransactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const { startDate, endDate, limit = 100 } = JSON.parse(event.body || '{}') as TransactionRequest;

    const user = await getUserToken(userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30));

    const response = await plaidClient.transactionsGet({
      access_token: user.accessToken,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      options: {
        count: limit,
      },
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