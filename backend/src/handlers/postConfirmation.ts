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

export const handler = async (event: PostConfirmationTriggerEvent) => {
  console.log('PostConfirmation event:', JSON.stringify(event, null, 2));
  console.log('Environment variables:', {
    USER_TABLE,
    AWS_REGION: process.env.AWS_REGION,
  });

  try {
    const { userAttributes } = event.request;
    const userId = event.request.userAttributes.sub;
    const email = userAttributes.email;
    const password = userAttributes.password;

    console.log('User data to be saved:', { userId, email });

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

    console.log('DynamoDB command:', JSON.stringify(command.input, null, 2));

    await docClient.send(command);
    console.log('Successfully created user record in DynamoDB');

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
