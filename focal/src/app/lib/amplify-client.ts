"use client";
import { Amplify } from 'aws-amplify';

const awsAmplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_enXp5KADX',
      userPoolClientId: '2qnnauihtehjeifiif9a1qqjmn',
      loginWith: {
        email: true,
        oauth: {
          domain: "focal-auth-portal.auth.us-east-2.amazoncognito.com",
          scopes: [ 'openid', 'email' ],
          redirectSignIn: ["https://4acmiz12d4.execute-api.us-east-2.amazonaws.com/oauth2/callback", "http://localhost:3000"],
          redirectSignOut: ["https://main.deu6lm3uucumx.amplifyapp.com/signin", "http://localhost:3000"],
          responseType: 'code' as const,
        }
      }
    }
  }
}
Amplify.configure(awsAmplifyConfig);
export default awsAmplifyConfig;
