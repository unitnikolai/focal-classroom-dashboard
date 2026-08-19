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
  admin_status: boolean;
  focal_admin: boolean;
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
  adminStatus: boolean;
  focalAdmin: boolean;
}

export type ProfileApiResponse = {
  success: boolean;
  data?: UserProfile;
  error?: string;
  message?: string;
};
