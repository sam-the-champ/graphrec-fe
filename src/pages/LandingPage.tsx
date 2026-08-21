import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialGrid } from '@/components/tutorials/TutorialGrid';
import { SkeletonGrid } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { tutorials, isLoading, error, refetch } = useTutorials({ limit: 6 });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Learn smarter through personalized recommendations.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              GraphRec maps how tutorials, topics, and skills connect to each other — and to what
              you've watched, liked, and completed — so the next tutorial you see actually follows
              from what you already know.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" fullWidth className="sm:w-auto">
                    Go to your dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" fullWidth className="sm:w-auto">
                      Create a free account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <Card className="p-6">
            <p className="mb-4 text-sm font-medium text-slate-500">How it works</p>
            <ol className="space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  1
                </span>
                You view, like, or complete a tutorial.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  2
                </span>
                That creates a relationship in a graph — connecting you to the tutorial's topics
                and skills.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  3
                </span>
                The recommendation engine follows those connections — including related topics and
                skills — to find tutorials genuinely close to your interests.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  4
                </span>
                Every recommendation you get is tagged with why it was suggested.
              </li>
            </ol>
          </Card>
        </div>
      </section>

      {/* Featured content */}
      <section className="container-page py-14 sm:py-20">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Explore what's on GraphRec
          </h2>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            A sample of the tutorials in the catalog right now.
          </p>
        </div>

        {isLoading && <SkeletonGrid count={6} />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!isLoading && !error && <TutorialGrid tutorials={tutorials} />}

        <div className="mt-8 text-center">
          <Link to="/tutorials">
            <Button variant="outline">Browse all tutorials</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
