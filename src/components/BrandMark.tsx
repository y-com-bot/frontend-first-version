import type { SVGProps } from 'react';

export function BrandMark({ size = 22, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 14.5C4 8.7 8.2 5 14 5h4" />
      <path d="M20 9.5c0 5.8-4.2 9.5-10 9.5H6" />
      <path d="m8 15 8-6" />
      <circle cx="16" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
