import { RecommendationCard } from './RecommendationCard';
import { EmptyState } from '@/components/ui/States';
import type { Recommendation } from '@/types/recommendation';

export function RecommendationGrid({
  recommendations,
  usedFallback,
}: {
  recommendations: Recommendation[];
  usedFallback: boolean;
}) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Once tutorials exist in the catalog, we'll have something to suggest."
      />
    );
  }

  return (
    <div>
      {usedFallback && (
        <p className="mb-3 text-sm text-slate-500">
          You're new here, so these are popular picks. Like or complete a few tutorials and your
          recommendations will get more personal.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.tutorial.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
