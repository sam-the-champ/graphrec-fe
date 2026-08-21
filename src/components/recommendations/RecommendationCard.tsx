import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TutorialMetadata } from '@/components/tutorials/TutorialMetadata';
import { ReasonBadge } from './ReasonBadge';
import type { Recommendation } from '@/types/recommendation';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { tutorial, reasons, score } = recommendation;

  return (
    <Link to={`/tutorials/${tutorial.id}`} className="group block h-full">
      <Card className="flex h-full flex-col p-4 transition-shadow group-hover:shadow-md sm:p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {reasons.map((reason) => (
            <ReasonBadge key={reason} reason={reason} />
          ))}
        </div>
        <h3 className="mb-1.5 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-700">
          {tutorial.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{tutorial.description}</p>
        <div className="flex items-center justify-between">
          <TutorialMetadata difficulty={tutorial.difficulty} duration={tutorial.duration} />
          {score !== null && (
            <span className="whitespace-nowrap text-xs font-medium text-slate-400">
              match score {score.toFixed(1)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
