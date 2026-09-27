import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  const isAuthorized = await verifyAdminSession(request);
  return NextResponse.json({ authenticated: isAuthorized });
}
