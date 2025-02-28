import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

interface UserSettings {
  theme: 'light' | 'dark';
  currency: string;
}

interface PlaidAccessToken {
  itemId: string;
  accessToken: string;
  institutionId: string;
  institutionName: string;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USER_TABLE = process.env.USER_TABLE!;
const NETWORTH_TABLE = process.env.NETWORTH_TABLE!;

export const handler = async (event: PostConfirmationTriggerEvent) => {

  try {
    const { userAttributes } = event.request;
    const userId = event.request.userAttributes.sub;
    const email = userAttributes.email;
    const password = userAttributes.password;


    const command = new PutCommand({
      TableName: USER_TABLE,
      Item: {
        userId,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: "CAD",
        accessTokens: [],
        accounts: [],
        password,
      }
    });

    const netWorthCommand = new PutCommand({
      TableName: NETWORTH_TABLE,
      Item: {
        userId,
        networthTimeline: [],
        lastUpdated: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
      }
    });

    await docClient.send(command);
    await docClient.send(netWorthCommand);
    return event;
  } catch (error: any) {
    console.error('Error in post confirmation handler:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};
