// Create this file: app/api/debug/cognito/route.ts
// This will help us debug the configuration

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const config = {
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ? 'Set' : 'Missing',
    COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET ? 'Set' : 'Missing',
    COGNITO_REGION: process.env.COGNITO_REGION || 'Missing',
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'Missing',
    COGNITO_HOSTED_UI_URL: process.env.COGNITO_HOSTED_UI_URL || 'Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing',
    issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    authorization: `${process.env.COGNITO_HOSTED_UI_URL}/oauth2/authorize`,
    token: `${process.env.COGNITO_HOSTED_UI_URL}/oauth2/token`,
    userinfo: `${process.env.COGNITO_HOSTED_UI_URL}/oauth2/userInfo`,
  };

  return NextResponse.json(config);
}