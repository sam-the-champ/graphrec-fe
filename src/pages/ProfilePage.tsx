import { useEffect, useState } from 'react';
import * as usersApi from '@/api/users.api';
import { extractErrorMessage } from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, Spinner } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';
import { formatDate } from '@/utils/formatters';
import type { User } from '@/types/user';

/**
 * The backend does not expose an endpoint for "my liked tutorials" or
 * "my completed tutorials" (no GET /api/users/me/liked, /completed,
 * /history, etc. — only the write-side interaction endpoints exist).
 * Per the requirement not to fabricate user activity, this page shows
 * only what GET /api/users/me actually returns, and is explicit about
 * the gap rather than inventing a fake list.
 */
export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState(!authUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    usersApi
      .getCurrentUserProfile()
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container-page py-8 sm:py-10">
        <ErrorState message={error ?? 'Could not load your profile'} />
      </div>
    );
  }

  return (
    <div className="container-page mx-auto max-w-2xl py-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Profile</h1>

      <Card className="p-5 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Member since
            </dt>
            <dd className="mt-1 text-sm text-slate-700">{formatDate(profile.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last updated
            </dt>
            <dd className="mt-1 text-sm text-slate-700">{formatDate(profile.updatedAt)}</dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6 p-5 sm:p-8">
        <h2 className="text-base font-semibold text-slate-900">Learning activity</h2>
        <p className="mt-2 text-sm text-slate-500">
          check your{' '} for now.. learning activity will be available in the future.
          <a href="/dashboard" className="font-medium text-brand-600 hover:text-brand-700">
            recommendations
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
