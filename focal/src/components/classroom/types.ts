export type DeviceStatus = "active" | "inactive" | "unactivated";

export type AttendanceStatus = "present" | "late" | "absent";

export interface StudentExemption {
  socialMedia: boolean;
  games: boolean;
  messaging: boolean;
  browsers: boolean;
}

export interface Student {
  id: string;
  userId?: string;
  name: string;
  deviceName: string;
  deviceStatus: DeviceStatus;
  attendanceStatus: AttendanceStatus;
  joinTime?: string;
  exemption?: StudentExemption;
  statusSince?: string;
  groupId?: string;
}

export type DeviceFilter = "all" | "active" | "exempted" | "inactive" | "unactivated";

export interface GlobalBlock {
  isActive: boolean;
  socialMedia: boolean;
  games: boolean;
  messaging: boolean;
  browsers: boolean;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}