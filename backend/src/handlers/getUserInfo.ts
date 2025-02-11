import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserToken } from "../utils/dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Logger } from "@aws-lambda-powertools/logger/lib/cjs";

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

export const handler = async (
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
        body: JSON.stringify({ error: "Invalid token or user ID not found" }),
      };
    }

    logger.info("User ID: " + userId);

    const user = await getUserToken(userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Remove sensitive information before sending response
    const { password, ...userInfo } = user;

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        success: true,
        user: userInfo,
      }),
    };
  } catch (error) {
    logger.error(
      "Error getting user info:",
      error instanceof Error ? error : String(error)
    );
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: "Failed to get user information" }),
    };
  }
};
