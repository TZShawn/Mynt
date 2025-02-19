import { DynamoDB } from 'aws-sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { PlaidUser } from '../types/plaid';
import { Logger } from '@aws-lambda-powertools/logger/lib/cjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USER_TABLE!;
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE!;
const NETWORTH_TABLE = process.env.NETWORTH_TABLE!;
const BUDGET_TABLE = process.env.BUDGET_TABLE!;
interface SaveUserTokenParams {
  userId: string;
  accessTokens: any[];
  updatedAt: string;
}

const logger = new Logger();
export const saveUserToken = async (user: SaveUserTokenParams): Promise<void> => {
  console.log('user', user.userId)
  
  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId: user.userId },
    UpdateExpression: 'SET accessTokens = :accessTokens, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':accessTokens': user.accessTokens,
      ':updatedAt': user.updatedAt,
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
    TableName: USERS_TABLE,
    Key: { userId },
  });

  const result = await docClient.send(command);
  return (result.Item as UserEntry) || null;
}; 

export const updateUser = async (userId: string, user: UserEntry) => {
  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId: userId },
    UpdateExpression: 'SET accessTokens = :accessTokens, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':accessTokens': user.accessTokens,
      ':updatedAt': user.updatedAt,
    },
  });

  await docClient.send(command);
}

export const addTransaction = async (userId: string, transaction: any, accounts: any[]) => {

  const transactionId = transaction.transaction_id;
  const transactionDate = transaction.date;
  const transactionAmount = transaction.amount;
  const transactionCategory = transaction.personal_finance_category.primary || "OTHER";
  const transactionMerchant = transaction.merchant_name || 'Unknown';

  const formattedTransaction = {
    transactionId: String(transactionId),
    userId: userId,
    transDate: transactionDate,
    transAmount: transactionAmount,
    transCategory: transactionCategory,
    transMerchant: transactionMerchant,
    hidden: false,
    transAccount: accounts.find((account: any) => account.account_id === transaction.account_id)?.name || "Unknown",
  }

  logger.info('Adding transaction: ' + JSON.stringify(formattedTransaction) + ' for transactionId: ' + transactionId);

  try {
    const command = new PutCommand({
      TableName: TRANSACTIONS_TABLE,
      Item: formattedTransaction,
      ConditionExpression: 'attribute_not_exists(transactionId)',
    });
    await docClient.send(command);
  } catch (error: any) {
    // If it's a duplicate transaction, log it but don't treat as error
    if (error.name === 'ConditionalCheckFailedException') {
      logger.info(`Skipping duplicate transaction ${transactionId} for user ${userId}`);
      return;
    }
    // For any other errors, log and rethrow
    logger.error('Error adding transaction:', { error, transactionId, userId });
    throw error;
  }
}

export const updateTransaction = async (userId: string, transaction: any) => {

  logger.info(JSON.stringify(transaction));

  const transactionId = transaction.transactionId;
  const transactionDate = transaction.transDate;
  const transactionAmount = transaction.transAmount;
  const transactionCategory = transaction.transCategory || "OTHER";
  const transactionMerchant = transaction.transMerchant || 'Unknown';

  const formattedTransaction = {
    transactionId: transactionId,
    userId: userId,
    transDate: transactionDate,
    transAmount: transactionAmount,
    transCategory: transactionCategory,
    transMerchant: transactionMerchant,
  } 

  logger.info('Updating transaction: ' + JSON.stringify(formattedTransaction) + ' for transactionId: ' + transactionId);

  const command = new UpdateCommand({
    TableName: TRANSACTIONS_TABLE,
    Key: { 
      transactionId: transactionId,
    },
    UpdateExpression: 'SET transDate = :transDate, transAmount = :transAmount, transCategory = :transCategory, transMerchant = :transMerchant',
    ExpressionAttributeValues: {
      ':transDate': transactionDate,
      ':transAmount': transactionAmount,
      ':transCategory': transactionCategory,
      ':transMerchant': transactionMerchant,
    },
  });

  await docClient.send(command);
}

export const deleteTransaction = async (transactionId: string) => {
  const command = new DeleteCommand({
    TableName: TRANSACTIONS_TABLE,
    Key: { transactionId: transactionId },
  });

  await docClient.send(command);
}

interface NetworthEntry {
  userId: string;
  date: string;
  networth: number;
  entryId: string;
  accounts: Array<{
    account_id: string;
    account_name: string;
    account_subtype: string;
    account_type: string;
    mask: string;
    balance: number;
  }>;
}

export const getNetworth = async (userId: string, dateRange: {startDate: string, endDate: string}) => {
  const command = new ScanCommand({
    TableName: NETWORTH_TABLE,
    FilterExpression: 'userId = :userId AND #date BETWEEN :startDate AND :endDate',
    ExpressionAttributeNames: {
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':startDate': dateRange.startDate,
      ':endDate': dateRange.endDate,
    },
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

export const addNetworth = async (userId: string, networth: NetworthEntry) => {
  const command = new PutCommand({
    TableName: NETWORTH_TABLE,
    Item: networth,
  });

  await docClient.send(command);
}

export const updateNetworthItem = async (userId: string, networthItem: NetworthEntry) => {
  const command = new UpdateCommand({
    TableName: NETWORTH_TABLE,
    Key: { 
      userId: userId,
      entryId: networthItem.entryId
    },
    UpdateExpression: 'SET networth = :networth, accounts = :accounts, #date = :date',
    ExpressionAttributeNames: {
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':networth': networthItem.networth,
      ':accounts': networthItem.accounts,
      ':date': networthItem.date
    }
  });

  await docClient.send(command);
}

export const getDBTransactions = async (userId: string) => {
  const command = new ScanCommand({
    TableName: TRANSACTIONS_TABLE,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

export const getBudget = async (userId: string) => {
  const command = new ScanCommand({
    TableName: BUDGET_TABLE,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

export const addBudget = async (userId: string, budget: any) => {
  const command = new PutCommand({
    TableName: BUDGET_TABLE,
    Item: budget,
  });

  await docClient.send(command);
}

export const updateBudget = async (userId: string, budget: any) => {
  const command = new UpdateCommand({
    TableName: BUDGET_TABLE,
    Key: { budgetId: budget.budgetId },
  });

  await docClient.send(command);
}


