import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TutorialMetadata } from './TutorialMetadata';
import type { Tutorial } from '@/types/tutorial';

/**
 * NOTE: only base Tutorial fields are rendered here (title, description,
 * difficulty, duration) because GET /api/tutorials (the list endpoint
 * this card is fed from) does not return topics/skills/instructor/course
 * — see tutorial.repository.js `list()`. Those richer fields only exist
 * on the detail response, so they're rendered on TutorialDetailsPage
 * instead of being guessed at here.
 */
export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Link to={`/tutorials/${tutorial.id}`} className="group block h-full">
      <Card className="flex h-full flex-col p-4 transition-shadow group-hover:shadow-md sm:p-5">
        <h3 className="mb-1.5 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-700">
          {tutorial.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{tutorial.description}</p>
        <TutorialMetadata difficulty={tutorial.difficulty} duration={tutorial.duration} />
      </Card>
    </Link>
  );
}
