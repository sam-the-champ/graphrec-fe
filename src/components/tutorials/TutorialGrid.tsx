import { TutorialCard } from './TutorialCard';
import { EmptyState } from '@/components/ui/States';
import type { Tutorial } from '@/types/tutorial';

export function TutorialGrid({
  tutorials,
  emptyTitle = 'No tutorials found',
  emptyDescription = 'Try adjusting your filters, or check back later.',
}: {
  tutorials: Tutorial[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (tutorials.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {tutorials.map((tutorial) => (
        <TutorialCard key={tutorial.id} tutorial={tutorial} />
      ))}
    </div>
  );
}
