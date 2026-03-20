import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { PlayerCard } from './PlayerCard';
import { type Player, type Staff } from '../data/players';

interface Props {
  id: string;
  title: string;
  subtitle: string;
  players: Player[];
  accent?: 'blue' | 'gold';
  staff?: Staff[];
  onSelectPlayer?: (player: Player) => void;
}

function StaffCard({ member, index }: { member: Staff; index: number }) {
  const photoUrl = member.instagram ? `${import.meta.env.BASE_URL}players/${member.instagram}.jpg` : '';
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const roleAbbr = member.role === 'Director Técnico' ? 'DT'
    : member.role === 'Manager' ? 'MGR'
    : 'MKT';

  return (
    <div
      className="card-glow spotlight-card group relative overflow-hidden rounded-sm"
      style={{
        background: 'linear-gradient(160deg, #12203f 0%, #0c1428 50%, #0a1128 100%)',
        border: '1px solid rgba(201,168,76,0.15)',
        animationDelay: `${index * 0.15}s`,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
    >
      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent" />

      <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-7">
        {/* Photo with gold ring */}
        <div className="relative mb-5">
          {/* Animated gold ring */}
          <div
            className="absolute -inset-[3px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #c9a84c, transparent, #c9a84c, transparent)',
              animation: `spin 6s linear infinite`,
            }}
          />
          <div className="relative w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden border-2 border-[#0a1128] bg-[#0a1128]">
            {photoUrl && !imgError && (
              <img
                src={photoUrl}
                alt={member.name}
                className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}
            {(!photoUrl || imgError || !imgLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a3a8a]/30 to-[#0a1128]">
                <span className="font-bebas text-[32px] sm:text-[36px] text-[#c9a84c]/50">{initials}</span>
              </div>
            )}
          </div>
          {/* Role badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
            <span className="font-bebas text-[13px] tracking-[0.15em] px-3 py-0.5 bg-[#c9a84c] text-[#0a1128] leading-none whitespace-nowrap">
              {roleAbbr}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bebas text-[24px] sm:text-[28px] text-white leading-none tracking-wide group-hover:text-[#c9a84c] transition-colors duration-300">
          {member.name}
        </h3>

        {/* Role */}
        <span className="font-oswald text-[11px] tracking-[0.2em] uppercase text-[#c9a84c]/50 mt-1.5">
          {member.role}
        </span>

        {/* Divider */}
        <div className="w-8 h-[1px] bg-[#c9a84c]/20 mt-4 mb-3" />

        {/* Instagram */}
        {member.instagram && (
          <a
            href={`https://instagram.com/${member.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#b0b8c8]/40 hover:text-[#c9a84c]/70 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="text-[11px] font-light">@{member.instagram}</span>
            {member.igFollowers && (
              <span className="font-bebas text-[14px] text-[#c9a84c]/50 ml-1">{member.igFollowers}</span>
            )}
          </a>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#c9a84c]/20 group-hover:border-[#c9a84c]/40 transition-colors duration-500" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#c9a84c]/20 group-hover:border-[#c9a84c]/40 transition-colors duration-500" />
    </div>
  );
}

export function Squad({ id, title, subtitle, players, staff, onSelectPlayer }: Props) {
  const { ref, isVisible } = useInView(0.05);
  const [showAll, setShowAll] = useState(false);
  const visiblePlayers = showAll ? players : players.slice(0, 8);

  return (
    <section id={id} ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="section-divider mx-auto mb-16" style={{ maxWidth: '80%' }} />

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section header */}
        <div className={`mb-12 sm:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-end gap-4 sm:gap-6">
            <div>
              <span className="font-oswald text-[11px] tracking-[0.4em] uppercase text-[#c9a84c]/60">{subtitle}</span>
              <h2 className="font-bebas text-[64px] sm:text-[88px] md:text-[110px] leading-[0.85] mt-1">
                <span className="text-white">{title.split(' ')[0]} </span>
                <span className="text-gold-gradient">{title.split(' ').slice(1).join(' ')}</span>
              </h2>
            </div>
            <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-[#c9a84c]/20 to-transparent mb-4" />
            <div className="hidden sm:block mb-4">
              <span className="font-bebas text-[48px] text-white/[0.06]">{players.length}</span>
            </div>
          </div>
        </div>

        {/* Staff section */}
        {staff && staff.length > 0 && (
          <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45" />
              <span className="font-oswald text-[11px] tracking-[0.3em] uppercase text-[#c9a84c]/50">Cuerpo Técnico & Staff</span>
              <div className="flex-1 h-[1px] bg-[#c9a84c]/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {staff.map((member, i) => (
                <StaffCard key={member.instagram} member={member} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {visiblePlayers.map((player, i) => (
            <PlayerCard key={player.name} player={player} index={i} isVisible={isVisible} onSelect={onSelectPlayer} />
          ))}
        </div>

        {/* Show more */}
        {players.length > 8 && !showAll && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="font-oswald text-[12px] tracking-[0.2em] uppercase px-8 py-3 border border-[#c9a84c]/30 text-[#c9a84c]/70 hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] transition-all duration-300"
            >
              Ver todos ({players.length - 8} más)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
