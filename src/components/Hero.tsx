import { useState, useEffect, useMemo } from 'react';

// Animated particles for cinematic background
function HeroParticles() {
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 30; i++) {
      p.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 15 + Math.random() * 25,
        delay: Math.random() * -20,
        opacity: 0.05 + Math.random() * 0.15,
        isGold: Math.random() > 0.7,
      });
    }
    return p;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.isGold ? '#c9a84c' : '#2563eb',
            opacity: p.opacity,
            animation: `heroFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Animated mesh gradient background
function HeroMeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated orb 1 - blue */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(26,58,138,0.3) 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
          animation: 'heroOrb1 20s ease-in-out infinite',
        }}
      />
      {/* Animated orb 2 - gold */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
          bottom: '-5%',
          left: '-5%',
          animation: 'heroOrb2 25s ease-in-out infinite',
        }}
      />
      {/* Animated orb 3 - deep blue */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
          top: '40%',
          left: '30%',
          animation: 'heroOrb3 18s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// Animated scan line effect
function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.03 }}>
      <div
        className="absolute w-full h-[2px] bg-[#c9a84c]"
        style={{
          animation: 'heroScanline 8s linear infinite',
          boxShadow: '0 0 20px 5px rgba(201,168,76,0.3)',
        }}
      />
    </div>
  );
}

export function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a1128] to-[#0a1128]" />

      {/* Animated mesh gradient background */}
      <HeroMeshGradient />

      {/* Particles */}
      <HeroParticles />

      {/* Scan line effect */}
      <ScanLines />

      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'heroGrid 30s linear infinite',
        }}
      />

      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[8%] w-[300px] h-[300px] border border-[#c9a84c]/5 rotate-45 rounded-3xl" style={{ animation: 'heroShapeFloat 20s ease-in-out infinite' }} />
        <div className="absolute top-[20%] left-[10%] w-[280px] h-[280px] border border-[#1a3a8a]/10 rotate-45 rounded-3xl" style={{ animation: 'heroShapeFloat 22s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] border border-[#c9a84c]/5 rotate-12 rounded-3xl" style={{ animation: 'heroShapeFloat 25s ease-in-out infinite' }} />
        <div className="absolute top-[50%] right-[15%] w-[200px] h-[200px] bg-[#1a3a8a]/5 rotate-45 rounded-3xl blur-xl" style={{ animation: 'heroShapeFloat 18s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-[30%] left-[20%] w-[150px] h-[150px] bg-[#c9a84c]/3 rotate-12 rounded-full blur-2xl" style={{ animation: 'heroShapeFloat 15s ease-in-out infinite' }} />
      </div>

      {/* Vertical lines with pulse */}
      <div className="absolute inset-0 flex justify-between px-[10%] pointer-events-none">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#c9a84c]/5 to-transparent" style={{ animation: `heroPulse ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Pre-title */}
        <div className={`transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{transitionDelay: '0.2s'}}>
          <span className="font-oswald text-[11px] sm:text-[13px] tracking-[0.4em] uppercase text-[#c9a84c]/70">
            Fútbol &middot; Cultura &middot; Entretenimiento
          </span>
        </div>

        {/* Main title */}
        <div className={`mt-6 sm:mt-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.5s'}}>
          <h1 className="font-bebas text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] leading-[0.85] tracking-tight">
            <span className="text-white" style={{ textShadow: '0 0 60px rgba(201,168,76,0.1)' }}>ACTORES</span>
            <br />
            <span className="text-gold-gradient" style={{ textShadow: '0 0 80px rgba(201,168,76,0.2)' }}>F.C.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`mt-6 sm:mt-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{transitionDelay: '0.9s'}}>
          <p className="font-inter text-[14px] sm:text-[16px] text-[#b0b8c8] max-w-xl mx-auto leading-relaxed font-light">
            La plataforma que une fútbol real, cultura pop y comunidad.<br className="hidden sm:block" />
            Actores, músicos, streamers y creadores de contenido.
          </p>
        </div>

        {/* Stats row */}
        <div className={`mt-10 sm:mt-14 flex items-center justify-center gap-8 sm:gap-14 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{transitionDelay: '1.2s'}}>
          <div className="text-center">
            <div className="font-bebas text-[36px] sm:text-[48px] text-gold-gradient leading-none">20M</div>
            <div className="font-oswald text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#b0b8c8]/60 mt-1">Instagram</div>
          </div>
          <div className="w-[1px] h-12 bg-[#c9a84c]/20" />
          <div className="text-center">
            <div className="font-bebas text-[36px] sm:text-[48px] text-gold-gradient leading-none">18M</div>
            <div className="font-oswald text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#b0b8c8]/60 mt-1">TikTok</div>
          </div>
          <div className="w-[1px] h-12 bg-[#c9a84c]/20" />
          <div className="text-center">
            <div className="font-bebas text-[36px] sm:text-[48px] text-gold-gradient leading-none">5M+</div>
            <div className="font-oswald text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#b0b8c8]/60 mt-1">Views/mes</div>
          </div>
        </div>

        {/* CTA */}
        <div className={`mt-10 sm:mt-12 flex items-center justify-center gap-4 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{transitionDelay: '1.5s'}}>
          <a href="#actores" className="font-oswald text-[12px] tracking-[0.2em] uppercase px-8 py-3.5 bg-[#c9a84c] text-[#0a1128] hover:bg-[#e2c780] transition-all duration-300 font-semibold">
            Conocé el plantel
          </a>
          <a href="#about" className="font-oswald text-[12px] tracking-[0.2em] uppercase px-8 py-3.5 border border-white/20 text-white/80 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all duration-300">
            Sobre el club
          </a>
        </div>

        {/* Year badge */}
        <div className={`mt-16 transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '1.8s'}}>
          <span className="font-bebas text-[14px] tracking-[0.5em] text-[#c9a84c]/30 uppercase">Est. 2018 &middot; Buenos Aires</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '2.2s'}}>
        <span className="font-oswald text-[10px] tracking-[0.3em] uppercase text-[#b0b8c8]/40">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#c9a84c]/40 to-transparent animate-float" />
      </div>
    </section>
  );
}
