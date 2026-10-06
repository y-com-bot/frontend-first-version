import type { Conversation, School } from '../../types';

export type DevelopmentGoal = 'internship' | 'study' | 'postgraduate' | 'research';
export type GrowthArea = 'projects' | 'resume' | 'organization' | 'direction';
export interface RecommendationSettings {
  version: 1;
  enabled: boolean;
  ignoredMessages: string[];
  hiddenItems: string[];
}
export interface ConversationSignal<T> {
  value: T;
  chatId: string;
  messageId: string;
  quote: string;
  explicit: boolean;
}
export interface RecommendationContext {
  goal?: ConversationSignal<DevelopmentGoal>;
  growth?: ConversationSignal<GrowthArea>;
  school?: ConversationSignal<School>;
}
export const goalLabels: Record<DevelopmentGoal, string> = {
  internship: '实习准备',
  study: '学习提升',
  postgraduate: '升学规划',
  research: '科研探索',
};
export const growthLabels: Record<GrowthArea, string> = {
  projects: '积累项目经历',
  resume: '完善简历表达',
  organization: '整理学习资料',
  direction: '探索发展方向',
};
export const newRecommendationSettings = (): RecommendationSettings => ({
  version: 1,
  enabled: true,
  ignoredMessages: [],
  hiddenItems: [],
});
export function isRecommendationSettings(value: unknown): value is RecommendationSettings {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.enabled === 'boolean' &&
    Array.isArray(v.ignoredMessages) &&
    v.ignoredMessages.every((x) => typeof x === 'string') &&
    Array.isArray(v.hiddenItems) &&
    v.hiddenItems.every((x) => typeof x === 'string')
  );
}

const goals: [DevelopmentGoal, RegExp][] = [
  ['internship', /实习|求职|找工作|就业|简历/],
  ['study', /复习|学习方法|课程资料|学习资料|选课|期末|笔记/],
  ['postgraduate', /保研|考研|升学|读研|推免/],
  ['research', /科研|研究项目|项目申报/],
];
const growthAreas: [GrowthArea, RegExp, RegExp][] = [
  [
    'projects',
    /项目(?:经历|经验)|项目经验|项目经历/,
    /没有|缺少|缺乏|不足|比较少|不多|不够|想积累|想增加/,
  ],
  ['resume', /简历/, /不会|不知道|不知|写不好|不够|想完善|想改进|需要改|想优化/],
  [
    'organization',
    /资料|笔记|课件/,
    /杂乱|太乱|很乱|散乱|分散|不会整理|不知道怎么整理|找不到|想整理/,
  ],
  ['direction', /方向|目标/, /不明确|不清楚|没想好|没有明确|还没确定|想探索|不知道/],
];
const otherSubject = /朋友|同学|室友|同桌|别人|他(?:想|要|在|准备)|她(?:想|要|在|准备)/;
const selfSubject = /我(?!的?(?:朋友|同学|室友|同桌))|自己/;
const intent = /想|打算|计划|准备|正在|希望|决定|考虑/;
const goalNegation = /不(?:再|打算|准备|考虑|想|需要)|暂不|放弃|取消/;
const correctedGrowth =
  /不是没有|并不缺|不缺|不再缺|不再杂乱|已经整理好|已整理好|已经有|已有|有了|不需要|不用再/;

/** Bounded local demonstration: only students' text, no attachments or AI responses. */
export function extractRecommendationContext(
  conversations: Conversation[],
  settings: RecommendationSettings,
): RecommendationContext {
  if (!settings.enabled) return {};
  const context: RecommendationContext = {};
  const messages = conversations
    .flatMap((chat) => {
      const timestamps = chat.messages
        .map((message) => Date.parse(message.createdAt ?? ''))
        .filter(Number.isFinite);
      // Legacy messages precede newer dated messages in the same conversation.
      const legacyStart = timestamps.length
        ? Math.min(...timestamps) - chat.messages.length - 1
        : Date.parse(chat.updatedAt);
      return chat.messages
        .filter(
          (message) => message.role === 'user' && !settings.ignoredMessages.includes(message.id),
        )
        .map((message, index) => ({
          chat,
          message,
          order: Number.isFinite(Date.parse(message.createdAt ?? ''))
            ? Date.parse(message.createdAt!)
            : legacyStart + index,
          index,
        }));
    })
    .sort((a, b) => a.order - b.order || a.index - b.index);
  for (const { chat, message } of messages) {
    let self = false;
    for (const raw of message.text.split(/[。！？!?；;\n，,]/)) {
      const clause = raw.trim();
      if (!clause) continue;
      // Examples, quotes and other people's questions do not describe the student.
      if (/比如|例如|假设|如果|举例|“|「|"/.test(clause)) {
        self = false;
        continue;
      }
      if (otherSubject.test(clause)) {
        self = false;
        continue;
      }
      if (selfSubject.test(clause)) self = true;
      const signal = <T>(value: T, explicit: boolean): ConversationSignal<T> => ({
        value,
        chatId: chat.id,
        messageId: message.id,
        quote: message.text.slice(0, 240),
        explicit,
      });
      for (const [goal, pattern] of goals) {
        if (!pattern.test(clause)) continue;
        if (goalNegation.test(clause)) {
          if (self && context.goal?.value === goal) delete context.goal;
          continue;
        }
        // A direct question identifies a topic, not a confirmed long-term goal.
        context.goal = signal(goal, self && intent.test(clause));
      }
      if (self) {
        for (const [area, subject, missing] of growthAreas) {
          if (!subject.test(clause)) continue;
          if (correctedGrowth.test(clause)) {
            if (context.growth?.value === area) delete context.growth;
          } else if (missing.test(clause)) context.growth = signal(area, true);
        }
        if (/在|就读|学校|来自|是/.test(clause)) {
          const school = (['云川大学', '南湖理工大学', '江城师范大学'] as const).find((name) =>
            clause.includes(name),
          );
          if (school) context.school = signal(school, true);
        }
      }
    }
  }
  return context;
}
