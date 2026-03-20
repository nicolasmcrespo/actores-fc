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

function StaffCard({ member }: { member: Staff }) {
  const photoUrl = member.instagram ? `${import.meta.env.BASE_URL}players/${member.instagram}.jpg` : '';
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const roleAbbr = member.role === 'Director Técnico' ? 'DT'
    : member.role === 'Manager' ? 'MGR'
    : 'MKT';

  return (
    <div
      className="card-glow spotlight-card inline-flex items-center gap-4 bg-[#101d3f]/40 border border-[#c9a84c]/10 rounded-sm px-5 py-3.5"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
    >
      <div className="w-12 h-12 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/5 flex items-center justify-center overflow-hidden relative shrink-0">
        {photoUrl && !imgError && (
          <img
            src={photoUrl}
            alt={member.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        {(!photoUrl || imgError || !imgLoaded) && (
          <span className="font-bebas text-[18px] text-[#c9a84c]/60 absolute">{imgLoaded ? '' : (roleAbbr || initials)}</span>
        )}
      </div>
      <div>
        <div className="font-oswald font-semibold text-[14px] tracking-[0.05em] uppercase text-white">{member.name}</div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-[#c9a84c]/60 font-light">{member.role}</span>
          {member.instagram && (
            <span className="text-[11px] text-[#b0b8c8]/40">@{member.instagram}{member.igFollowers ? ` · ${member.igFollowers}` : ''}</span>
          )}
        </div>
      </div>
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

        {/* Staff cards */}
        {staff && staff.length > 0 && (
          <div className={`mb-8 flex flex-wrap gap-3 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
            {staff.map((member) => (
              <StaffCard key={member.instagram} member={member} />
            ))}
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
