import type { DevelopmentGoal, GrowthArea } from './model';

export interface RecommendationResource {
  id: string;
  title: string;
  category: string;
  summary: string;
  sections: { heading: string; body: string }[];
}
export const recommendationResources: RecommendationResource[] = [
  {
    id: 'development-map',
    title: '把目标拆成近期可以完成的准备',
    category: '发展规划',
    summary: '选一个近期方向，列出已经具备的条件与仍需准备的内容，从一件小事开始。',
    sections: [
      {
        heading: '先明确一个近期问题',
        body: '想清楚近期最希望了解或改善的事情。可以是了解升学路径、准备第一份实习，也可以是改善一门课的学习方法。目标可以调整，不必一次决定很长的未来。',
      },
      {
        heading: '分清已知与待确认',
        body: '把自己的实际经历、想尝试的方向和仍不清楚的要求分别记录。兴趣不等于资格，制度条件要查看适用的正式文件。',
      },
      {
        heading: '安排一个可以开始的行动',
        body: '选择一个近期能完成的任务，例如阅读一份资料、整理一个课程项目或向同学请教。完成后回看结果，再调整下一步。',
      },
    ],
  },
  {
    id: 'project-portfolio',
    title: '从课程项目到作品集：整理指南',
    category: '项目准备',
    summary: '从已经做过的课程任务出发，整理你解决的问题、承担的工作和可以展示的成果。',
    sections: [
      {
        heading: '先盘点已有经历',
        body: '列出做过的课程任务、小组作业或个人练习。记录问题、自己的职责和目前完成的部分。暂时没有项目也可以从一个小练习开始，不需要编造经历。',
      },
      {
        heading: '做一个可完成的小项目',
        body: '选择一个明确的问题，例如整理校园公共空间的使用情况。先做一份观察记录和简短结论，再安排资料整理、实际观察与成果展示三个阶段。保留过程记录，说明遇到的问题和你尝试的解决方法。',
      },
      {
        heading: '整理为可阅读的作品',
        body: '用背景、行动和结果描述项目。附上说明文档或演示，核对公开展示的内容是否适合分享。资料用于准备思路，不代表岗位或科研申请资格。',
      },
    ],
  },
  {
    id: 'internship-preparation',
    title: '第一份实习：简历与经历准备清单',
    category: '实习准备',
    summary: '先了解岗位，再整理经历；把具体做过的事情讲清楚，比堆放形容词更有帮助。',
    sections: [
      {
        heading: '从岗位要求开始',
        body: '选择一两个感兴趣的岗位，整理常见工作内容和要求。把已经具备的能力与想提升的方面分开记录，安排近期可以完成的准备。',
      },
      {
        heading: '用具体经历写简历',
        body: '课程项目、校园活动和个人练习都可以作为经历。例如，把“参与小组项目”改为“负责整理访谈记录，并将发现的问题汇总成一页说明”。说明自己实际负责的部分；没有证据的数字或成果不要添加。',
      },
      {
        heading: '提交前再检查一遍',
        body: '检查联系方式、日期和作品链接，统一排版。根据具体岗位调整经历顺序，投递要求以实际招聘信息为准。',
      },
    ],
  },
  {
    id: 'study-organization',
    title: '把课件、笔记与习题整理成一份复习地图',
    category: '学习方法',
    summary: '按课程与章节建立目录，把知识点、错题和待解决的问题放到可以找到的位置。',
    sections: [
      {
        heading: '先建立一个目录',
        body: '按课程和章节分类课件、笔记与习题。每章保留一页目录，例如“第二章：课件第 12—20 页、两道错题、一个待解问题”。先把资料放到能找到的位置，再逐步补充。',
      },
      {
        heading: '用问题组织复习',
        body: '把需要解释的概念、容易混淆的知识点和常见题型列出来。用练习检验理解，把暂时不会的题目留下说明。',
      },
      {
        heading: '每周更新一次',
        body: '复习后标记已掌握和仍需练习的内容。时间有限时，先处理课程要求明确且自己尚不熟悉的部分。具体考试范围以所在课程说明为准。',
      },
    ],
  },
];
export interface RecommendationCandidate {
  id: string;
  kind: 'resource' | 'notice' | 'discussion';
  href: string;
  title: string;
  goals: DevelopmentGoal[];
  growth: GrowthArea[];
  school: string;
  scope: string;
}
export const recommendationCandidates: RecommendationCandidate[] = [
  {
    id: 'resource:project-portfolio',
    kind: 'resource',
    href: '/resource/project-portfolio',
    title: recommendationResources.find((r) => r.id === 'project-portfolio')!.title,
    goals: ['internship', 'research'],
    growth: ['projects'],
    school: '全部高校',
    scope: '通用准备资料',
  },
  {
    id: 'resource:internship-preparation',
    kind: 'resource',
    href: '/resource/internship-preparation',
    title: recommendationResources.find((r) => r.id === 'internship-preparation')!.title,
    goals: ['internship'],
    growth: ['resume', 'direction'],
    school: '全部高校',
    scope: '通用准备资料',
  },
  {
    id: 'resource:study-organization',
    kind: 'resource',
    href: '/resource/study-organization',
    title: recommendationResources.find((r) => r.id === 'study-organization')!.title,
    goals: ['study'],
    growth: ['organization'],
    school: '全部高校',
    scope: '通用学习资料',
  },
  {
    id: 'notice:postgraduate',
    kind: 'notice',
    href: '/notice/postgraduate',
    title: '升学准备，从了解自己的选择开始',
    goals: ['postgraduate'],
    growth: ['direction'],
    school: '全部高校',
    scope: '通用准备资料',
  },
  {
    id: 'notice:research',
    kind: 'notice',
    href: '/notice/research',
    title: '本科生科研项目申报说明',
    goals: ['research'],
    growth: [],
    school: '云川大学',
    scope: '云川大学 · 适用条件需核对',
  },
  {
    id: 'discussion:first-internship',
    kind: 'discussion',
    href: '/thread/first-internship',
    title: '大二开始找实习，会不会太早？',
    goals: ['internship'],
    growth: ['projects', 'resume', 'direction'],
    school: '全部高校',
    scope: '同学经验 · 不作为制度依据',
  },
  {
    id: 'discussion:revision',
    kind: 'discussion',
    href: '/thread/revision',
    title: '你们是怎么整理期末复习资料的？',
    goals: ['study'],
    growth: ['organization'],
    school: '全部高校',
    scope: '同学经验 · 不作为制度依据',
  },
  {
    id: 'discussion:path',
    kind: 'discussion',
    href: '/thread/path',
    title: '保研还是考研，大家是怎么做决定的？',
    goals: ['postgraduate'],
    growth: ['direction'],
    school: '全部高校',
    scope: '同学经验 · 不作为制度依据',
  },
  {
    id: 'discussion:research-start',
    kind: 'discussion',
    href: '/thread/research-start',
    title: '第一次参与科研项目，怎么安排准备？',
    goals: ['research'],
    growth: ['projects', 'direction'],
    school: '全部高校',
    scope: '同学经验 · 不作为制度依据',
  },
  {
    id: 'resource:development-map',
    kind: 'resource',
    href: '/resource/development-map',
    title: recommendationResources.find((r) => r.id === 'development-map')!.title,
    goals: ['internship', 'research', 'postgraduate', 'study'],
    growth: ['direction'],
    school: '全部高校',
    scope: '通用准备资料',
  },
];
