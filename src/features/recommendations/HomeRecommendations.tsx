import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Ellipsis } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { useStore } from '../../state/context';
import {
  extractRecommendationContext,
  goalLabels,
  growthLabels,
  newRecommendationSettings,
} from './model';
import { selectRecommendations } from './select';
import type { Recommendation } from './select';
import type { ConversationSignal } from './model';
import './recommendations.css';

const kindLabels = { resource: '资料', notice: '通知', discussion: '讨论' };
export function HomeRecommendations() {
  const { state, updateRecommendationSettings, notify } = useStore();
  const settings = state.recommendationSettings ?? newRecommendationSettings();
  const context = extractRecommendationContext(state.conversations, settings);
  const items = selectRecommendations(
    context,
    settings,
    state.selectedSchool,
    state.threads.map((t) => t.id),
  );
  const [basisOpen, setBasisOpen] = useState(false);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const hasContext = Boolean(context.goal || context.growth);
  const signals = [
    context.goal && {
      title: context.goal.explicit ? '最近的目标' : '最近关注的方向',
      label: goalLabels[context.goal.value],
      signal: context.goal,
    },
    context.growth && {
      title: '想提升的方面',
      label: growthLabels[context.growth.value],
      signal: context.growth,
    },
    context.school && {
      title: '对话中提到的学校',
      label: context.school.value,
      signal: context.school,
    },
  ].filter((x) => Boolean(x));
  const grouped = new Map<
    string,
    { titles: string[]; labels: string[]; signal: ConversationSignal<unknown> }
  >();
  for (const entry of signals) {
    if (!entry) continue;
    const existing = grouped.get(entry.signal.messageId);
    if (existing) {
      existing.titles.push(entry.title);
      existing.labels.push(entry.label);
    } else
      grouped.set(entry.signal.messageId, {
        titles: [entry.title],
        labels: [entry.label],
        signal: entry.signal,
      });
  }
  const basisEntries = [...grouped.values()].map((group) => ({
    ...group,
    title: group.titles.join(' · '),
    label: group.labels.join(' · '),
  }));
  return (
    <section className="home-recommendations" id="recommendations" aria-label="适合你的下一步">
      <div className="recommendation-heading">
        <h2 className="section-label">适合你的下一步</h2>
        <button type="button" className="text-button" onClick={() => setBasisOpen(true)}>
          推荐依据
          <ChevronRight size={13} />
        </button>
      </div>
      <p className="recommendation-context">
        {!settings.enabled
          ? '已暂停对话推荐 · 先看看这些方向'
          : hasContext
            ? `从对话中了解${context.goal ? ` · ${goalLabels[context.goal.value]}` : ` · ${growthLabels[context.growth!.value]}`}`
            : '先看看这些方向，聊过以后会更贴近你。'}
      </p>
      <div className="recommendation-list">
        {items.map((item) => (
          <article className="recommendation-item" key={item.id}>
            <Link className="recommendation-link" to={`${item.href}?from=home`}>
              <span className="recommendation-kind">
                {kindLabels[item.kind]} · {item.scope}
              </span>
              <h3>{item.title}</h3>
              <p>{item.reason}</p>
              <ArrowUpRight size={15} className="recommendation-arrow" aria-hidden="true" />
            </Link>
            <button
              className="recommendation-more icon-button"
              type="button"
              aria-label={`调整推荐：${item.title}`}
              onClick={() => setSelected(item)}
            >
              <Ellipsis size={17} />
            </button>
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="recommendation-empty">
          暂时没有更多相关内容。可以在推荐依据中恢复隐藏的内容，或
          <Link to="/plaza">去广场看看</Link>。
        </p>
      )}
      {items.length === 1 && (
        <p className="recommendation-empty">当前相关内容不多，先保留这一条。</p>
      )}
      {basisOpen && (
        <Sheet title="推荐依据" onClose={() => setBasisOpen(false)}>
          <p className="sheet-description">
            根据你在对话中提到的方向和想提升的方面更新，无需另外填写。理解有误时，可以忽略对应的那句话。
          </p>
          {basisEntries.length ? (
            basisEntries.map(
              (entry) =>
                entry && (
                  <section
                    className="recommendation-signal"
                    key={`${entry.title}-${entry.signal.messageId}`}
                  >
                    <span className="overline">{entry.title}</span>
                    <h3>{entry.label}</h3>
                    <blockquote>
                      {entry.signal.quote}
                      {entry.signal.quote.length === 240 ? '…' : ''}
                    </blockquote>
                    <div className="signal-actions">
                      <Link
                        className="text-button"
                        to={`/chat/${entry.signal.chatId}#message-${entry.signal.messageId}`}
                      >
                        查看原对话
                        <ArrowUpRight size={14} />
                      </Link>
                      <button
                        type="button"
                        className="text-button"
                        aria-label={`忽略这条理解：${entry.labels[0]}`}
                        onClick={() => {
                          updateRecommendationSettings({
                            ignoredMessages: [
                              ...new Set([...settings.ignoredMessages, entry.signal.messageId]),
                            ],
                          });
                          notify('这句话不再用于推荐');
                        }}
                      >
                        理解有误
                      </button>
                    </div>
                  </section>
                ),
            )
          ) : (
            <div className="recommendation-no-signal">
              <p>
                {settings.enabled
                  ? '还没有可用的对话依据。正常聊天即可，不需要设置目标。'
                  : '目前只展示探索内容，不使用对话信息。'}
              </p>
            </div>
          )}
          <p className="recommendation-scope-note">
            校内通知优先按顶部高校范围筛选；未限定时参考对话中提到的学校。通用资料与同学经验可以跨校阅读，推荐不表示申请资格已经满足。
          </p>
          <button
            className="secondary-button full-width"
            type="button"
            aria-pressed={!settings.enabled}
            onClick={() => updateRecommendationSettings({ enabled: !settings.enabled })}
          >
            {settings.enabled ? '暂停对话推荐' : '恢复对话推荐'}
          </button>
          {Boolean(settings.hiddenItems.length) && (
            <button
              className="text-button full-width"
              type="button"
              onClick={() => {
                updateRecommendationSettings({ hiddenItems: [] });
                notify('隐藏内容已恢复');
              }}
            >
              恢复隐藏的内容
            </button>
          )}
          {Boolean(settings.ignoredMessages.length) && (
            <button
              className="text-button full-width"
              type="button"
              onClick={() => {
                updateRecommendationSettings({ ignoredMessages: [] });
                notify('被忽略的对话依据已恢复');
              }}
            >
              恢复被忽略的依据
            </button>
          )}
          <p className="demo-note">演示推荐 · 未连接真实 AI · 仅在当前浏览器保存</p>
        </Sheet>
      )}
      {selected && (
        <Sheet title="调整这条推荐" onClose={() => setSelected(null)}>
          <h3 className="recommendation-selected-title">{selected.title}</h3>
          <p className="sheet-description">{selected.reason} 隐藏后会优先展示其他相关内容。</p>
          <button
            className="primary-button full-width"
            type="button"
            onClick={() => {
              updateRecommendationSettings({
                hiddenItems: [...new Set([...settings.hiddenItems, selected.id])],
              });
              setSelected(null);
              notify('已隐藏这条推荐');
            }}
          >
            不感兴趣，换一条
          </button>
          <button
            className="text-button full-width"
            type="button"
            onClick={() => {
              setSelected(null);
              setBasisOpen(true);
            }}
          >
            看看推荐依据
          </button>
        </Sheet>
      )}
    </section>
  );
}
