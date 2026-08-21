/**
 * Matches the object returned by userRepository's toPublicUser()
 * (passwordHash is stripped server-side, never sent to the client).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
