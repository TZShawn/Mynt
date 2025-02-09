import { DynamoDB } from 'aws-sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { PlaidUser } from '../types/plaid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USER_TABLE!;

interface SaveUserTokenParams {
  userId: string;
  accessTokens: any[];
  updatedAt: string;
}

export const saveUserToken = async (user: SaveUserTokenParams): Promise<void> => {
  console.log('user', user.userId)
  
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId: user.userId },
    UpdateExpression: 'SET accessTokens = list_append(if_not_exists(accessTokens, :empty_list), :accessTokens), updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':accessTokens': user.accessTokens,
      ':updatedAt': user.updatedAt,
      ':empty_list': [],
    },

  });

  await docClient.send(command);
};

interface UserEntry {
  userId: string;
  accessTokens: any[];
  updatedAt: string;
  [key: string]: any; // Allow for additional fields that might be in the DB
}

export const getUserToken = async (userId: string): Promise<UserEntry | null> => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { userId },
  });

  const result = await docClient.send(command);
  return (result.Item as UserEntry) || null;
}; 
