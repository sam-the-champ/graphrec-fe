import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import * as tutorialsApi from '@/api/tutorials.api';
import { extractErrorMessage } from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, Spinner } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { DifficultyBadge, TopicBadge, SkillBadge } from '@/components/tutorials/TutorialMetadata';
import type { TutorialDetail } from '@/types/tutorial';

/**
 * Merges "tutorial details" and "the learning experience" into a single
 * page/route rather than a separate /learn/:id page. The backend has no
 * concept of tracked in-app content playback beyond a `contentUrl` link
 * and the view/like/complete relationship endpoints — there's no lesson
 * player, no step tracking, nothing a distinct "learning page" would
 * meaningfully show that this page doesn't already cover. Splitting them
 * would just add a redundant route around the same three buttons.
 *
 * UPDATE: GET /api/tutorials/:id now returns userHasViewed/userHasLiked/
 * userHasCompleted whenever the request carries a valid token
 * (optionalAuth middleware on that route, tutorial.repository.js
 * findById()). Button state below is seeded from those flags on load,
 * so "Liked ✓" / "Completed ✓" now survive a page reload — they're no
 * longer session-only. For a logged-out visitor, these flags are always
 * false (there's no "current user" to check against), which is correct,
 * not a bug.
 */
export default function TutorialDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [tutorial, setTutorial] = useState<TutorialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasViewed, setHasViewed] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Guards against firing the VIEWED request twice for the same tutorial
  // id (e.g. React 18 StrictMode's dev-only double-invoke, or an
  // unrelated re-render) — it should fire once per tutorial actually
  // opened, not once per render.
  const viewedTutorialId = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    tutorialsApi
      .getTutorialById(id)
      .then((result) => {
        if (cancelled) return;
        setTutorial(result);
        // Seed button state from the backend's per-user flags instead of
        // always starting blank — this is what makes "Liked ✓" /
        // "Completed ✓" survive a page reload now.
        setHasViewed(result.userHasViewed);
        setHasLiked(result.userHasLiked);
        setHasCompleted(result.userHasCompleted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    // POST /tutorials/:id/view requires auth (see tutorial.routes.js) —
    // skip entirely for logged-out visitors rather than firing a request
    // we know will 401.
    if (!id || !isAuthenticated || viewedTutorialId.current === id) return;
    viewedTutorialId.current = id;

    tutorialsApi
      .viewTutorial(id)
      .then(() => setHasViewed(true))
      .catch(() => {
        // A failed view-tracking call shouldn't block reading the page —
        // fail silently here rather than surfacing a disruptive error for
        // a background analytics-style action.
      });
  }, [id, isAuthenticated]);

  async function handleLike() {
    if (!id || isLiking) return;
    setIsLiking(true);
    setActionError(null);
    try {
      await tutorialsApi.likeTutorial(id);
      setHasLiked(true);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setIsLiking(false);
    }
  }

  async function handleComplete() {
    if (!id || isCompleting) return;
    setIsCompleting(true);
    setActionError(null);
    try {
      await tutorialsApi.completeTutorial(id);
      setHasCompleted(true);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="container-page py-8 sm:py-10">
        <ErrorState message={error ?? 'Tutorial not found'} />
      </div>
    );
  }

  return (
    <div className="container-page mx-auto max-w-3xl py-8 sm:py-10">
      <Link to="/tutorials" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Back to tutorials
      </Link>

      <Card className="p-5 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={tutorial.difficulty} />
          <span className="text-xs text-slate-400">{tutorial.duration} min</span>
          {hasViewed && <span className="text-xs text-slate-400">· viewed</span>}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{tutorial.title}</h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">{tutorial.description}</p>

        {(tutorial.instructor || tutorial.course) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            {tutorial.instructor && <span>Taught by {tutorial.instructor.name}</span>}
            {tutorial.course && <span>Part of {tutorial.course.title}</span>}
          </div>
        )}

        {tutorial.topics.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tutorial.topics.map((topic) => (
                <TopicBadge key={topic.id} name={topic.name} />
              ))}
            </div>
          </div>
        )}

        {tutorial.skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Skills you'll build
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tutorial.skills.map((skill) => (
                <SkillBadge key={skill.id} name={skill.name} />
              ))}
            </div>
          </div>
        )}

        {actionError && (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          {tutorial.contentUrl && (
            <a href={tutorial.contentUrl} target="_blank" rel="noopener noreferrer">
              <Button fullWidth className="sm:w-auto">
                Start learning
              </Button>
            </a>
          )}

          {isAuthenticated ? (
            <>
              <Button
                variant={hasLiked ? 'secondary' : 'outline'}
                fullWidth
                className="sm:w-auto"
                isLoading={isLiking}
                onClick={handleLike}
              >
                {hasLiked ? 'Liked ✓' : 'Like'}
              </Button>
              <Button
                variant={hasCompleted ? 'secondary' : 'outline'}
                fullWidth
                className="sm:w-auto"
                isLoading={isCompleting}
                onClick={handleComplete}
              >
                {hasCompleted ? 'Completed ✓' : 'Mark complete'}
              </Button>
            </>
          ) : (
            <Link to="/login" state={{ from: location.pathname }} className="w-full sm:w-auto">
              <Button variant="outline" fullWidth>
                Log in to like or track progress
              </Button>
            </Link>
          )}
        </div>

        {hasCompleted && (
          <p className="mt-4 text-sm text-slate-500">
            Nice work. Your{' '}
            <Link to="/dashboard" className="font-medium text-brand-600 hover:text-brand-700">
              recommendations
            </Link>{' '}
            will reflect this the next time they're generated.
          </p>
        )}
      </Card>
    </div>
  );
}
