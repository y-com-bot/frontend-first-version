export const schools = ['全部高校', '云川大学', '南湖理工大学', '江城师范大学'] as const;
export type School = (typeof schools)[number];
export type Topic = '全部' | '升学' | '学习' | '实习' | '校园生活';
export const topics: Topic[] = ['全部', '升学', '学习', '实习', '校园生活'];

export interface Notice {
  id: string;
  title: string;
  school: School;
  source: string;
  category: Topic;
  date: string;
  tags: string[];
  summary: string;
  excerpt: string;
  sections: { heading: string; body: string }[];
  advice: string[];
  attachment: string;
  evidence?: { fileId: string; version: string; scope: string };
}
export interface Reply {
  id: string;
  author: string;
  school: School;
  content: string;
  date: string;
}
export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  school: School;
  category: Topic;
  date: string;
  replies: Reply[];
}
export interface FileInfo {
  id: string;
  name: string;
  size: number;
}
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  kind?: 'research-answer';
  files?: FileInfo[];
  references?: { label: string; href: string }[];
}
export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  matter?: import('./features/matter/model').ResearchMatter;
}
export interface Profile {
  name: string;
  school: School;
  year: string;
  major: string;
}
export interface DocumentRecord {
  id: string;
  name: string;
  tool: string;
  date: string;
  matterChatId?: string;
}
export interface StoredState {
  version: 1;
  profile: Profile;
  selectedSchool: School;
  bookmarks: string[];
  conversations: Conversation[];
  threads: Thread[];
  documents: DocumentRecord[];
  likedReplies: string[];
}
