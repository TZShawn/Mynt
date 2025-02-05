import { DynamoDB } from 'aws-sdk';
import { PlaidUser } from '../types/plaid';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USER_TABLE!;

export const saveUserToken = async (user: PlaidUser): Promise<void> => {
  await dynamodb
    .put({
      TableName: TABLE_NAME,
      Item: user,
    })
    .promise();
};

export const getUserToken = async (userId: string): Promise<PlaidUser | null> => {
  const result = await dynamodb
    .get({
      TableName: TABLE_NAME,
      Key: { userId },
    })
    .promise();

  return (result.Item as PlaidUser) || null;
}; 
