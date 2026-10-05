import { createContext, useContext } from 'react';
import type { StoredState, Profile, School, FileInfo, Thread, DocumentRecord } from '../types';

export interface AppStore {
  state: StoredState;
  setSchool: (school: School) => void;
  saveProfile: (profile: Profile) => void;
  toggleBookmark: (key: string) => void;
  toggleLike: (id: string) => void;
  sendMessage: (question: string, chatId?: string, files?: FileInfo[]) => string;
  addThread: (thread: Pick<Thread, 'title' | 'content' | 'category' | 'school'>) => string;
  addReply: (threadId: string, content: string) => void;
  addDocument: (doc: Omit<DocumentRecord, 'id' | 'date'>) => void;
  deleteChat: (id: string) => void;
  toast: string;
  notify: (message: string) => void;
  storageAvailable: boolean;
}
export const StoreContext = createContext<AppStore | null>(null);
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreProvider is missing');
  return store;
}
