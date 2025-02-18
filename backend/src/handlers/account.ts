import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { plaidClient } from "../utils/plaid";
import {
  getUserToken,
  getNetworth,
  addNetworth,
  updateNetworthItem,
} from "../utils/dynamodb";
import { APIResponse, TransactionRequest } from "../types/plaid";
import { CountryCode, Products } from "plaid";
import { Logger } from "@aws-lambda-powertools/logger/lib/cjs";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from 'uuid';
const logger = new Logger();

const getOrigin = (event: APIGatewayProxyEvent): string => {
  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || []) as string[];
  return allowedOrigins.includes(origin as string)
    ? (origin as string)
    : allowedOrigins[0];
};

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

const getCorsHeaders = (event: APIGatewayProxyEvent) => ({
  "Access-Control-Allow-Origin": getOrigin(event),
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
});

const getUserIdFromToken = async (token: string): Promise<string | null> => {
  try {
    const payload = await verifier.verify(token);
    logger.info("Token payload: " + String(JSON.stringify(payload, null, 2)));
    return payload.sub;
  } catch (err) {
    logger.error(
      "Token verification failed:",
      err instanceof Error ? err : String(err)
    );
    return null;
  }
};

export const getAccountsInfo = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "No authorization header" }),
      };
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const {startDate, endDate } = event.queryStringParameters || {}

    // Calculate date range
    const today = new Date();
    const defaultEndDate = today.toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const defaultStartDate = thirtyDaysAgo.toISOString().split("T")[0];

    const dateRange = {
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate
    }

    logger.info("Date range:", dateRange);

    const userInfo = await getUserToken(userId)

    const accessToken = userInfo?.accessTokens

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "No access tokens are available" }),
      };
    }

    let netWorthItems = await getNetworth(userId, dateRange) ?? []
    logger.info("Retrieved networth items: " + JSON.stringify(netWorthItems));

    const todayStr = today.toISOString().split("T")[0];
    let todayUpdate = await getNetworth(userId, {
      startDate: todayStr,
      endDate: todayStr
    });

    if (todayUpdate.length === 0) {
      let updatedAccounts = [];
      let totalNetworth = 0;

      for (const token of accessToken) {
        const accountsInfo = await plaidClient.accountsBalanceGet({
          access_token: token.access_token,
        }).then(res => res.data);
  
        const accounts = accountsInfo.accounts;

        for (const account of accounts) {
          const balance = account.balances.current || 0;
          totalNetworth += balance;
          updatedAccounts.push({
            account_id: account.account_id,
            account_name: account.name,
            account_subtype: account.subtype || "unknown",
            account_type: account.type || "unknown",
            mask: account.mask || "xxxx",
            balance: balance,
          });
        }
      }

      const formattedEntry = {
        userId,
        date: todayStr,
        entryId: uuidv4(),
        networth: totalNetworth,
        accounts: updatedAccounts,
      };

      netWorthItems = [...netWorthItems, formattedEntry];
      await addNetworth(userId, formattedEntry);
    }

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        success: true,
        networthHistory: netWorthItems
      }),
    };
  } catch (error) {
    console.error("Error in getAccountsInfo:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const updateUserNetworth = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "No authorization header" }),
      };
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const userInfo = await getUserToken(userId) 

    if (!userInfo) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const netWorthItems = await getNetworth(userId, {
      startDate: todayStr,
      endDate: todayStr
    });

    let updatedAccounts = [];
    let totalNetworth = 0;

    for (const token of userInfo.accessTokens) {
      const accountsInfo = await plaidClient.accountsBalanceGet({
        access_token: token.access_token,
      }).then(res => res.data);

      const accounts = accountsInfo.accounts;

      for (const account of accounts) {
        const balance = account.balances.current || 0;
        totalNetworth += balance;
        updatedAccounts.push({
          account_id: account.account_id,
          account_name: account.name,
          account_subtype: account.subtype || "unknown",
          account_type: account.type || "unknown",
          mask: account.mask || "xxxx",
          balance: balance,
        });
      }
    }

    const formattedEntry = {
      userId,
      date: todayStr,
      entryId: netWorthItems[0]?.entryId ?? uuidv4(),
      networth: totalNetworth,
      accounts: updatedAccounts,
    };

    if (netWorthItems.length === 0) {
      await addNetworth(userId, formattedEntry);
    } else {
      await updateNetworthItem(userId, formattedEntry);
    }

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        success: true,
        networth: formattedEntry
      }),
    };
  } catch (error) {
    console.error("Error in updateUserNetworth:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

