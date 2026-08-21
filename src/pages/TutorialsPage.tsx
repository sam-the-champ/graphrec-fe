import { useState } from 'react';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialGrid } from '@/components/tutorials/TutorialGrid';
import { SkeletonGrid } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import type { Difficulty } from '@/types/tutorial';

const PAGE_SIZE = 9;

const difficultyOptions: { label: string; value: Difficulty | undefined }[] = [
  { label: 'All levels', value: undefined },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function TutorialsPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { tutorials, count, isLoading, error, refetch } = useTutorials({
    difficulty,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  function selectDifficulty(value: Difficulty | undefined) {
    setDifficulty(value);
    setPage(0);
  }

  // The backend returns `count` = the number of tutorials in THIS page
  // (not a total count across all pages — tutorial.controller.js sets
  // `count: tutorials.length`). We use it only to detect "there might be
  // a next page" (a full page came back), not as a total for a page-
  // number display.
  const hasNextPage = count === PAGE_SIZE;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Explore tutorials</h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Browse the full catalog, or filter by difficulty.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {difficultyOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => selectDifficulty(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              difficulty === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonGrid count={PAGE_SIZE} />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!isLoading && !error && (
        <>
          <TutorialGrid
            tutorials={tutorials}
            emptyDescription="No tutorials match this filter yet. Try a different level."
          />

          {(page > 0 || hasNextPage) && tutorials.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page + 1}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
