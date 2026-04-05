'use server';
import { cookies } from 'next/headers';

export async function getRemaining() {
  const authCookie = (await cookies()).get("auth");
  if (authCookie) {
    const cookieValue = JSON.parse(authCookie.value);
    const remaining = cookieValue.remaining;
    return remaining;
  }else {
    return 5;
  }
}