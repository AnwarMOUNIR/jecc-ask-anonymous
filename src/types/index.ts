export type IssueCategory =
  | 'Machine Malfunction'
  | 'Booking & Reservation'
  | 'Payment & Tokens'
  | 'Web UI & Responsive'
  | 'Login & Session'
  | 'Notification Alert'
  | 'Facility & Cleanliness'
  | 'Other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type PlatformDevice =
  | 'Android'
  | 'iPhone'
  | 'iPad'
  | 'Mac'
  | 'Windows'
  | 'Linux'
  | 'Other';

export type PlatformBrowser =
  | 'Safari'
  | 'Chrome'
  | 'Firefox'
  | 'Edge'
  | 'Samsung Internet'
  | 'In-App Webview'
  | 'PWA'
  | 'Other';

export interface PlatformDetails {
  device: PlatformDevice | string;
  browser: PlatformBrowser | string;
  osVersion?: string;
  browserVersion?: string;
  screenResolution?: string;
  customDetails?: string;
}

export interface MachineInfo {
  room?: string; // e.g. "Lavoir Résidence A", "Lavoir Résidence B"
  machineNumber?: string; // e.g. "Machine à laver #3", "Sèche-linge #2"
}

export interface LaundryIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  platform: PlatformDetails;
  machine_info?: MachineInfo;
  author_name?: string;
  author_email: string;
  author_room?: string;
  screenshots?: string[]; // Array of image URLs (uploaded or linked)
  video_url?: string | null; // Video file URL or Loom / reproduction link
  status: IssueStatus;
  admin_notes?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
