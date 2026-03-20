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
  name: string;
  deviceName: string;
  deviceStatus: DeviceStatus;
  attendanceStatus: AttendanceStatus;
  joinTime?: string;
  exemption?: StudentExemption;
  statusSince?: string;
}

export type DeviceFilter = "all" | "active" | "exempted" | "inactive" | "unactivated";

export interface GlobalBlock {
  isActive: boolean;
  socialMedia: boolean;
  games: boolean;
  messaging: boolean;
  browsers: boolean;
}