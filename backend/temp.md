endpoints:
  POST - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/plaid/create-link-token
  POST - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/plaid/exchange-token
  GET - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/transactions
  POST - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/auth/signup
  POST - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/auth/confirm
  POST - https://2dp08rr9rc.execute-api.us-east-1.amazonaws.com/dev/auth/signin
functions:
  createLinkToken: mynt-budget-tracker-dev-createLinkToken (15 MB)
  exchangePublicToken: mynt-budget-tracker-dev-exchangePublicToken (15 MB)
  getTransactions: mynt-budget-tracker-dev-getTransactions (15 MB)
  signUp: mynt-budget-tracker-dev-signUp (15 MB)
  confirmSignUp: mynt-budget-tracker-dev-confirmSignUp (15 MB)
  signIn: mynt-budget-tracker-dev-signIn (15 MB)


  