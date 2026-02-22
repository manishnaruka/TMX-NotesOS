import type { Timestamp } from 'firebase/firestore';

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapJSON {
  type: 'doc';
  content: TiptapNode[];
}

export interface NoteUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: TiptapJSON;
  plainTextPreview: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPinned: boolean;
  isDeleted: boolean;
  userId: string;
  tags: string[];
  createdBy: NoteUserInfo;
  lastEditedBy: NoteUserInfo;
  assignedTo: string[];
}

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface AllowedUser {
  id: string;
  email: string;
  role: UserRole;
  addedBy: string;
  addedAt: Timestamp;
}
