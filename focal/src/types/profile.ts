/**
 * Profile Stats and User Information Types
 * Used for fetching and managing user profile data from the API
 */

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface PersonalInfo {
  givenName: string;
  lastName: string;
  email: string;
  organizationName: string;
  avatarUrl?: string;
}

export interface ProfileStats {
  totalSessions?: number;
  activeDevices?: number;
  organizationsManaged?: number;
  joinDate?: string;
  lastActive?: string;
}

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  socialLinks?: SocialLinks;
  stats?: ProfileStats;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Example API Response Structure
 */
export type ProfileApiResponse = {
  success: boolean;
  data?: UserProfile;
  error?: string;
  message?: string;
};

/**
 * Example Usage in Component:
 * 
 * const [profile, setProfile] = useState<UserProfile | null>(null);
 * const [loading, setLoading] = useState(true);
 * const [error, setError] = useState<string | null>(null);
 * 
 * useEffect(() => {
 *   const fetchProfile = async () => {
 *     try {
 *       const res = await fetch('/api/profile', { credentials: 'include' });
 *       const data: ProfileApiResponse = await res.json();
 *       if (data.success && data.data) {
 *         setProfile(data.data);
 *       } else {
 *         setError(data.error || 'Failed to load profile');
 *       }
 *     } catch (err) {
 *       setError('Error fetching profile');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   fetchProfile();
 * }, []);
 */
