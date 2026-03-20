import { useState, useMemo } from 'react';
import { type Player } from '../data/players';

interface Props {
  player: Player;
  index: number;
  isVisible: boolean;
  onSelect?: (player: Player) => void;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function PlayerPattern({ name, isActriz }: { name: string; isActriz: boolean }) {
  const h = hashCode(name);
  const shapes = useMemo(() => {
    const s = [];
    const count = 4 + (h % 4);
    for (let i = 0; i < count; i++) {
      const x = ((h * (i + 1) * 7) % 180) + 10;
      const y = ((h * (i + 2) * 13) % 160) + 10;
      const size = 20 + ((h * (i + 3)) % 40);
      const rotation = (h * (i + 1)) % 360;
      const type = (h + i) % 3;
      s.push({ x, y, size, rotation, type });
    }
    return s;
  }, [name]);

  const baseColor = isActriz ? 'rgba(201,168,76,' : 'rgba(37,99,235,';

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
      {shapes.map((s, i) => {
        const opacity = 0.03 + (i * 0.01);
        if (s.type === 0) {
          return <rect key={i} x={s.x} y={s.y} width={s.size} height={s.size} rx="2"
            fill="none" stroke={`${baseColor}${opacity})`}
            strokeWidth="0.5"
            transform={`rotate(${s.rotation} ${s.x + s.size/2} ${s.y + s.size/2})`} />;
        } else if (s.type === 1) {
          return <circle key={i} cx={s.x} cy={s.y} r={s.size / 2}
            fill="none" stroke={`${baseColor}${opacity})`}
            strokeWidth="0.5" />;
        } else {
          return <line key={i} x1={s.x} y1={s.y} x2={s.x + s.size} y2={s.y + s.size * 0.6}
            stroke={`${baseColor}${opacity})`}
            strokeWidth="0.5" />;
        }
      })}
      <line x1="0" y1="200" x2="200" y2="100"
        stroke={`${baseColor}0.04)`} strokeWidth="0.5" />
    </svg>
  );
}

function getRating(player: Player): string {
  const parse = (s?: string) => {
    if (!s) return 0;
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    if (s.includes('M')) return n * 1000000;
    if (s.includes('K')) return n * 1000;
    return n;
  };
  const total = parse(player.igFollowers) + parse(player.tkFollowers);
  if (total >= 5000000) return '99';
  if (total >= 2000000) return '95';
  if (total >= 1000000) return '92';
  if (total >= 500000) return '88';
  if (total >= 200000) return '84';
  if (total >= 100000) return '80';
  return '76';
}

function getPhotoUrl(_player: Player): string {
  // unavatar.io/instagram endpoint is broken (returns fallback for all handles)
  // Disabled until a working image source is available
  return '';
}

export function PlayerCard({ player, index, isVisible, onSelect }: Props) {
  const isActriz = player.type === 'actriz';
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rating = getRating(player);
  const [, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const photoUrl = player.instagram ? getPhotoUrl(player) : '';

  return (
    <div
      className={`card-glow spotlight-card group cursor-pointer rounded-sm overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{
        transitionDelay: `${Math.min(index * 0.06, 0.6)}s`,
        background: isActriz
          ? 'linear-gradient(160deg, #1a1505 0%, #0f0d04 40%, #0a1128 100%)'
          : 'linear-gradient(160deg, #0d1a3d 0%, #080e24 40%, #050510 100%)',
        border: '1px solid rgba(255,255,255,0.03)',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(player)}
    >
      {/* === Top Section: Visual Area === */}
      <div className="relative h-[200px] sm:h-[230px] overflow-hidden">
        {/* Unique pattern background */}
        <PlayerPattern name={player.name} isActriz={isActriz} />

        {/* Player photo background - covers the entire card top */}
        {photoUrl && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img
              src={photoUrl}
              alt={player.name}
              className={`w-full h-full object-cover object-top transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            {/* Overlay gradient for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/30 to-transparent" />
            <div className={`absolute inset-0 ${isActriz ? 'bg-[#1a1505]/20' : 'bg-[#0d1a3d]/20'} mix-blend-multiply`} />
          </div>
        )}

        {/* Fallback: initials in hexagonal frame (shown when no photo or loading) */}
        {(!photoUrl || imgError || !imgLoaded) && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${imgLoaded && !imgError ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative">
              <div
                className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: isActriz
                    ? 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.03) 100%)',
                }}
              >
                <span className={`font-bebas text-[26px] sm:text-[30px] ${isActriz ? 'text-[#c9a84c]/50' : 'text-[#2563eb]/50'} select-none`}>
                  {initials}
                </span>
              </div>
              <div
                className="absolute inset-[-6px] sm:inset-[-7px]"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  border: `1px solid ${isActriz ? 'rgba(201,168,76,0.08)' : 'rgba(37,99,235,0.08)'}`,
                  background: 'transparent',
                }}
              />
            </div>
          </div>
        )}

        {/* Giant number watermark */}
        {player.number !== undefined && (
          <div className="absolute -right-2 -top-4 font-bebas text-[140px] sm:text-[160px] leading-none text-white/[0.04] select-none transition-all duration-700 group-hover:text-white/[0.07] group-hover:scale-105">
            {player.number}
          </div>
        )}

        {/* Rating badge (FIFA-style) */}
        <div className="absolute top-3 left-3 flex flex-col items-center z-10">
          <div className={`font-bebas text-[32px] sm:text-[36px] leading-none drop-shadow-lg ${isActriz ? 'text-[#c9a84c]/70 group-hover:text-[#c9a84c]/90' : 'text-[#2563eb]/70 group-hover:text-[#2563eb]/90'} transition-colors duration-500`}>
            {rating}
          </div>
          {player.position && (
            <span className={`font-oswald text-[8px] tracking-[0.2em] uppercase mt-0.5 drop-shadow-lg ${isActriz ? 'text-[#c9a84c]/50' : 'text-[#2563eb]/50'}`}>
              {player.position?.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name overlay at bottom of visual area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-transparent z-10">
          <h3 className="font-bebas text-[22px] sm:text-[26px] leading-none text-white group-hover:text-[#c9a84c] transition-colors duration-300 tracking-wide drop-shadow-lg">
            {player.nickname || player.name.split(' ')[0]}
          </h3>
          <p className="font-oswald text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-white/40 mt-0.5 drop-shadow">
            {player.nickname ? player.name : player.name.split(' ').slice(1).join(' ')}
          </p>
        </div>

        {/* Decorative corners */}
        <div className={`absolute top-3 right-3 w-5 h-5 border-t border-r transition-colors duration-500 z-10 ${isActriz ? 'border-[#c9a84c]/15 group-hover:border-[#c9a84c]/30' : 'border-[#2563eb]/15 group-hover:border-[#2563eb]/30'}`} />
        <div className={`absolute bottom-12 left-3 w-5 h-5 border-b border-l transition-colors duration-500 z-10 ${isActriz ? 'border-[#c9a84c]/15 group-hover:border-[#c9a84c]/30' : 'border-[#2563eb]/15 group-hover:border-[#2563eb]/30'}`} />
      </div>

      {/* === Bottom Section: Stats === */}
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-1.5">
          {player.instagram && player.igFollowers && (
            <div className="flex items-center justify-between group/social">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-[10px] text-white/30 font-light truncate max-w-[100px]">@{player.instagram}</span>
              </div>
              <span className="font-bebas text-[14px] text-[#c9a84c]/70 tracking-wide">{player.igFollowers}</span>
            </div>
          )}
          {player.tiktok && player.tkFollowers && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.28 8.28 0 004.76 1.5V6.95a4.84 4.84 0 01-1-.26z"/>
                </svg>
                <span className="text-[10px] text-white/30 font-light truncate max-w-[100px]">@{player.tiktok}</span>
              </div>
              <span className="font-bebas text-[14px] text-[#c9a84c]/70 tracking-wide">{player.tkFollowers}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out ${isActriz ? 'bg-gradient-to-r from-[#c9a84c] via-[#e2c780] to-[#c9a84c]' : 'bg-gradient-to-r from-[#1a3a8a] via-[#2563eb] to-[#c9a84c]'}`} />
    </div>
  );
}
