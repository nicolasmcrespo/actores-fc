import { useEffect, useState } from 'react';
import { type Player } from '../data/players';

interface Props {
  player: Player | null;
  onClose: () => void;
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

export function PlayerModal({ player, onClose }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (player) {
      setImgLoaded(false);
      setImgError(false);
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
    }
  }, [player, onClose]);

  if (!player) return null;

  const isActriz = player.type === 'actriz';
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rating = getRating(player);
  const photoUrl = player.instagram ? `https://unavatar.io/instagram/${player.instagram}` : '';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050510]/90 backdrop-blur-md animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.4s' }}
      >
        {/* Close btn */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-white/40 hover:text-[#c9a84c] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div
          className="rounded-sm overflow-hidden"
          style={{
            background: isActriz
              ? 'linear-gradient(160deg, #1a1505 0%, #0f0d04 40%, #0a1128 100%)'
              : 'linear-gradient(160deg, #0d1a3d 0%, #080e24 40%, #050510 100%)',
            border: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          {/* Top visual area */}
          <div className="relative h-[260px] sm:h-[300px] overflow-hidden">
            {/* Player photo background */}
            {photoUrl && !imgError && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={photoUrl}
                  alt={player.name}
                  className={`w-full h-full object-cover object-top transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-[#050510]/20" />
                <div className={`absolute inset-0 ${isActriz ? 'bg-[#1a1505]/30' : 'bg-[#0d1a3d]/30'} mix-blend-multiply`} />
              </div>
            )}

            {/* Fallback initials */}
            {(!photoUrl || imgError || !imgLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: isActriz
                      ? 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.03) 100%)'
                      : 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.03) 100%)',
                  }}
                >
                  <span className={`font-bebas text-[44px] sm:text-[52px] ${isActriz ? 'text-[#c9a84c]/50' : 'text-[#2563eb]/50'} select-none`}>
                    {initials}
                  </span>
                </div>
              </div>
            )}

            {/* Giant number */}
            {player.number !== undefined && (
              <div className="absolute -right-4 -top-8 font-bebas text-[220px] sm:text-[280px] leading-none text-white/[0.04] select-none">
                {player.number}
              </div>
            )}

            {/* Rating */}
            <div className="absolute top-6 left-6 z-10">
              <div className={`font-bebas text-[56px] leading-none drop-shadow-lg ${isActriz ? 'text-[#c9a84c]/50' : 'text-[#2563eb]/50'}`}>{rating}</div>
              {player.position && (
                <div className={`font-oswald text-[11px] tracking-[0.2em] uppercase mt-1 drop-shadow ${isActriz ? 'text-[#c9a84c]/40' : 'text-[#2563eb]/40'}`}>{player.position}</div>
              )}
            </div>

            {/* Corners */}
            <div className={`absolute top-4 right-12 w-6 h-6 border-t border-r z-10 ${isActriz ? 'border-[#c9a84c]/15' : 'border-[#2563eb]/15'}`} />
            <div className={`absolute bottom-4 left-4 w-6 h-6 border-b border-l z-10 ${isActriz ? 'border-[#c9a84c]/15' : 'border-[#2563eb]/15'}`} />

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-transparent z-10">
              <h2 className="font-bebas text-[40px] sm:text-[52px] leading-none text-white tracking-wide drop-shadow-lg">
                {player.name}
              </h2>
              {player.nickname && (
                <p className="font-oswald text-[13px] tracking-[0.15em] uppercase text-[#c9a84c]/50 mt-1">"{player.nickname}"</p>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="p-6 sm:p-8">
            {/* Team badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a3a8a 0%, #0a1128 100%)', border: '1px solid rgba(201,168,76,0.3)'}}>
                <span className="font-bebas text-[#c9a84c] text-sm leading-none">A</span>
              </div>
              <div>
                <span className="font-oswald text-[11px] tracking-[0.15em] uppercase text-white/40">
                  {isActriz ? 'Actrices Futbol Club' : 'Actores Futbol Club'}
                </span>
                {player.number !== undefined && (
                  <span className="font-oswald text-[11px] tracking-[0.15em] uppercase text-[#c9a84c]/40 ml-2">
                    #{player.number}
                  </span>
                )}
              </div>
            </div>

            {/* Social section */}
            <div className="flex flex-col gap-3">
              <h4 className="font-oswald text-[10px] tracking-[0.3em] uppercase text-white/20">Redes Sociales</h4>

              {player.instagram && player.igFollowers && (
                <a
                  href={`https://instagram.com/${player.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-sm hover:bg-white/[0.04] hover:border-[#c9a84c]/10 transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/30 group-hover/link:text-[#c9a84c]/60 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <div>
                      <div className="text-[12px] text-white/60 font-medium">Instagram</div>
                      <div className="text-[10px] text-white/25 font-light">@{player.instagram}</div>
                    </div>
                  </div>
                  <span className="font-bebas text-[20px] text-[#c9a84c]/60 tracking-wide">{player.igFollowers}</span>
                </a>
              )}

              {player.tiktok && player.tkFollowers && (
                <a
                  href={`https://tiktok.com/@${player.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-sm hover:bg-white/[0.04] hover:border-[#c9a84c]/10 transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/30 group-hover/link:text-[#c9a84c]/60 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.28 8.28 0 004.76 1.5V6.95a4.84 4.84 0 01-1-.26z"/>
                    </svg>
                    <div>
                      <div className="text-[12px] text-white/60 font-medium">TikTok</div>
                      <div className="text-[10px] text-white/25 font-light">@{player.tiktok}</div>
                    </div>
                  </div>
                  <span className="font-bebas text-[20px] text-[#c9a84c]/60 tracking-wide">{player.tkFollowers}</span>
                </a>
              )}
            </div>

            {/* Bottom text */}
            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <p className="text-[11px] text-white/15 font-light text-center">
                {isActriz ? 'ACTRICES' : 'ACTORES'} FUTBOL CLUB &middot; EST. 2018 &middot; BUENOS AIRES
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
