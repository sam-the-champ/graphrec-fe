import type { Tutorial } from './tutorial';

/**
 * The exact set of traversal-path labels the backend can emit (see
 * RECOMMENDATION_QUERY in recommendation.repository.js), plus the single
 * fallback label used when the graph traversal yields no candidates.
 */
export type RecommendationReason =
  | 'liked_topic_match'
  | 'completed_skill_match'
  | 'related_topic'
  | 'related_skill'
  | 'viewed_topic_match'
  | 'popular_or_recent_fallback';

export interface Recommendation {
  tutorial: Tutorial;
  /** null only for fallback recommendations (usedFallback: true) */
  score: number | null;
  reasons: RecommendationReason[];
  engagementCount: number;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
  usedFallback: boolean;
}
