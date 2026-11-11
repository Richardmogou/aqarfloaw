/** Line-art skyline (minaret, domes, towers) used as a quiet decoration in the sidebar and dashboard. */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 90" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M0 88H240" />
      <path d="M6 88V62h10v26M11 62v-6" />
      <path d="M22 88V70c0-7 14-7 14 0v18M29 63v-4" />
      <path d="M42 88V48h12v40M42 58h12M42 68h12M42 78h12" />
      <path d="M60 88V66l9-8 9 8v22" />
      <path d="M86 88V36l4-10 4 10v52M84 36h12M85 52h10M85 68h10" />
      <path d="M90 26V12M88 16h4" />
      <path d="M102 88V58c0-12 26-12 26 0v30M115 46v-6M108 88V72h14v16" />
      <path d="M134 88V40h14v48M134 50h14M134 60h14M134 70h14M134 80h14" />
      <path d="M154 88V64h12v24M160 64v-8l4-4" />
      <path d="M172 88V54l8-6 8 6v34M176 62h8M176 72h8" />
      <path d="M194 88V30h3V18h3v12h3v58M194 44h9M194 58h9M194 72h9" />
      <path d="M210 88V68c0-6 12-6 12 0v20M216 62v-4" />
      <path d="M228 88V58h8v30" />
    </svg>
  );
}
