export function Marquee() {
  const items = [
    'ACTORES F.C.',
    'ACTRICES F.C.',
    'FÚTBOL REAL',
    'CULTURA POP',
    'COMUNIDAD',
    'ACTING',
    '2018',
    'BUENOS AIRES',
  ];

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden py-6 border-y border-[#c9a84c]/10">
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-bebas text-[28px] sm:text-[36px] text-white/[0.04] tracking-wider">{item}</span>
            <span className="w-1.5 h-1.5 bg-[#c9a84c]/15 rotate-45 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
