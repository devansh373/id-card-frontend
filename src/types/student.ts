export type PhotoStatus = 'NOT_UPLOADED' | 'UPLOADED' | 'APPROVED';
export type PrintStatus = 'PENDING' | 'READY' | 'PRINTED' | 'DELIVERED';

export interface Student {
  id: number;
  aparIdOrPan: string;
  rollNo?: string;
  name: string;
  dateOfBirth?: string;
  currentAddress?: string;
  guardianMobileNo?: string;
  gender?: string;
  religion?: string;
  bloodGroup?: string;
  
  schoolId: number;
  classId: number;
  sectionId: number;
  
  photoUrl?: string;
  photoStatus: PhotoStatus;
  printStatus: PrintStatus;
  
  // Relations that will be returned by Prisma include mapping
  class?: { id: number; name: string };
  section?: { id: number; name: string };
}

export interface GetStudentsResponse {
  students: Student[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: number;
  sectionId?: number;
}
