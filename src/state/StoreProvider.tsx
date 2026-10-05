import { useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createAnswer, initialThreads } from '../data/content';
import type {
  StoredState,
  Profile,
  School,
  FileInfo,
  Thread,
  Message,
  DocumentRecord,
} from '../types';
import { schools } from '../types';
import { StoreContext } from './context';

const STORAGE_KEY = 'campus-prototype-v1';
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const initialState: StoredState = {
  version: 1,
  profile: { name: '校园同学', school: '全部高校', year: '大二', major: '' },
  selectedSchool: '全部高校',
  bookmarks: [],
  conversations: [],
  threads: initialThreads,
  documents: [],
  likedReplies: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function hasStrings(value: unknown, keys: string[]) {
  return isRecord(value) && keys.every((key) => typeof value[key] === 'string');
}
function readStorage(): StoredState {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      !hasStrings(value.profile, ['name', 'school', 'year', 'major'])
    )
      return initialState;
    if (
      !schools.includes(value.selectedSchool as School) ||
      !isRecord(value.profile) ||
      !schools.includes(value.profile.school as School)
    )
      return initialState;
    if (
      !Array.isArray(value.bookmarks) ||
      !value.bookmarks.every((x) => typeof x === 'string') ||
      !Array.isArray(value.likedReplies) ||
      !value.likedReplies.every((x) => typeof x === 'string')
    )
      return initialState;
    if (
      !Array.isArray(value.conversations) ||
      !value.conversations.every(
        (chat) =>
          hasStrings(chat, ['id', 'title', 'updatedAt']) &&
          isRecord(chat) &&
          Array.isArray(chat.messages) &&
          chat.messages.every(
            (message) =>
              hasStrings(message, ['id', 'text', 'role']) &&
              isRecord(message) &&
              ['user', 'assistant'].includes(String(message.role)),
          ),
      )
    )
      return initialState;
    if (
      !Array.isArray(value.threads) ||
      !value.threads.every(
        (thread) =>
          hasStrings(thread, ['id', 'title', 'content', 'author', 'school', 'category', 'date']) &&
          isRecord(thread) &&
          Array.isArray(thread.replies) &&
          thread.replies.every((reply) =>
            hasStrings(reply, ['id', 'author', 'school', 'content', 'date']),
          ),
      )
    )
      return initialState;
    if (
      !Array.isArray(value.documents) ||
      !value.documents.every((doc) => hasStrings(doc, ['id', 'name', 'tool', 'date']))
    )
      return initialState;
    // Pending demo replies cannot survive a reload; complete them deterministically.
    const restored = value as unknown as StoredState;
    return {
      ...restored,
      conversations: restored.conversations.map((chat) => {
        const last = chat.messages.at(-1);
        return last?.role === 'user'
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { id: id(), role: 'assistant', ...createAnswer(last.text) },
              ],
            }
          : chat;
      }),
    };
  } catch {
    return initialState;
  }
}

type Action =
  | { type: 'school'; school: School }
  | { type: 'profile'; profile: Profile }
  | { type: 'bookmark'; key: string }
  | { type: 'like'; id: string }
  | { type: 'message'; chatId: string; message: Message; title: string }
  | { type: 'thread'; thread: Thread }
  | { type: 'reply'; threadId: string; content: string; profile: Profile }
  | { type: 'document'; document: DocumentRecord }
  | { type: 'deleteChat'; id: string };

const toggle = (list: string[], key: string) =>
  list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
function reducer(state: StoredState, action: Action): StoredState {
  switch (action.type) {
    case 'school':
      return { ...state, selectedSchool: action.school };
    case 'profile':
      return { ...state, profile: action.profile };
    case 'bookmark':
      return { ...state, bookmarks: toggle(state.bookmarks, action.key) };
    case 'like':
      return { ...state, likedReplies: toggle(state.likedReplies, action.id) };
    case 'message': {
      const existing = state.conversations.find((x) => x.id === action.chatId);
      const chat = existing
        ? { ...existing, updatedAt: now(), messages: [...existing.messages, action.message] }
        : { id: action.chatId, title: action.title, updatedAt: now(), messages: [action.message] };
      return {
        ...state,
        conversations: [chat, ...state.conversations.filter((x) => x.id !== chat.id)],
      };
    }
    case 'thread':
      return { ...state, threads: [action.thread, ...state.threads] };
    case 'reply':
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.threadId
            ? {
                ...thread,
                replies: [
                  ...thread.replies,
                  {
                    id: id(),
                    author: action.profile.name,
                    school: action.profile.school,
                    content: action.content,
                    date: now(),
                  },
                ],
              }
            : thread,
        ),
      };
    case 'document':
      return { ...state, documents: [action.document, ...state.documents].slice(0, 100) };
    case 'deleteChat':
      return { ...state, conversations: state.conversations.filter((x) => x.id !== action.id) };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readStorage);
  const [toast, setToast] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const replyTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      const failure = setTimeout(() => setStorageAvailable(false), 0);
      return () => clearTimeout(failure);
    }
  }, [state]);
  useEffect(() => {
    const timers = replyTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };
  const sendMessage = (question: string, chatId?: string, files: FileInfo[] = []) => {
    const key = chatId || id();
    dispatch({
      type: 'message',
      chatId: key,
      title: question.slice(0, 35),
      message: { id: id(), role: 'user', text: question, files },
    });
    replyTimers.current.set(
      key,
      setTimeout(() => {
        dispatch({
          type: 'message',
          chatId: key,
          title: question.slice(0, 35),
          message: { id: id(), role: 'assistant', ...createAnswer(question) },
        });
        replyTimers.current.delete(key);
      }, 650),
    );
    return key;
  };
  const addThread = (values: Pick<Thread, 'title' | 'content' | 'category' | 'school'>) => {
    const key = id();
    dispatch({
      type: 'thread',
      thread: { ...values, id: key, author: state.profile.name, date: now(), replies: [] },
    });
    notify('讨论已发布');
    return key;
  };
  return (
    <StoreContext.Provider
      value={{
        state,
        toast,
        notify,
        storageAvailable,
        sendMessage,
        addThread,
        setSchool: (school) => dispatch({ type: 'school', school }),
        saveProfile: (profile) => {
          dispatch({ type: 'profile', profile });
          notify('个人资料已保存');
        },
        toggleBookmark: (key) => {
          dispatch({ type: 'bookmark', key });
          notify(state.bookmarks.includes(key) ? '已取消收藏' : '已加入收藏');
        },
        toggleLike: (key) => dispatch({ type: 'like', id: key }),
        addReply: (threadId, content) => {
          dispatch({ type: 'reply', threadId, content, profile: state.profile });
          notify('回复已发布');
        },
        addDocument: (doc) =>
          dispatch({ type: 'document', document: { ...doc, id: id(), date: now() } }),
        deleteChat: (key) => {
          clearTimeout(replyTimers.current.get(key));
          replyTimers.current.delete(key);
          dispatch({ type: 'deleteChat', id: key });
          notify('对话已删除');
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
