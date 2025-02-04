import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

export const authenticateUser = async (username: string, password: string) => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);
    return response.AuthenticationResult;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const signUpUser = async (username: string, password: string, email: string) => {
  try {
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    return await cognitoClient.send(command);
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}; 