import { useParams } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { Back, Empty } from '../../components/Common';
import { useStore } from '../../state/context';
import { downloadText } from '../../utils';
import { recommendationResources } from './data';
import './recommendations.css';

export function ResourceDetail() {
  const { id } = useParams();
  const { notify } = useStore();
  const resource = recommendationResources.find((r) => r.id === id);
  if (!resource) return <Empty title="这份资料暂时找不到">可以回到首页看看其他推荐。</Empty>;
  return (
    <article className="detail-page page-enter">
      <Back to="/#recommendations" label="返回首页推荐" />
      <p className="meta resource-meta">示例资料 · {resource.category} · 通用准备参考</p>
      <h1>{resource.title}</h1>
      <section className="summary-panel">
        <span className="ai-label">
          <FileText size={15} />
          资料导读
        </span>
        <p>{resource.summary}</p>
      </section>
      <div className="article-body">
        {resource.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <button
        type="button"
        className="download-row"
        onClick={() => {
          downloadText(
            `${resource.title}·示例.txt`,
            `${resource.title}\n通用准备参考 · 虚构示例资料\n\n${resource.sections.map((s) => `${s.heading}\n${s.body}`).join('\n\n')}\n\n此资料不作为正式通知、资格证明或真实业务结果。`,
          );
          notify('示例资料已下载');
        }}
      >
        <Download size={18} />
        <span>
          下载这份资料<small>示例文本 · TXT</small>
        </span>
      </button>
      <p className="demo-note">仅用于前端体验，具体条件以适用的正式文件为准。</p>
    </article>
  );
}
