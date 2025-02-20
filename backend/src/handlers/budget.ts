import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { plaidClient } from "../utils/plaid";
import {
  getUserToken,
  getNetworth,
  addNetworth,
  updateNetworthItem,
  getBudget,
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

export const getBudgets = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

        const budgets = await getBudget(userId);
        return {
            statusCode: 200,
            headers: getCorsHeaders(event),
            body: JSON.stringify(budgets),
        };
    } catch (error) {
        logger.error("Error getting budgets:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
    }
}

export const addBudget = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

        const { budget } = JSON.parse(event.body || '{}');
        const newBudget = {
            id: uuidv4(),
            userId,
            ...budget,
        };

        await addBudget(userId, newBudget);
        return {
            statusCode: 200,
            headers: getCorsHeaders(event),
            body: JSON.stringify({ message: "Budget added successfully" }),
        };
    } catch (error) {
        logger.error("Error adding budget:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
    }
}