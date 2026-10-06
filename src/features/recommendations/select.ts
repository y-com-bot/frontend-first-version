import type { School } from '../../types';
import { recommendationCandidates } from './data';
import type { RecommendationCandidate } from './data';
import { goalLabels, growthLabels } from './model';
import type { RecommendationContext, RecommendationSettings } from './model';

export interface Recommendation extends RecommendationCandidate {
  reason: string;
}
export function selectRecommendations(
  context: RecommendationContext,
  settings: RecommendationSettings,
  selectedSchool: School,
  availableThreadIds: string[],
): Recommendation[] {
  const goal = context.goal?.value;
  const growth = context.growth?.value;
  const school = selectedSchool === '全部高校' ? context.school?.value : selectedSchool;
  const pool = recommendationCandidates
    .filter(
      (item) =>
        !settings.hiddenItems.includes(item.id) &&
        (!goal || item.goals.includes(goal)) &&
        (!school || item.school === '全部高校' || item.school === school) &&
        (item.kind !== 'discussion' || availableThreadIds.includes(item.href.split('/').at(-1)!)),
    )
    .map((item, index) => {
      const growthMatch = Boolean(growth && item.growth.includes(growth));
      const goalMatch = Boolean(goal && item.goals.includes(goal));
      return {
        item,
        index,
        score:
          (growthMatch ? 10 : 0) +
          (goalMatch ? 6 : 0) +
          (goal === 'research' && item.kind === 'notice' ? 2 : 0),
        reason:
          item.kind === 'discussion' && goalMatch
            ? `与你关注的「${goalLabels[goal!]}」相关，可以看看同学的准备经验。`
            : growthMatch
              ? `你提到想${growthLabels[growth!]}，这条内容可以作为准备参考。`
              : goalMatch
                ? `与你最近${context.goal?.explicit ? '的目标' : '关注的方向'}「${goalLabels[goal!]}」相关。`
                : item.kind === 'discussion'
                  ? '先看看同学的经验，发现自己感兴趣的方向。'
                  : '从一份准备资料开始，探索适合自己的下一步。',
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = pool.slice(0, 1);
  const first = selected[0];
  const second =
    pool.find(
      (entry) =>
        entry !== first &&
        (entry.item.kind === 'discussion') !== (first?.item.kind === 'discussion'),
    ) ?? pool.find((entry) => entry !== first);
  if (second) selected.push(second);
  return selected.map((entry) => ({ ...entry.item, reason: entry.reason }));
}
