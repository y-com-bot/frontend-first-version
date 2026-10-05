import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { Back, Empty, PageTitle } from '../../components/Common';
import { useStore } from '../../state/context';
import { downloadText } from '../../utils';
import { planChecks, researchDocuments } from './data';
import { CheckMark } from './MatterPanel';
import { EvidenceProgress } from './EvidenceProgress';

export function ResearchReview({ chatId }: { chatId: string }) {
  const { state, updateMatter, addDocument } = useStore();
  const matter = state.conversations.find((chat) => chat.id === chatId)?.matter;
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>(() =>
    matter?.plan === 'missing' ? 'input' : 'result',
  );
  const [selected, setSelected] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!matter)
    return (
      <Empty
        title="这条事项记录暂时找不到"
        action={
          <Link className="primary-button" to="/">
            回到首页
          </Link>
        }
      >
        从首页的科研项目问题开始体验。
      </Empty>
    );
  const revised = matter.plan === 'revised';
  return (
    <div className="research-review page-enter">
      <Back to={`/chat/${chatId}#preparation`} label="返回申请核对" />
      <PageTitle eyebrow="与当前事项关联的材料辅助">项目计划书预审</PageTitle>
      <p className="page-intro">依据附件 A，检查材料是否齐全。</p>
      {phase === 'input' ? (
        <>
          <div className="upload-zone">
            <span className="upload-icon">
              <FileText size={29} />
            </span>
            <h2>{selected ? '科研项目计划书 · 示例初稿' : '从一份示例计划书开始'}</h2>
            <p>预设文本 · 研究目标与分工已填写</p>
            <button className="secondary-button" type="button" onClick={() => setSelected(true)}>
              {selected ? '示例材料已选择' : '使用示例计划书'}
            </button>
          </div>
          {selected && (
            <details className="matter-process sample-plan">
              <summary>
                查看示例材料
                <ChevronDown size={14} />
              </summary>
              <p>
                研究目标：整理校园公共空间的使用情况。
                <br />
                实施安排：后续补充。
                <br />
                成员分工：资料整理与项目实施分开负责。
                <br />
                指导老师确认记录：待确认。
              </p>
            </details>
          )}
          <button
            className="primary-button full-width review-start"
            type="button"
            disabled={!selected}
            onClick={() => {
              setPhase('loading');
              timer.current = setTimeout(() => {
                updateMatter(chatId, { plan: 'draft' });
                addDocument({
                  name: '科研项目计划书 · 示例初稿',
                  tool: 'review',
                  matterChatId: chatId,
                });
                setPhase('result');
              }, 1100);
            }}
          >
            开始示例预审
          </button>
          <p className="demo-note">本情景仅使用预设材料，展示检查与修改流程。</p>
        </>
      ) : phase === 'loading' ? (
        <EvidenceProgress />
      ) : (
        <>
          <div className={`review-summary ${revised ? 'met' : 'unknown'}`} role="status">
            <span className="overline">
              {revised ? '修改后复核 · 演示结果' : '初稿预审 · 演示结果'}
            </span>
            <h2>{revised ? '示例材料的四项内容已齐全' : '有两项内容需要完善'}</h2>
            <p>
              {revised
                ? '实施安排与确认记录已在修改后的示例中补齐。'
                : '先补充实施安排和指导老师确认记录，再进行复核。'}
            </p>
          </div>
          <p className="meta review-basis">依据 [2] · 附件 A · v{researchDocuments[1]!.version}</p>
          <div className="review-checks">
            {planChecks.map((check) => (
              <div className="requirement-row" key={check.title}>
                <CheckMark status={revised || !check.missing ? 'met' : 'unknown'} />
                <div>
                  <div className="check-title">
                    <h3>{check.title}</h3>
                    <span
                      className={`check-status ${revised || !check.missing ? 'met' : 'unknown'}`}
                    >
                      {revised || !check.missing ? '已齐全' : '待完善'}
                    </span>
                  </div>
                  <p>{revised ? check.revised : check.draft}</p>
                </div>
              </div>
            ))}
          </div>
          {!revised && (
            <button
              className="primary-button full-width"
              type="button"
              onClick={() => updateMatter(chatId, { plan: 'revised' })}
            >
              使用修改后的示例并复核
            </button>
          )}
          <Link
            className={revised ? 'primary-button full-width' : 'text-button full-width'}
            to={`/chat/${chatId}#preparation`}
          >
            返回准备清单
          </Link>
          <button
            className="text-button full-width"
            type="button"
            onClick={() =>
              downloadText(
                '科研项目计划书预审·示例.txt',
                `小X · 示例材料预审\n${revised ? '修改后复核' : '初稿预审'}\n${planChecks.map((c) => `${c.title}：${revised ? c.revised : c.draft}`).join('\n')}\n依据：${researchDocuments[1]!.id}\n结果为预设示例，未分析真实文件，不代表申请已获批准。`,
              )
            }
          >
            <Download size={15} />
            下载示例预审结果
          </button>
          <p className="demo-note">复核仅表示示例材料内容齐全，不替代申请条件判断或正式审核。</p>
        </>
      )}
    </div>
  );
}
