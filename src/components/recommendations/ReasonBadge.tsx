import { Badge } from '@/components/ui/Badge';
import type { RecommendationReason } from '@/types/recommendation';

/**
 * These are display labels for the exact reason codes the backend emits
 * (see RECOMMENDATION_QUERY in recommendation.repository.js) — a
 * translation of real data into readable text, not invented content.
 */
const reasonLabels: Record<RecommendationReason, string> = {
  liked_topic_match: 'Because you liked a similar topic',
  completed_skill_match: 'Because you completed a related skill',
  related_topic: 'Related to a topic you liked',
  related_skill: 'Related to a skill you completed',
  viewed_topic_match: 'Because you viewed a similar topic',
  popular_or_recent_fallback: 'Popular right now',
};

export function ReasonBadge({ reason }: { reason: RecommendationReason }) {
  return <Badge tone={reason === 'popular_or_recent_fallback' ? 'slate' : 'brand'}>{reasonLabels[reason]}</Badge>;
}
