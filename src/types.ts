/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Reporter {
  name: string;
  userId: string;
  type: 'student' | 'teacher';
  department: string;
  phone: string;
  email: string;
}

export interface JobDetails {
  title: string;
  category: 'งานสื่อ' | 'งานระบบ' | 'งานเอกสาร';
  description: string;
}

export interface Timeline {
  createdAt: string; // ISO String
  deadline: string; // ISO String
  completedAt: string | null; // ISO String
}

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Ticket {
  ticketId: string;
  reporter: Reporter;
  jobDetails: JobDetails;
  attachments: string[];
  timeline: Timeline;
  status: TicketStatus;
  assignedTo: string | null; // Name or ID of the assigned staff member
  adminNote: string;
  satisfactionScore: number | null; // Rating 1-5
  satisfactionComment?: string; // Optional feedback
}

export interface LDOStaff {
  id: string;
  name: string;
  role: string;
  specialty: 'งานสื่อ' | 'งานระบบ' | 'งานเอกสาร' | 'ทั่วไป';
  avatar: string;
}
