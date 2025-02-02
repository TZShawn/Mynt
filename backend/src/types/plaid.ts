export interface PlaidUser {
  userId: string;
  accessToken: string;
  itemId: string;
  institutionId?: string;
  institutionName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRequest {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface APIResponse {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
  body: string;
} 