import { useInView } from '../hooks/useInView';
import { useCountUp } from '../hooks/useCountUp';

export function Alcance() {
  const { ref, isVisible } = useInView(0.2);

  const ig = useCountUp(20, 2200, isVisible);
  const tk = useCountUp(18, 2200, isVisible);
  const views = useCountUp(5, 2000, isVisible);
  const jugadores = useCountUp(40, 1800, isVisible);

  const countries = [
    { name: 'Argentina', pct: 80.4 },
    { name: 'Uruguay', pct: 3.4 },
    { name: 'España', pct: 2.7 },
    { name: 'Chile', pct: 1.6 },
    { name: 'Otros', pct: 11.9 },
  ];

  return (
    <section id="alcance" ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="section-divider mx-auto mb-16" style={{ maxWidth: '80%' }} />

      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a84c]/[0.02] rounded-full blur-3xl" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 sm:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="font-oswald text-[11px] tracking-[0.4em] uppercase text-[#c9a84c]/60">Para marcas y sponsors</span>
          <h2 className="font-bebas text-[64px] sm:text-[88px] md:text-[120px] leading-[0.85] mt-3">
            <span className="text-white">NUESTRO</span><br />
            <span className="text-gold-gradient italic">alcance</span>
          </h2>
        </div>

        {/* Main stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.3s'}}>
          {[
            { value: `${ig}M`, label: 'Seguidores en Instagram', icon: '📸' },
            { value: `${tk}M`, label: 'Seguidores en TikTok', icon: '🎵' },
            { value: `${views}M+`, label: 'Views por mes', icon: '👁' },
            { value: `${jugadores}+`, label: 'Personalidades', icon: '⭐' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-glow spotlight-card bg-[#101d3f]/50 border border-white/[0.04] p-6 sm:p-8 rounded-sm text-center"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="font-bebas text-[48px] sm:text-[64px] stat-shimmer leading-none">{stat.value}</div>
              <div className="font-oswald text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-[#b0b8c8]/50 mt-2 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Audience breakdown */}
        <div className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-start transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.6s'}}>
          {/* Countries */}
          <div className="bg-[#101d3f]/30 border border-white/[0.04] rounded-sm p-6 sm:p-8">
            <h3 className="font-oswald text-[12px] tracking-[0.2em] uppercase text-[#c9a84c]/60 mb-6">Principales países</h3>
            <div className="flex flex-col gap-4">
              {countries.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] text-white/80 font-light">{c.name}</span>
                    <span className="font-oswald text-[13px] text-[#c9a84c]/80">{c.pct}%</span>
                  </div>
                  <div className="w-full h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e2c780] rounded-full transition-all duration-[2s] ease-out"
                      style={{ width: isVisible ? `${c.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics for brands */}
          <div className="bg-[#101d3f]/30 border border-white/[0.04] rounded-sm p-6 sm:p-8">
            <h3 className="font-oswald text-[12px] tracking-[0.2em] uppercase text-[#c9a84c]/60 mb-6">Por qué activar con AFC</h3>
            <div className="flex flex-col gap-5">
              {[
                { title: 'Audiencia orgánica', desc: '87.4% de las visualizaciones llegan de no-seguidores. Alcance viral genuino.' },
                { title: 'Doble equipo', desc: 'Actores + Actrices. Duplicás la exposición con audiencias masculina y femenina.' },
                { title: 'Cobertura ESPN', desc: 'Presencia televisiva que amplifica cada activación de marca.' },
                { title: 'Contenido semanal', desc: 'Actividad constante en cancha: contenido fresco cada semana, no solo eventos puntuales.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-1 h-full min-h-[40px] bg-gradient-to-b from-[#c9a84c]/40 to-transparent shrink-0 rounded-full" />
                  <div>
                    <div className="font-oswald text-[13px] tracking-[0.05em] uppercase text-white/80 font-medium">{item.title}</div>
                    <p className="text-[12px] text-[#b0b8c8]/50 mt-0.5 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand CTA */}
        <div className={`mt-14 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.9s'}}>
          <a href="mailto:actoresfc@gmail.com" className="inline-flex items-center gap-3 font-oswald text-[12px] tracking-[0.2em] uppercase px-8 py-3.5 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1128] transition-all duration-300">
            <span>Propuestas comerciales</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
