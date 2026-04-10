import { api } from '@/lib/api/client';
import type { 
  Class, 
  Section, 
  CreateClassPayload, 
  UpdateClassPayload, 
  CreateSectionPayload, 
  UpdateSectionPayload 
} from '@/types/academic';

export const academicService = {
  // --- Classes ---
  getClasses: async (): Promise<Class[]> => {
    const res = await api.get<{ classes: Class[] }>('/classes');
    return res.data.classes;
  },

  createClass: async (payload: CreateClassPayload): Promise<Class> => {
    const res = await api.post<{ class: Class }>('/classes', payload);
    return res.data.class;
  },

  updateClass: async (classId: number, payload: UpdateClassPayload): Promise<Class> => {
    const res = await api.put<{ class: Class }>(`/classes/${classId}`, payload);
    return res.data.class;
  },

  deleteClass: async (classId: number): Promise<void> => {
    await api.delete(`/classes/${classId}`);
  },

  // --- Sections ---
  getSections: async (classId: number): Promise<Section[]> => {
    const res = await api.get<{ sections: Section[] }>(`/classes/${classId}/sections`);
    return res.data.sections;
  },

  createSection: async (classId: number, payload: CreateSectionPayload): Promise<Section> => {
    const res = await api.post<{ section: Section }>(`/classes/${classId}/sections`, payload);
    return res.data.section;
  },

  updateSection: async (classId: number, sectionId: number, payload: UpdateSectionPayload): Promise<Section> => {
    const res = await api.put<{ section: Section }>(`/classes/${classId}/sections/${sectionId}`, payload);
    return res.data.section;
  },

  deleteSection: async (classId: number, sectionId: number): Promise<void> => {
    await api.delete(`/classes/${classId}/sections/${sectionId}`);
  }
};
