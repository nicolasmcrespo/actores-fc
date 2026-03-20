import { useInView } from '../hooks/useInView';

export function About() {
  const { ref, isVisible } = useInView(0.2);

  return (
    <section id="about" ref={ref} className="relative py-24 sm:py-32 overflow-hidden">
      <div className="section-divider mx-auto mb-20" style={{ maxWidth: '80%' }} />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left - Text */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <span className="font-oswald text-[11px] tracking-[0.4em] uppercase text-[#c9a84c]/60">Sobre el club</span>
            <h2 className="font-bebas text-[56px] sm:text-[72px] md:text-[88px] leading-[0.9] mt-3 text-white">
              NO ES SOLO<br /><span className="text-gold-gradient">FÚTBOL.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-[#b0b8c8] font-light max-w-md">
              Actores Futbol Club es una plataforma deportiva, cultural y de entretenimiento.
              Integrado por actores, músicos, creadores de contenido y ex futbolistas profesionales,
              genera contenido, eventos y experiencias de forma constante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Fútbol Auténtico', 'Impacto Mediático', 'Comunidad', 'Continuidad'].map(tag => (
                <span key={tag} className="font-oswald text-[11px] tracking-[0.15em] uppercase px-4 py-2 border border-[#c9a84c]/20 text-[#c9a84c]/70 hover:bg-[#c9a84c]/5 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Stats cards */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} style={{transitionDelay: '0.3s'}}>
            {[
              { num: '2018', label: 'Fundación', desc: 'Buenos Aires' },
              { num: '40+', label: 'Jugadores', desc: 'Actores & Actrices' },
              { num: 'ESPN', label: 'Cobertura', desc: 'Televisiva' },
              { num: 'GEBA', label: 'Sede', desc: 'Actividad semanal' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="card-glow spotlight-card bg-[#101d3f]/50 border border-white/5 p-5 sm:p-6 rounded-sm"
                style={{ animationDelay: `${i * 0.15}s` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
              >
                <div className="font-bebas text-[32px] sm:text-[40px] text-gold-gradient leading-none">{stat.num}</div>
                <div className="font-oswald text-[11px] tracking-[0.15em] uppercase text-white/60 mt-2">{stat.label}</div>
                <div className="text-[12px] text-[#b0b8c8]/40 mt-1 font-light">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
