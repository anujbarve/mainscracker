# Setup Guide

## Environment Variables

To fix the "Maximum call stack size exceeded" error, you need to set up the required environment variables.

1. Create a `.env.local` file in the `frontend` directory with the following content:

```env
# Amplify Cognito Configuration
# Replace these with your actual AWS Cognito values
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id-here
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-user-pool-client-id-here
```

2. Replace the placeholder values with your actual AWS Cognito User Pool ID and User Pool Client ID.

## Issues Fixed

The following issues have been resolved:

1. **Middleware Infinite Loop**: Updated the middleware matcher to exclude auth routes (`/auth/*`) to prevent infinite redirects.

2. **Amplify Configuration**: Added error handling and prevented multiple Amplify configurations.

3. **Missing Environment Variables**: Added fallback values to prevent configuration errors.

4. **useIsMobile Hook**: Added client-side check to prevent SSR issues.

5. **Authentication Issues**: Fixed "There is already a signed in user" error by:
   - Adding session state checking before sign in
   - Implementing force sign out functionality
   - Adding automatic retry mechanism for stuck sessions
   - Adding debug tools for troubleshooting

## Running the Application

After setting up the environment variables, run:

```bash
cd frontend
npm run dev
```

The application should now start without the "Maximum call stack size exceeded" error.

## Troubleshooting Authentication Issues

If you encounter "There is already a signed in user" error:

1. **Visit the debug page**: Navigate to `/debug` to check your current authentication state
2. **Use Force Sign Out**: Click the "Force Sign Out" button to clear any stuck sessions
3. **Clear session manually**: Use the "Clear session and try again" button on the login page
4. **Check browser console**: Look for detailed logs about the authentication process

## Debug Tools

- **Debug Page**: Visit `/debug` to check authentication state and clear sessions
- **Console Logs**: Check browser console for detailed authentication logs
- **Force Sign Out**: Use the force sign out function to clear stuck sessions 