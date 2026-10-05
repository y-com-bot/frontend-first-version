import type { Notice } from '../../types';
export const researchDocuments = [
  {
    id: 'DEMO-KY-2026-01',
    title: '本科生科研项目申报说明',
    version: '2026.1',
    scope: '云川大学 · 2026 秋季',
    location: '第 1–3 条',
    sections: [
      {
        heading: '第 1 条 · 适用范围',
        body: '本示例事项面向云川大学 2026 年秋季学期学生。其他学校或年度应查询各自适用的通知，不能直接套用本说明。',
      },
      {
        heading: '第 2 条 · 申请条件',
        body: '申请人为本科在读学生，并且具有课程项目经历或竞赛成果，两类经历满足一项即可。未确认的信息应保留为未知，不得推断为不符合。',
      },
      {
        heading: '第 3 条 · 申报材料',
        body: '准备申请表与项目计划书。计划书内容要求见附件 A。申请条件核对与材料完整性检查分别记录，材料齐全不代表申请已获批准。',
      },
    ],
  },
  {
    id: 'DEMO-KY-2026-A',
    title: '附件 A · 项目计划书要求',
    version: '2026.1',
    scope: '同一事项 · 与申报说明关联',
    location: '材料清单 · 第 1 段',
    sections: [
      {
        heading: '项目计划书内容',
        body: '计划书应包括研究目标、分阶段实施安排、成员分工与指导老师确认记录。预审发现缺项时，应指出待完善的内容，修改后再次核对。',
      },
      {
        heading: '尚待确认的事项',
        body: '这份演示附件没有规定提交截止日期及提交渠道，需要向管理老师确认，不应自行补出日期。',
      },
    ],
  },
];
export const researchNotice: Notice = {
  id: 'research',
  title: researchDocuments[0]!.title,
  school: '云川大学',
  source: '科研事务办公室',
  category: '学习',
  date: '2026-10-06',
  tags: ['科研项目', '申请准备'],
  excerpt: '先核对申请条件，再把计划书和材料准备清楚。',
  summary:
    '本示例面向本科在读学生，课程项目或竞赛成果满足一项即可。材料准备包含申请表与计划书，截止时间仍需确认。',
  sections: researchDocuments[0]!.sections,
  advice: [
    '核对学校、年度与在读情况。',
    '课程项目和竞赛成果满足一项即可，不需要同时具备。',
    '预审计划书后，再确认提交方式与截止时间。',
  ],
  attachment: '科研项目准备说明·示例.txt',
  evidence: {
    fileId: researchDocuments[0]!.id,
    version: '2026.1',
    scope: researchDocuments[0]!.scope,
  },
};
export const planChecks = [
  {
    title: '研究目标',
    draft: '已有明确的研究问题与预期产出。',
    revised: '已保留研究目标与预期产出。',
    missing: false,
  },
  {
    title: '实施安排',
    draft: '只有总体描述，缺少分阶段安排。',
    revised: '已补充调研、实施、整理成果三个阶段。',
    missing: true,
  },
  {
    title: '成员分工',
    draft: '已说明资料整理与项目实施的分工。',
    revised: '已保留成员分工。',
    missing: false,
  },
  {
    title: '指导老师确认记录',
    draft: '标记为待确认，需要补充对应记录。',
    revised: '修改后的示例已补充确认记录。',
    missing: true,
  },
];
