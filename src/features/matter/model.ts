export interface ResearchMatter {
  kind: 'research';
  version: 1;
  scope: 'unknown' | 'matched' | 'conflict';
  enrollment: 'unknown' | 'undergraduate' | 'other';
  experience: 'unknown' | 'course' | 'competition' | 'none';
  plan: 'missing' | 'draft' | 'revised';
  continued: boolean;
  completed: string[];
}
export type CheckStatus = 'met' | 'unmet' | 'unknown' | 'conflict';
export interface RequirementCheck {
  title: string;
  status: CheckStatus;
  fact: string;
  source: string;
}
export const researchQuestion = '校内科研项目，我可以申请吗？';
export const researchTitle = '本科生科研项目申请';
export const newResearchMatter = (): ResearchMatter => ({
  kind: 'research',
  version: 1,
  scope: 'unknown',
  enrollment: 'unknown',
  experience: 'unknown',
  plan: 'missing',
  continued: false,
  completed: [],
});
export const isResearchQuestion = (q: string) => /科研.*(项目|申请|申报)|项目.*科研/.test(q);
export const isResearchFollowup = (q: string) =>
  /申请|材料|计划书|条件|依据|项目|截止|什么时候|科研|补充/.test(q);
export function isResearchMatter(value: unknown): value is ResearchMatter {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.kind === 'research' &&
    v.version === 1 &&
    ['unknown', 'matched', 'conflict'].includes(String(v.scope)) &&
    ['unknown', 'undergraduate', 'other'].includes(String(v.enrollment)) &&
    ['unknown', 'course', 'competition', 'none'].includes(String(v.experience)) &&
    ['missing', 'draft', 'revised'].includes(String(v.plan)) &&
    typeof v.continued === 'boolean' &&
    Array.isArray(v.completed) &&
    v.completed.every((x) => x === 'application' || x === 'submission')
  );
}
export function getRequirementChecks(m: ResearchMatter): RequirementCheck[] {
  return [
    {
      title: '学校与年度',
      status: m.scope === 'matched' ? 'met' : m.scope === 'conflict' ? 'conflict' : 'unknown',
      fact:
        m.scope === 'matched'
          ? '已确认：云川大学 · 2026 秋季。'
          : m.scope === 'conflict'
            ? '当前范围与示例文件不一致，需要重新确认。'
            : '尚未确认个人适用范围。',
      source: '依据 [1] · 第 1 条',
    },
    {
      title: '本科在读',
      status:
        m.enrollment === 'undergraduate' ? 'met' : m.enrollment === 'other' ? 'unmet' : 'unknown',
      fact:
        m.enrollment === 'undergraduate'
          ? '你已确认本科在读。'
          : m.enrollment === 'other'
            ? '你确认的在读情况不满足本示例条件。'
            : '还需要确认在读情况。',
      source: '依据 [1] · 第 2 条',
    },
    {
      title: '课程项目或竞赛成果，具备一项即可',
      status: ['course', 'competition'].includes(m.experience)
        ? 'met'
        : m.experience === 'none'
          ? 'unmet'
          : 'unknown',
      fact:
        m.experience === 'course'
          ? '已确认课程项目经历，满足其中一项。'
          : m.experience === 'competition'
            ? '已确认竞赛成果，满足其中一项。'
            : m.experience === 'none'
              ? '你确认暂时没有这两类经历。'
              : '两类经历任选其一，尚未确认。',
      source: '依据 [1] · 第 2 条',
    },
  ];
}
export function getMatterConclusion(m: ResearchMatter) {
  const checks = getRequirementChecks(m);
  if (checks.some((x) => x.status === 'conflict'))
    return '适用范围存在冲突，暂不能据此判断申请资格。';
  if (checks.some((x) => x.status === 'unmet')) return '已确认的信息中，有条件暂未满足。';
  const unknown = checks.filter((x) => x.status === 'unknown').length;
  return unknown
    ? `还有 ${unknown} 项待确认，先保留判断。`
    : '示例申请条件已满足，可以继续准备材料。';
}
export function getPreparation(m: ResearchMatter) {
  return [
    {
      id: 'facts',
      title: '确认个人信息',
      description: '核对适用范围、学籍与相关经历',
      complete: getRequirementChecks(m).every(
        (x) => x.status !== 'unknown' && x.status !== 'conflict',
      ),
      action: 'facts',
    },
    {
      id: 'application',
      title: '填写申请表',
      description: '核对姓名、联系方式与项目名称',
      complete: m.completed.includes('application'),
      action: 'toggle',
    },
    {
      id: 'plan',
      title: '完善项目计划书',
      description:
        m.plan === 'revised'
          ? '修改后的示例已完成预审'
          : m.plan === 'draft'
            ? '示例初稿有两项待完善，继续复核'
            : '使用示例材料体验预审与修改',
      complete: m.plan === 'revised',
      action: 'review',
    },
    {
      id: 'submission',
      title: '确认提交要求',
      description: '向管理老师核对截止时间与提交方式',
      complete: m.completed.includes('submission'),
      action: 'toggle',
    },
  ];
}
export function researchAnswer(q: string) {
  return {
    kind: 'research-answer' as const,
    text: /截止|什么时候/.test(q)
      ? '这两份示例文件没有写明截止时间，目前无法确认。需要补查公告或向管理老师核对，准备清单中会保留这一项。'
      : '找到了两份相互关联的示例依据。先核对适用范围，再确认在读情况和相关经历。\n\n下方的核对结果会随你补充的信息更新；未知信息不会被视为不符合。',
  };
}
