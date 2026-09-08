import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 18} height={props.height ?? 18}>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M5 14.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4.5" />
    </svg>
  );
}

export function FileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 18} height={props.height ?? 18}>
      <path d="M6 3.5h8L18 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M8 12.5h7M8 16h7" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="m5 12.5 4 4 10-10" />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="M4 12h15m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="M12 4v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="M12 3 5 5.8v5.4c0 4 3 7.2 7 8.8 4-1.6 7-4.8 7-8.8V5.8L12 3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
  );
}

export function PasteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <rect x="4" y="5.5" width="16" height="15" rx="1.5" />
      <path d="M8.5 5.5V4a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 4v1.5M8 12.5h8M8 16h8" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 14} height={props.height ?? 14}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ScissorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <circle cx="6" cy="7" r="2.25" />
      <circle cx="6" cy="17" r="2.25" />
      <path d="M8 8.25 19.5 19M8 15.75 19.5 5" />
    </svg>
  );
}

export function RetuneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="M4 12h9m3 0 2-2m-2 2 2 2M20 6h-9m-3 0L6 4m0 4L4 6M20 18h-9" />
    </svg>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={props.width ?? 16} height={props.height ?? 16}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}