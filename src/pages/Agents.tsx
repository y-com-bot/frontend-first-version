import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Download,
  FileCheck2,
  FileText,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Back, Empty, PageTitle } from '../components/Common';
import { downloadText } from '../utils';
import { useStore } from '../state/context';
import type { FileInfo } from '../types';

export function Agents() {
  return (
    <div className="page-enter">
      <PageTitle eyebrow="专门的工具，处理具体的问题">你的校园工具箱</PageTitle>
      <p className="page-intro">让材料更清楚，让准备更从容。</p>
      <Link className="tool-card" to="/agents/review">
        <div className="tool-card-top">
          <span className="tool-icon">
            <FileCheck2 size={24} />
          </span>
          <span className="tool-label">材料助手</span>
        </div>
        <h2>文件审查</h2>
        <p>检查材料的完整性、表达与格式，整理值得修改的地方。</p>
        <span className="tool-link">
          进入工具
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <Link className="tool-card" to="/agents/organize">
        <div className="tool-card-top">
          <span className="tool-icon">
            <BookOpen size={24} />
          </span>
          <span className="tool-label">学习助手</span>
        </div>
        <h2>资料整理</h2>
        <p>把零散内容整理成要点与阅读清单，找到下一步的学习方向。</p>
        <span className="tool-link">
          进入工具
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <p className="demo-note">当前工具展示操作流程与示例结果。</p>
    </div>
  );
}

const reviewResults = [
  {
    heading: '材料完整性',
    content: '检查基本信息、联系方式和材料要求是否齐全。申请类材料还应核对签字、附件与证明文件。',
  },
  {
    heading: '表达与结构',
    content: '经历可以按照任务、行动和结果描述。建议减少笼统的自我评价，让阅读者能够看到具体贡献。',
  },
  {
    heading: '格式与一致性',
    content:
      '统一标题、日期与文件命名方式，检查段落层级和标点。提交前再核对一遍学校或岗位的具体要求。',
  },
];
const organizeResults = [
  {
    heading: '建立资料目录',
    content: '按课程或主题分类，再按章节整理。建议保留文件来源和版本，方便之后核对。',
  },
  {
    heading: '提炼阅读要点',
    content: '每个主题整理一份简短的知识点清单，将概念、例题与参考资料分别放置。',
  },
  {
    heading: '标记待解决问题',
    content: '把尚未理解的知识点记录为问题，按优先级安排后续阅读或向同学提问。',
  },
];

export function ToolWorkspace() {
  const { tool } = useParams();
  const [params] = useSearchParams();
  const { state, addDocument, notify } = useStore();
  const record = state.documents.find((x) => x.id === params.get('record'));
  const [file, setFile] = useState<FileInfo | null>(() =>
    record ? { id: record.id, name: record.name, size: 0 } : null,
  );
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>(() =>
    record ? 'result' : 'input',
  );
  const [error, setError] = useState('');
  const picker = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const isReview = tool === 'review';
  const name = isReview ? '文件审查' : '资料整理';
  const results = isReview ? reviewResults : organizeResults;
  if (tool !== 'review' && tool !== 'organize')
    return (
      <Empty
        title="没有找到这个工具"
        action={
          <Link to="/agents" className="primary-button">
            返回工具箱
          </Link>
        }
      >
        请选择工具箱中的现有工具。
      </Empty>
    );
  const pick = (selected: File | undefined) => {
    if (!selected) return;
    if (!/\.(pdf|docx?|txt|md)$/i.test(selected.name)) {
      setError('请选择 PDF、Word、TXT 或 Markdown 文件。');
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError('文件超过 20MB，请选择较小的文件。');
      return;
    }
    setError('');
    setFile({ id: crypto.randomUUID(), name: selected.name, size: selected.size });
  };
  const run = () => {
    if (!file) return;
    setPhase('loading');
    // A short local animation demonstrates progress; no file contents are sent or analyzed.
    timer.current = setTimeout(() => {
      setPhase('result');
      addDocument({ name: file.name, tool: tool });
      notify('示例结果已生成');
    }, 700);
  };
  return (
    <div className="page-enter">
      <Back to="/agents" label="校园工具箱" />
      <PageTitle
        eyebrow={isReview ? '把材料交出去之前，再检查一遍' : '把零散资料，整理成清楚的线索'}
      >
        {name}
      </PageTitle>
      {phase === 'input' ? (
        <>
          <div
            className="upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              pick(event.dataTransfer.files[0]);
            }}
          >
            <span className="upload-icon">
              {file ? <FileText size={30} /> : <Upload size={30} />}
            </span>
            <h2>{file ? file.name : '选择一份资料'}</h2>
            <p>
              {file
                ? `${(file.size / 1024).toFixed(0)} KB · 文件已选择`
                : 'PDF、Word、TXT 或 Markdown · 最大 20MB'}
            </p>
            <input
              ref={picker}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-label="选择审查文件"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(event) => {
                pick(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={() => picker.current?.click()}
            >
              {file ? '更换文件' : '选择文件'}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {!file && (
            <button
              type="button"
              className="sample-file-button"
              onClick={() => {
                setFile({
                  id: crypto.randomUUID(),
                  name: isReview ? '实习简历 · 示例.pdf' : '课程笔记 · 示例.txt',
                  size: 12800,
                });
                setError('');
              }}
            >
              没有文件？使用示例资料
              <ArrowUpRight size={15} />
            </button>
          )}
          <div className="tool-process">
            <span>01 选择资料</span>
            <span>02 查看示例结果</span>
            <span>03 整理下一步</span>
          </div>
          <button
            type="button"
            className="primary-button full-width"
            disabled={!file}
            onClick={run}
          >
            <Sparkles size={17} />
            {isReview ? '查看示例审查结果' : '查看示例整理结果'}
          </button>
          <p className="demo-note">
            文件保留在本设备。当前结果为通用示例，不会读取或分析文件内容。
          </p>
        </>
      ) : phase === 'loading' ? (
        <div className="tool-loading" role="status">
          <Sparkles size={30} />
          <h2>正在准备示例结果</h2>
          <p>把下一步整理得更清楚一点。</p>
          <div className="loading-track">
            <span />
          </div>
        </div>
      ) : (
        <>
          <div className="result-header">
            <span className="result-symbol">
              <CheckCheck size={23} />
            </span>
            <div>
              <h2>{isReview ? '三个值得检查的方向' : '一份清晰的整理思路'}</h2>
              <p>{file?.name}</p>
            </div>
          </div>
          <span className="badge result-badge">演示结果</span>
          <div className="tool-results">
            {results.map((result, index) => (
              <section key={result.heading}>
                <span className="result-index">0{index + 1}</span>
                <div>
                  <h3>{result.heading}</h3>
                  <p>{result.content}</p>
                </div>
              </section>
            ))}
          </div>
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => {
              downloadText(
                `${name}示例结果.txt`,
                `小X校园助手 · ${name}演示结果\n资料：${file?.name}\n\n${results.map((result) => `${result.heading}\n${result.content}`).join('\n\n')}\n\n此结果为通用示例，并非对文件的实际分析。`,
              );
              notify('示例结果已下载');
            }}
          >
            <Download size={17} />
            下载结果
          </button>
          <button
            type="button"
            className="text-button full-width"
            onClick={() => {
              setPhase('input');
              setFile(null);
            }}
          >
            <RotateCcw size={15} />
            换一份资料
          </button>
          <p className="demo-note">这份结果用于演示流程，并非对文件的实际分析。</p>
        </>
      )}
    </div>
  );
}
