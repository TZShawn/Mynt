import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { plaidClient } from "../utils/plaid";
import {
  saveUserToken,
  getUserToken,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  updateUser,
  getDBTransactions,
  getNetworth,
  addNetworth,
  updateNetworth,
} from "../utils/dynamodb";
import { APIResponse, TransactionRequest } from "../types/plaid";
import { CountryCode, Products } from "plaid";
import { Logger } from "@aws-lambda-powertools/logger/lib/cjs";
import { CognitoJwtVerifier } from "aws-jwt-verify";

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
    // You can verify the JWT token here if needed

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const userInfo = await getUserToken(userId)

    const accessToken = userInfo?.accessTokens

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: " No access tokens are avaliable" }),
      };
    }

    let netWorthItems = await getNetworth(userId)

    if (netWorthItems && netWorthItems.lastUpdated.split("T")[0] != new Date().toISOString().split("T")[0]) {
      let newNetWorthItems = []

      for (const token of accessToken) {
        const accountsInfo = await plaidClient.accountsBalanceGet({
          access_token: token,
        }).then(res => res.data);
  
        const accounts = accountsInfo.accounts

        for (const account of accounts) {
          newNetWorthItems.push({
            accountId: account.account_id,
            balance: account.balances.current,
            currency: account.balances.iso_currency_code,
            code: account.mask,
            name: account.name,
            subtype: account.subtype,
            type: account.type,
          });
        }
      }

      const formattedEntry = {  
        date: new Date().toISOString().split("T")[0],
        networth: newNetWorthItems
      }

      let newNetWorthTimeline = [...netWorthItems.networthTimeline, formattedEntry]
      
      await updateNetworth(userId, newNetWorthTimeline)
    }

    const accountItems = netWorthItems?.networthTimeline.find((entry: any) => entry.date === new Date().toISOString().split("T")[0])

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify(accountItems),
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

    const netWorthItems = await getNetworth(userId)

    if (!netWorthItems) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "Unauthorized" }),
      };  
    }

    let newNetWorthItems = []

    for (const token of userInfo.accessTokens) {
      const accountsInfo = await plaidClient.accountsBalanceGet({
        access_token: token,
      }).then(res => res.data);

      const accounts = accountsInfo.accounts

      for (const account of accounts) {
        newNetWorthItems.push({
          accountId: account.account_id,
          balance: account.balances.current,
          currency: account.balances.iso_currency_code,
          code: account.mask,
          name: account.name,
          subtype: account.subtype,
          type: account.type,
        });
      }
    }

    const formattedEntry = {
      date: new Date().toISOString().split("T")[0],
      networth: newNetWorthItems
    }

    const currentDayIndex = netWorthItems.networthTimeline.findIndex((entry: any) => entry.date === new Date().toISOString().split("T")[0])

    if (currentDayIndex === -1) {
      newNetWorthItems = [...netWorthItems.networthTimeline, formattedEntry]
    } else {
      newNetWorthItems = [...netWorthItems.networthTimeline]
      newNetWorthItems[currentDayIndex] = formattedEntry
    }

    await updateNetworth(userId, newNetWorthItems)

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ message: "Networth updated" }),
    };
  } catch (error) {
    console.error("Error in updateUserNetworth:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

