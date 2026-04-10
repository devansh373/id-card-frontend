export interface Section {
  id: number;
  name: string;
  classId: number;
}

export interface Class {
  id: number;
  name: string;
  schoolId: number;
  sections?: Section[];
}

export interface CreateClassPayload {
  name: string;
}

export interface UpdateClassPayload {
  name: string;
}

export interface CreateSectionPayload {
  name: string;
}

export interface UpdateSectionPayload {
  name: string;
}
