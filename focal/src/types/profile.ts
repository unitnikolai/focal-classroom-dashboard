/**
 * Profile and User Information Types
 * Used for fetching and managing user profile data from the API
 */

/** Shape returned by the profile-query Lambda */
export interface BackendUserProfile {
  email: string;
  given_name: string;
  family_name: string;
  organization_id: string;
}

export interface PersonalInfo {
  givenName: string;
  lastName: string;
  email: string;
  organizationId: string;
}

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
}

export type ProfileApiResponse = {
  success: boolean;
  data?: UserProfile;
  error?: string;
  message?: string;
};
