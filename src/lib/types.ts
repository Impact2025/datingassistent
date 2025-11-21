export type UserProfile = {
  name: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  lookingFor: string | null;
  bio: string | null;
  interests: string[];
  location: string | null;
  photos: string[];
  // Skills assessment fields
  datingExperience?: 'beginner' | 'intermediate' | 'advanced';
  strengths?: string[];
  areasForImprovement?: string[];
  // Optional legacy fields
  seekingGender?: string[];
  seekingAgeMin?: number;
  seekingAgeMax?: number;
  seekingType?: string;
  identityGroup?: string;
};

// Community features are now in ExtendedUserProfile
export type ExtendedUserProfile = UserProfile & {
  id: number;
  userId: number;
  bio: string | null;
  location: string | null;
  interests: string[];
  profilePictureUrl: string | null;
  coverPhotoUrl: string | null;
  joinDate: string;
  lastActive: string;
  reputationPoints: number;
  createdAt: string;
  updatedAt: string;
};

export type Badge = {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  criteria: string; // JSON describing how to earn this badge
  createdAt: string;
};

export type UserBadge = {
  id: number;
  userId: number;
  badgeId: number;
  badge: Badge;
  earnedAt: string;
};

export type ForumCategory = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
};

export type ForumPost = {
  id: number;
  categoryId: number;
  userId: number;
  title: string;
  content: string;
  views: number;
  repliesCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    profilePictureUrl?: string | null;
  };
  category?: ForumCategory;
};

export type ForumReply = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    profilePictureUrl?: string | null;
  };
};

export const GENDERS = ["Man", "Vrouw", "Non-binair", "Anders/Zeg ik liever niet"];
export const SEEKING_GENDERS = ["Mannen", "Vrouwen", "Non-binaire personen"];
export const RELATIONSHIP_TYPES = ["een serieuze relatie", "iets casuals", "sta open voor alles"];
export const IDENTITY_GROUPS = ["algemeen", "lhbtq+", "50+", "beperking", "hoogopgeleid", "christelijk"];