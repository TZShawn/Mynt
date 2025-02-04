This project is a serverless application that uses AWS Lambda and API Gateway and DynamoDB to create a REST API.


# Description
This project is a budget tracker that allows users to track their income and expenses over multiple accounts. This application will use 
the Plaid Financial API to get users accoutn information and transactions. The user should never be able to give permission for plaid to make tranasction on their behalf
only to have the ability to pull and view their transaction data through the /transactions endpoint. 

Data is stored within a DynamoDB table that is very secure as it is a very private access token. Users will be able to create an account using either email and password or some form of SSO. 

# DynamoDB Tables

- mynt-users -> Users: A table to store the users and their access token

# Account storage

- I want to use cognito to store the users and their access tokens. 
- I want to use the free tier of AWS only. This is a small application so I don't want to spend any money. 
- I want to use the free tier of plaid. 
- users should be able to signup using their email and password or some form of SSO like google sign in. 

# How I imagine it working

### Creating an account
1. Users will be on the login/signup page. They will be able to signup using their email and password or some form of SSO. 
2. Once account confirmation is complete, the user will be redirected to the dashboard

### Connecting to a bank account
3. After reaching the dashboard the user is prompted with the plaidAPI modal to connect their bank accounts. Any public tokens are stored in the dynamo table and are only accessible by the user


### Getting transaction data
1. Within the dashboard, using the public access token through a lambda function/gateway, 
2. The user will be able to specify what range of dates that they want to get data for, if not we take the most recent 100 transactions. 
3. The user will be able to call the get-transactions endpoint to get their transaction data from the /transactions endpoint offered by plaid.

# What I need you to do
- Create the dynamoDB table
- Create the lambda functions
- Create eth serverless API
- Integrate the serverless API with API gateway

# IMPORTANT THINGS TO NOTE
- I want to use the free tier of AWS only. This is a small application so I don't want to spend any money. 
- Make sure that token data is secure and that the actual access token sent to plaid is never sent to the frontned through an api endpoint
- The frontend should send a public token to the backend where it is exchanged for an access token that is stored in the dynamoDB table. 
- The frontend should never have access to the access token. 
