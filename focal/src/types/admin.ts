export interface AdminUser {
  id: string;
  email: string;
  given_name: string | null;
  family_name: string | null;
  admin_status: boolean;
  focal_admin: boolean;
  organization_id: string;
  organization_name: string | null;
  created_at: string;
}

export interface AdminOrganization {
  id: string;
  organization_name: string;
  created_at: string;
  member_count: number;
}

export interface AdminGroupMember {
  id: string;
  email: string;
  given_name: string | null;
  family_name: string | null;
}

export interface AdminGroup {
  group_id: string;
  group_name: string;
  organization_id: string;
  organization_name: string;
  created_at: string;
  members: AdminGroupMember[];
}
