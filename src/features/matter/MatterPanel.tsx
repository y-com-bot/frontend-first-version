import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Download,
  FileText,
  MinusCircle,
} from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { useStore } from '../../state/context';
import { downloadText } from '../../utils';
import { researchDocuments } from './data';
import { getMatterConclusion, getPreparation, getRequirementChecks, researchTitle } from './model';
import type { CheckStatus, ResearchMatter } from './model';
import './matter.css';

const statusLabels = { met: '已满足', unmet: '未满足', unknown: '待确认', conflict: '范围冲突' };
const statusIcons = {
  met: CheckCircle2,
  unmet: MinusCircle,
  unknown: CircleHelp,
  conflict: AlertCircle,
};
export function CheckMark({ status }: { status: CheckStatus }) {
  const Icon = statusIcons[status];
  return <Icon size={17} className={`check-mark ${status}`} aria-hidden="true" />;
}

function FactsForm({
  matter,
  save,
}: {
  matter: ResearchMatter;
  save: (facts: Pick<ResearchMatter, 'scope' | 'enrollment' | 'experience'>) => void;
}) {
  const [scope, setScope] = useState(matter.scope);
  const [enrollment, setEnrollment] = useState(matter.enrollment);
  const [experience, setExperience] = useState(matter.experience);
  return (
    <>
      <p className="sheet-description">
        只确认本次申请需要的信息。暂不明确的项目可以保留“待确认”。
      </p>
      <form
        className="edit-form matter-facts"
        onSubmit={(event) => {
          event.preventDefault();
          save({ scope, enrollment, experience });
        }}
      >
        <label>
          学校与年度
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ResearchMatter['scope'])}
          >
            <option value="unknown">暂不确认</option>
            <option value="matched">云川大学 · 2026 秋季</option>
            <option value="conflict">其他学校或年度</option>
          </select>
        </label>
        <label>
          在读情况
          <select
            value={enrollment}
            onChange={(e) => setEnrollment(e.target.value as ResearchMatter['enrollment'])}
          >
            <option value="unknown">暂不确认</option>
            <option value="undergraduate">本科在读</option>
            <option value="other">其他在读情况</option>
          </select>
        </label>
        <label>
          相关经历
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value as ResearchMatter['experience'])}
          >
            <option value="unknown">暂不确认</option>
            <option value="course">有课程项目经历</option>
            <option value="competition">有竞赛成果</option>
            <option value="none">暂时没有这两类经历</option>
          </select>
        </label>
        <button className="primary-button full-width" type="submit">
          更新核对结果
        </button>
      </form>
      <button
        className="text-button full-width"
        type="button"
        onClick={() =>
          save({ scope: 'matched', enrollment: 'undergraduate', experience: 'course' })
        }
      >
        使用示例信息
      </button>
      <p className="demo-note">演示信息不会用于修改个人资料，也不会验证真实申请资格。</p>
    </>
  );
}

export function MatterPanel({ chatId, matter }: { chatId: string; matter: ResearchMatter }) {
  const { updateMatter, notify } = useStore();
  const [dialog, setDialog] = useState<'facts' | number | null>(null);
  const checksHeading = useRef<HTMLHeadingElement>(null);
  const prep = useRef<HTMLElement>(null);
  const checks = getRequirementChecks(matter);
  const tasks = getPreparation(matter);
  const allMet = checks.every((x) => x.status === 'met');
  const conflict = checks.some((x) => x.status === 'conflict');
  const unknown = checks.some((x) => x.status === 'unknown');
  const complete = tasks.filter((x) => x.complete).length;
  const source = typeof dialog === 'number' ? researchDocuments[dialog] : undefined;
  const reviewUrl = `/agents/review?matter=${encodeURIComponent(chatId)}`;
  const startPreparation = () => {
    updateMatter(chatId, { continued: true });
    requestAnimationFrame(() =>
      prep.current?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  };
  return (
    <section className="matter-panel" aria-label="科研申请核对">
      <div className="matter-heading">
        <span className="overline">示例事项 · 依据与下一步</span>
        <h2>{researchTitle}</h2>
        <p>云川大学 · 2026 秋季 · 预设演示情景</p>
      </div>
      <section className="matter-sources" id="evidence" aria-label="资料依据">
        <h3 className="section-label">本次参考的依据</h3>
        {researchDocuments.map((doc, index) => (
          <button
            type="button"
            className="evidence-row"
            key={doc.id}
            onClick={() => setDialog(index)}
          >
            <FileText size={17} />
            <span>
              <strong>
                [{index + 1}] {doc.title}
              </strong>
              <small>
                示例文件 · v{doc.version} · {doc.location}
              </small>
            </span>
            <ChevronRight size={15} />
          </button>
        ))}
      </section>
      <section className="requirement-section" aria-label="条件核对">
        <h3 ref={checksHeading}>对照你的情况</h3>
        {checks.map((check) => (
          <div className="requirement-row" key={check.title}>
            <CheckMark status={check.status} />
            <div>
              <div className="check-title">
                <h4>{check.title}</h4>
                <span className={`check-status ${check.status}`}>{statusLabels[check.status]}</span>
              </div>
              <p>{check.fact}</p>
              <small>{check.source}</small>
            </div>
          </div>
        ))}
        <div
          className={`matter-conclusion ${conflict ? 'conflict' : allMet ? 'met' : 'unknown'}`}
          role="status"
        >
          <p>{getMatterConclusion(matter)}</p>
          <small>核对使用本情景中由你确认的信息，不读取附件内容。</small>
        </div>
        <div className="matter-actions">
          {!matter.continued && (
            <button
              className="primary-button full-width"
              type="button"
              onClick={() => (allMet ? startPreparation() : setDialog('facts'))}
            >
              {allMet ? '生成准备清单' : unknown ? '补充个人信息' : '重新核对信息'}
            </button>
          )}
          <button
            className="text-button full-width"
            type="button"
            disabled={!allMet && !matter.continued && conflict}
            onClick={() => (allMet || matter.continued ? setDialog('facts') : startPreparation())}
          >
            {allMet || matter.continued ? '修改个人信息' : '先准备清单，保留当前判断'}
          </button>
        </div>
      </section>
      {matter.continued && (
        <section className="preparation-section" id="preparation" ref={prep} aria-label="准备清单">
          <div className="section-heading">
            <h3>你的准备清单</h3>
            <span>已完成 {complete}/4</span>
          </div>
          <div className="preparation-track" aria-hidden="true">
            <span style={{ width: `${(complete / 4) * 100}%` }} />
          </div>
          {tasks.map((task) => {
            const body = (
              <>
                <span className={`task-circle ${task.complete ? 'complete' : ''}`}>
                  {task.complete ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                </span>
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.description}</small>
                </span>
                {task.action !== 'toggle' && <ChevronRight size={15} />}
              </>
            );
            return task.action === 'review' ? (
              <Link className="preparation-row" to={reviewUrl} key={task.id}>
                {body}
              </Link>
            ) : (
              <button
                className="preparation-row"
                type="button"
                key={task.id}
                role={task.action === 'toggle' ? 'checkbox' : undefined}
                aria-checked={task.action === 'toggle' ? task.complete : undefined}
                aria-label={task.title}
                onClick={() =>
                  task.action === 'facts'
                    ? setDialog('facts')
                    : updateMatter(chatId, {
                        completed: task.complete
                          ? matter.completed.filter((id) => id !== task.id)
                          : [...matter.completed, task.id],
                      })
                }
              >
                {body}
              </button>
            );
          })}
          <button
            className="text-button full-width"
            type="button"
            onClick={() => {
              downloadText(
                '科研项目准备清单·示例.txt',
                `小X校园助手 · 示例准备清单\n${researchTitle}\n云川大学 · 2026 秋季\n\n${getMatterConclusion(matter)}\n\n${tasks.map((t) => `${t.complete ? '[已完成]' : '[待准备]'} ${t.title}\n${t.description}`).join('\n\n')}\n\n依据：${researchDocuments.map((d) => `${d.id} · v${d.version}`).join('；')}\n仅用于演示，不代表实际申请资格或受理结果。`,
              );
              notify('示例准备清单已下载');
            }}
          >
            <Download size={15} />
            下载准备清单
          </button>
          <p className="demo-note">截止时间仍需核对；清单完成不代表申请已提交或获批。</p>
        </section>
      )}
      <details className="matter-process">
        <summary>
          查看依据如何整理
          <ChevronDown size={14} />
        </summary>
        <ol>
          <li>定位示例事项、学校与年度。</li>
          <li>语义检索与 BM25 关键词检索并行召回候选。</li>
          <li>合并去重，再用 Rerank 精排。</li>
          <li>回看完整条款与关联附件，保留版本和原文位置。</li>
          <li>对照已确认事实，识别未知与冲突。</li>
        </ol>
        <p>本原型使用预设文件与结果，未运行真实检索模型。</p>
      </details>
      {dialog === 'facts' && (
        <Sheet title="补充个人信息" onClose={() => setDialog(null)}>
          <FactsForm
            matter={matter}
            save={(facts) => {
              updateMatter(chatId, facts);
              setDialog(null);
              requestAnimationFrame(() =>
                checksHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }),
              );
            }}
          />
        </Sheet>
      )}
      {source && (
        <Sheet title={source.title} onClose={() => setDialog(null)}>
          <div className="source-context">
            <span className="badge">示例原文</span>
            <p>
              {source.scope} · v{source.version}
            </p>
            <small>{source.id}</small>
          </div>
          {source.sections.map((section) => (
            <section className="source-section" key={section.heading}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}
          {dialog === 0 && (
            <Link
              className="secondary-button full-width"
              to={`/notice/research?from=${encodeURIComponent(chatId)}#section-1`}
            >
              打开通知全文
              <ChevronRight size={15} />
            </Link>
          )}
        </Sheet>
      )}
    </section>
  );
}
