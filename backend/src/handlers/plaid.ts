import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plaidClient } from '../utils/plaid';
import { saveUserToken, getUserToken, addTransaction, updateTransaction, deleteTransaction, updateUser, getDBTransactions } from '../utils/dynamodb';
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

    logger.info('Creating link token for user: ' + process.env.PLAID_PRODUCTS);

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Mynt Budget Tracker',
      products: (process.env.PLAID_PRODUCTS?.split(',').map(p => p.trim()) || ['transactions']) as Products[],
      country_codes: (process.env.PLAID_COUNTRY_CODES?.split(',').map(c => c.trim()) || ['CA']) as CountryCode[],
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

    logger.info('Response: ' + JSON.stringify(response.data, null, 2));

    const { access_token, item_id } = response.data;
    const date = new Date().toISOString();

    const user = await getUserToken(userId);

    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    let user_access_tokens = user.accessTokens;


    let account = false;
    for (const token of user_access_tokens) {
      if (token.bank_name === metadata.institution_name) {
        token.access_token = access_token;
        token.last_synced = date;
        token.cursor = "";
        account = true;
      }
    }

    if (!account) {
      user_access_tokens.push({
        access_token,
        bank_name: metadata.institution_name,
        accounts: metadata.accounts,
        last_synced: date,
        cursor: ""
      });
    }

    const formattedUser = {
      userId,
      accessTokens: user_access_tokens,
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

    let user = await getUserToken(userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    let accessTokens = user.accessTokens;
    for (let token of accessTokens) {
      
      const accounts = token.accounts.map((account: any) => {return {account_id: account.account_id, name: account.name}});

      const accessToken = token.access_token;
      let cursor = null
      if (token.cursor != "") {
        cursor = token.cursor;
      }

      let hasNext = true;
      let nextCursor = cursor;

      let added: any[]   = []
      let modified: any[] = []
      let removed: any[] = []

      while(hasNext) {
        logger.info('Getting transactions from Plaid' + nextCursor);
        const response = await plaidClient.transactionsSync({
          access_token: accessToken,
          cursor: nextCursor,
        });
        logger.info('FINSIHED FETCHING FROM PLAID');
        const transactions = response.data;
        logger.info('Transactions: ' + JSON.stringify(transactions));
        added.push(...transactions.added);
        modified.push(...transactions.modified);
        removed.push(...transactions.removed);

        nextCursor = response.data.next_cursor;
        cursor = nextCursor;
        hasNext = transactions.has_more;
      }

      for (const transaction of added) {
        await addTransaction(userId, transaction, accounts);
      }

      for (const transaction of modified) {
        await updateTransaction(userId, transaction);
      }

      for (const transaction of removed) {
        await deleteTransaction(transaction.transaction_id);
      }

      token.cursor = cursor;
      token.last_synced = new Date().toISOString();
      
      logger.info('Token updated: ' + JSON.stringify(token));
    }

    user.accessTokens = accessTokens
    user.updatedAt = new Date().toISOString();
    logger.info('User accessTokens: ' + JSON.stringify(user.accessTokens));
    logger.info('User updatedAt: ' + user.updatedAt);

    await updateUser(userId, user)
    logger.info('User updated');

    logger.info('Getting transactions from DB');
    const transactions = await getDBTransactions(userId);

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ success: true, response: transactions }),
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

export const updateTransactionCategory = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    const { transaction, category } = JSON.parse(event.body || '{}');

    const transactions = await getDBTransactions(userId);

    if (!transactions) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'Transaction not found' }),
      };
    }

    const updatedTransaction = {
      ...transaction,
      transCategory: category,
    };

    await updateTransaction(userId, updatedTransaction);

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Failed to update transaction' }),
    };
  }
};
