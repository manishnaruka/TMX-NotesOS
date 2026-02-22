import { create } from 'zustand';

interface NoteStore {
  selectedNoteId: string | null;
  searchQuery: string;
  setSelectedNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  selectedNoteId: null,
  searchQuery: '',
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
