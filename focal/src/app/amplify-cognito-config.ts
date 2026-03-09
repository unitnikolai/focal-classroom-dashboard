"use client";
import { Amplify } from 'aws-amplify';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

const awsAmplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_6VhkFmvxY',
      userPoolClientId: '5a1b9i7tdbp8a23jtbihugp39a',
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
});

Amplify.configure(awsAmplifyConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(cookieStorage);

export default awsAmplifyConfig;
