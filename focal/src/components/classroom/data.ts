import { Student, Group } from "./types";

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const MOCK_STUDENTS: Student[] = [
  { id: "1",  name: "Aisha Malik",      deviceName: "iPhone 14 Pro",  deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:02 AM", statusSince: minsAgo(52) },
  { id: "2",  name: "James Carter",     deviceName: "iPhone 13",      deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:01 AM", statusSince: minsAgo(53) },
  { id: "3",  name: "Priya Nair",       deviceName: "Samsung S23",    deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:03 AM", statusSince: minsAgo(51) },
  { id: "4",  name: "Leo Fernandez",    deviceName: "iPhone 15",      deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:00 AM", statusSince: minsAgo(54) },
  { id: "5",  name: "Sara Kim",         deviceName: "Pixel 7",        deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:04 AM", statusSince: minsAgo(50) },
  { id: "6",  name: "Omar Yusuf",       deviceName: "iPhone 13 Mini", deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:01 AM", statusSince: minsAgo(53) },
  { id: "7",  name: "Chloe Zhang",      deviceName: "iPhone 14",      deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:05 AM", statusSince: minsAgo(49) },
  { id: "8",  name: "Noah Williams",    deviceName: "Samsung A54",    deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:02 AM", statusSince: minsAgo(52) },
  { id: "9",  name: "Fatima Al-Hassan", deviceName: "iPhone 12",      deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:03 AM", statusSince: minsAgo(51) },
  { id: "10", name: "Ethan Brooks",     deviceName: "Pixel 8",        deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:00 AM", statusSince: minsAgo(54) },
  { id: "11", name: "Mei Liu",          deviceName: "iPhone 15 Pro",  deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:06 AM", statusSince: minsAgo(48) },
  { id: "12", name: "Arjun Patel",      deviceName: "OnePlus 12",     deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:01 AM", statusSince: minsAgo(53) },
  { id: "13", name: "Sophia Turner",    deviceName: "iPhone 14 Plus", deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:04 AM", statusSince: minsAgo(50) },
  { id: "14", name: "Liam Johnson",     deviceName: "Samsung S22",    deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:02 AM", statusSince: minsAgo(52) },
  { id: "15", name: "Zara Ahmed",       deviceName: "iPhone 13 Pro",  deviceStatus: "active",      attendanceStatus: "present", joinTime: "9:03 AM", statusSince: minsAgo(51) },
  { id: "16", name: "Tyler Ross",       deviceName: "iPhone 11",      deviceStatus: "inactive",    attendanceStatus: "late",    joinTime: undefined,   statusSince: minsAgo(18) },
  { id: "17", name: "Hannah Scott",     deviceName: "Pixel 6a",       deviceStatus: "inactive",    attendanceStatus: "late",    joinTime: undefined,   statusSince: minsAgo(34) },
  { id: "18", name: "Marcus Bell",      deviceName: "Samsung A34",    deviceStatus: "inactive",    attendanceStatus: "present", joinTime: "9:10 AM", statusSince: minsAgo(7)  },
  { id: "19", name: "Nina Clarke",      deviceName: "iPhone SE",      deviceStatus: "inactive",    attendanceStatus: "late",    joinTime: undefined,   statusSince: minsAgo(61) },
  { id: "20", name: "Daniel Park",      deviceName: "Unknown device", deviceStatus: "unactivated", attendanceStatus: "absent",  joinTime: undefined,   statusSince: undefined },
  { id: "21", name: "Isla Murray",      deviceName: "Unknown device", deviceStatus: "unactivated", attendanceStatus: "absent",  joinTime: undefined,   statusSince: undefined },
  { id: "22", name: "Ryan Walsh",       deviceName: "Unknown device", deviceStatus: "unactivated", attendanceStatus: "absent",  joinTime: undefined,   statusSince: undefined },
];

export const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "04:00-12:00 Shift 1",          memberIds: ["1", "2", "3", "4", "5", "6", "7"] },
  { id: "g2", name: "06:00-14:00 Shift 2",      memberIds: ["3", "5", "8", "9", "10", "11", "12"] },
  { id: "g3", name: "09:00-17:00 Shift 3",  memberIds: ["1", "4", "6", "7", "13", "14", "15", "16", "17", "18"] },
  { id: "g4", name: "10:00-18:00 Shift 4",           memberIds: ["2", "8", "9", "11", "19", "20", "21", "22"] },
];