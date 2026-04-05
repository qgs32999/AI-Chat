'use server';
import { cookies } from 'next/headers';

export async function getRemaining() {
  const authCookie = (await cookies()).get("auth");
  if (authCookie) {
    const cookieValue = JSON.parse(authCookie.value);
    const remaining = cookieValue.remaining;
    return remaining;
  }else {
    return process.env.REMAINING_QUOTA ? Number(process.env.REMAINING_QUOTA) + 1 : 10;
  }
}