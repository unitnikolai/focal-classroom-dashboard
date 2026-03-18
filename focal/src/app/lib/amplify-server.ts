import { createServerRunner } from '@aws-amplify/adapter-nextjs';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: 'us-east-2_enXp5KADX',
        userPoolClientId: '2qnnauihtehjeifiif9a1qqjmn',
        loginWith: {
          email: true
        }
      }
    }
  }
});