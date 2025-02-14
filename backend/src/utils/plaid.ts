import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

import dotenv from 'dotenv';

dotenv.config();

const plaidEnv = process.env.PLAIDENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[plaidEnv],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAIDCLIENTID,
      'PLAID-SECRET': process.env.PLAIDSECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

export const plaidClient = new PlaidApi(configuration); 
