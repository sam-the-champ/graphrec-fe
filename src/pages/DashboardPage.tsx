import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useTutorials } from '@/hooks/useTutorials';
import { RecommendationGrid } from '@/components/recommendations/RecommendationGrid';
import { TutorialGrid } from '@/components/tutorials/TutorialGrid';
import { SectionHeading, SkeletonGrid } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const recommendations = useRecommendations(6);
  const recent = useTutorials({ limit: 6, offset: 0 });

  return (
    <div className="container-page space-y-10 py-8 sm:space-y-12 sm:py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Continue learning and discover something new.
        </p>
      </div>

      <section>
        <SectionHeading
          title="Recommended for you"
          subtitle="Based on the tutorials you've viewed, liked, and completed."
          action={
            <Button variant="ghost" size="sm" onClick={recommendations.refetch}>
              Refresh
            </Button>
          }
        />
        {recommendations.isLoading && <SkeletonGrid count={3} />}
        {recommendations.error && (
          <ErrorState message={recommendations.error} onRetry={recommendations.refetch} />
        )}
        {!recommendations.isLoading && !recommendations.error && (
          <RecommendationGrid
            recommendations={recommendations.recommendations}
            usedFallback={recommendations.usedFallback}
          />
        )}
      </section>

      <section>
        <SectionHeading
          title="Explore the catalog"
          subtitle="Browse recently added tutorials."
          action={
            <Link to="/tutorials">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          }
        />
        {recent.isLoading && <SkeletonGrid count={6} />}
        {recent.error && <ErrorState message={recent.error} onRetry={recent.refetch} />}
        {!recent.isLoading && !recent.error && <TutorialGrid tutorials={recent.tutorials} />}
      </section>
    </div>
  );
}
