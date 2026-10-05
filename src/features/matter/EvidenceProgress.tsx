import { useEffect, useState } from 'react';
import { BrandMark } from '../../components/BrandMark';
export function EvidenceProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const first = setTimeout(() => setStep(1), 350);
    const second = setTimeout(() => setStep(2), 700);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);
  return (
    <div className="thinking" role="status">
      <BrandMark size={17} />
      <span>{['正在查找示例依据', '核对条款与适用范围', '整理已知信息与待确认项'][step]}</span>
      <span aria-hidden="true">···</span>
    </div>
  );
}
