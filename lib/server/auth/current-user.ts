import { cookies } from "next/headers";

import { SESSION_COOKIE, readSessionToken } from "./session";

/**
 * The signed-in citizen's email, or null.
 *
 * Replaces Clerk's `auth()`. The email doubles as the row key in
 * `applications.user_id`: it is the only identifier the OTP flow actually
 * verifies, so it is the only honest thing to key on.
 */
export async function currentUser(): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
