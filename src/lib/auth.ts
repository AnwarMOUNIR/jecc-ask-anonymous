import { cookies } from 'next/headers';

export async function verifyAdminSession(request?: Request): Promise<boolean> {
  // Check header authorization token fallback
  if (request) {
    const authHeader = request.headers.get('authorization');
    const adminPass = process.env.ADMIN_PASSWORD || 'clubSecretPass2026';
    if (authHeader && authHeader === `Bearer ${adminPass}`) {
      return true;
    }
  }

  // Check cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('jecc_admin_session');
  return session?.value === 'authenticated';
}
