export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Base tutorial shape — what GET /api/tutorials (list) and
 * POST /api/tutorials return. NOTE: the list/create endpoints do NOT
 * include topics/skills/instructor/course (see tutorial.repository.js
 * `list()` — it only returns `toPlainObject(t.properties)`).
 */
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  contentUrl?: string | null;
  difficulty: Difficulty;
  duration: number; // minutes
  createdAt: string;
  updatedAt?: string;
}

export interface TutorialTopicRef {
  id: string;
  name: string;
  slug: string;
}

export interface TutorialSkillRef {
  id: string;
  name: string;
  slug: string;
}

export interface TutorialInstructorRef {
  id: string;
  name: string;
}

export interface TutorialCourseRef {
  id: string;
  title: string;
}

/**
 * Extended shape returned ONLY by GET /api/tutorials/:id
 * (tutorial.repository.js `findById()`). The three `userHas*` flags are
 * only meaningful when the request carried a valid token (optionalAuth
 * on that route) — for anonymous requests they always come back false,
 * not because the user hasn't interacted, but because there's no user.
 */
export interface TutorialDetail extends Tutorial {
  topics: TutorialTopicRef[];
  skills: TutorialSkillRef[];
  instructor: TutorialInstructorRef | null;
  course: TutorialCourseRef | null;
  userHasViewed: boolean;
  userHasLiked: boolean;
  userHasCompleted: boolean;
}

export interface CreateTutorialPayload {
  title: string;
  description: string;
  contentUrl?: string;
  difficulty: Difficulty;
  duration: number;
  topicIds?: string[];
  skillIds?: string[];
  courseId?: string;
  instructorId?: string;
}

export interface ListTutorialsParams {
  difficulty?: Difficulty;
  limit?: number;
  offset?: number;
}

/** POST /api/tutorials/:id/view response.interaction */
export interface ViewInteraction {
  viewCount: number;
  firstViewedAt: string;
  lastViewedAt: string;
}

/** POST /api/tutorials/:id/like response.interaction */
export interface LikeInteraction {
  createdAt: string;
}

/** POST /api/tutorials/:id/complete response.interaction */
export interface CompleteInteraction {
  completedAt: string;
  progress: number;
}
