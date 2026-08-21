import { Badge } from '@/components/ui/Badge';
import type { Difficulty } from '@/types/tutorial';

const difficultyTone: Record<Difficulty, 'green' | 'amber' | 'red'> = {
  beginner: 'green',
  intermediate: 'amber',
  advanced: 'red',
};

const difficultyLabel: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={difficultyTone[difficulty]}>{difficultyLabel[difficulty]}</Badge>;
}

export function TopicBadge({ name }: { name: string }) {
  return <Badge tone="brand">{name}</Badge>;
}

export function SkillBadge({ name }: { name: string }) {
  return <Badge tone="slate">{name}</Badge>;
}

export function TutorialMetadata({
  difficulty,
  duration,
}: {
  difficulty: Difficulty;
  duration: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <DifficultyBadge difficulty={difficulty} />
      <span className="inline-flex items-center gap-1">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {duration} min
      </span>
    </div>
  );
}
