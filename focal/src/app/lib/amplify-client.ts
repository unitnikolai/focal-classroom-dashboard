"use client";
import { Amplify } from 'aws-amplify';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

const awsAmplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_enXp5KADX',
      userPoolClientId: '2qnnauihtehjeifiif9a1qqjmn',
      loginWith: {
        email: true
      }
    }
  }
}

// Configure secure cookie storage for JWT tokens
const cookieStorage = new CookieStorage({
  secure: true,
  sameSite: 'strict',
  path: '/',
  expires: 365,
});

Amplify.configure(awsAmplifyConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(cookieStorage);

export default awsAmplifyConfig;
