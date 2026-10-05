import { useOutletContext } from 'react-router-dom';
import type { Notice } from '../types';

export interface ShellContext {
  suggest: (question: string) => void;
  composing: boolean;
  setComposing: (value: boolean) => void;
  showAdvice: (notice: Notice) => void;
}
export const useShell = () => useOutletContext<ShellContext>();
