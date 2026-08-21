import { apiClient } from './axios';
import type { ApiSuccess } from '@/types/api';
import type {
  CompleteInteraction,
  CreateTutorialPayload,
  LikeInteraction,
  ListTutorialsParams,
  Tutorial,
  TutorialDetail,
  ViewInteraction,
} from '@/types/tutorial';

export async function getTutorials(
  params: ListTutorialsParams = {}
): Promise<{ tutorials: Tutorial[]; count: number }> {
  const res = await apiClient.get<ApiSuccess<{ tutorials: Tutorial[]; count: number }>>(
    '/tutorials',
    { params }
  );
  return res.data.data;
}

export async function getTutorialById(id: string): Promise<TutorialDetail> {
  const res = await apiClient.get<ApiSuccess<{ tutorial: TutorialDetail }>>(`/tutorials/${id}`);
  return res.data.data.tutorial;
}

export async function createTutorial(payload: CreateTutorialPayload): Promise<Tutorial> {
  const res = await apiClient.post<ApiSuccess<{ tutorial: Tutorial }>>('/tutorials', payload);
  return res.data.data.tutorial;
}

// Interactions live in this module (rather than a separate
// interactions.api.ts) for the same reason they live inside
// tutorial.routes.js on the backend: they're sub-resources of a specific
// tutorial (`/tutorials/:id/view`), not an independent resource.

export async function viewTutorial(id: string): Promise<ViewInteraction> {
  const res = await apiClient.post<ApiSuccess<{ interaction: ViewInteraction }>>(
    `/tutorials/${id}/view`
  );
  return res.data.data.interaction;
}

export async function likeTutorial(id: string): Promise<LikeInteraction> {
  const res = await apiClient.post<ApiSuccess<{ interaction: LikeInteraction }>>(
    `/tutorials/${id}/like`
  );
  return res.data.data.interaction;
}

export async function completeTutorial(id: string): Promise<CompleteInteraction> {
  const res = await apiClient.post<ApiSuccess<{ interaction: CompleteInteraction }>>(
    `/tutorials/${id}/complete`
  );
  return res.data.data.interaction;
}
