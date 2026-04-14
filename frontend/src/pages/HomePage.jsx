import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const features = [
  {
    letter: "D",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "Dijkstra's Algorithm",
    desc: "Computes the single optimal path by distance, time, or cost with mathematical certainty — guaranteed shortest path every time.",
  },
  {
    letter: "Y",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    title: "Yen's K-Shortest Paths",
    desc: "Discover the top 3 ranked alternative routes so you're never stranded by network closures or unexpected disruptions.",
  },
  {
    letter: "L",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    title: "Live Simulation",
    desc: "Visualize station closures and congestion in real time, watching route algorithms adapt dynamically to network changes.",
  },
];


function animateCount(el, target, suffix) {
  let start = null;
  const dur = 1200;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function HomePage() {
  const counterRefs = useRef([]);
  const countedRef  = useRef(false);

  useEffect(() => {
    /* ── Scroll-reveal (up & down) ── */
    const revealEls = document.querySelectorAll(".sr");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("sr-visible");
            el.classList.remove("sr-up");
          } else {
            if (entry.boundingClientRect.top < 0) {
              // scrolled past → exit upward
              el.classList.remove("sr-visible");
              el.classList.add("sr-up");
              // reset counters so they re-animate on scroll back
              countedRef.current = false;
              counterRefs.current.forEach((c) => {
                if (c) c.textContent = "0" + (c.dataset.suffix || "");
              });
            } else {
              // below viewport → reset to enter-from-below
              el.classList.remove("sr-visible", "sr-up");
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    /* ── Counter trigger ── */
    const statsBar = document.querySelector(".stats-bar");
    const counterIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countedRef.current) {
          countedRef.current = true;
          counterRefs.current.forEach((el) => {
            if (el && el.dataset.target) {
              animateCount(el, +el.dataset.target, el.dataset.suffix || "");
            }
          });
        }
      },
      { threshold: 0.3 }
    );
    if (statsBar) counterIO.observe(statsBar);

    /* ── Aurora parallax on scroll ── */
    const o1 = document.querySelector(".orb-1");
    const o2 = document.querySelector(".orb-2");
    const o3 = document.querySelector(".orb-3");
    const onScroll = () => {
      const y = window.scrollY;
      if (o1) o1.style.transform = `translate(${y * 0.03}px, ${y * 0.05}px)`;
      if (o2) o2.style.transform = `translate(${-y * 0.04}px, ${y * 0.02}px)`;
      if (o3) o3.style.transform = `translate(${y * 0.02}px, ${-y * 0.03}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      counterIO.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* ── Global scroll-reveal styles ── */}
      <style>{`
        .sr {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity .7s cubic-bezier(.22,1,.36,1),
                      transform .7s cubic-bezier(.22,1,.36,1);
        }
        .sr-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .sr-up       { opacity: 0 !important; transform: translateY(-28px) !important; }
        .sr-d1 { transition-delay: .1s }
        .sr-d2 { transition-delay: .2s }
        .sr-d3 { transition-delay: .3s }
        .sr-d4 { transition-delay: .4s }

        /* Aurora orbs */
        @keyframes drift {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px,20px) scale(1.08); }
        }
        .aurora-orb { animation: drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation-duration: 10s; animation-delay: -5s; }
        .orb-3 { animation-duration: 16s; animation-delay: -3s; }

        /* Pill dot pulse */
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.3 } }
        .pill-dot { animation: pulse 2s ease-in-out infinite; }

        /* Train chug */
        @keyframes chug {
          0%,100% { transform: translateX(0) rotate(-.3deg); }
          50%     { transform: translateX(2px) rotate(.3deg); }
        }
        .train-body { animation: chug 3s ease-in-out infinite; }

        /* Steam puffs */
        @keyframes puff {
          0%   { opacity:.5; transform: translateY(0) scale(1); }
          100% { opacity:0;  transform: translateY(-20px) scale(2.5); }
        }
        .puff   { animation: puff 2s ease-out infinite; }
        .puff-2 { animation-delay:.4s; }
        .puff-3 { animation-delay:.8s; }

        /* Scroll hint bounce */
        @keyframes bounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(6px); }
        }
        .scroll-hint { animation: bounce 2s ease-in-out infinite; }

        /* Feature card glow line */
        .feat-card .card-glow { opacity: 0; transition: opacity .35s; }
        .feat-card:hover .card-glow { opacity: 1; }
        .feat-card { transition: all .35s cubic-bezier(.22,1,.36,1); }
        .feat-card:hover { transform: translateY(-6px) !important; }
      `}</style>

      <main className="min-h-screen bg-rail-bg text-rail-text font-body pt-24 overflow-x-hidden">

        {/* ── Aurora ── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="orb-1 aurora-orb absolute w-[500px] h-[300px] rounded-full -top-20 -left-24"
            style={{ background: "rgba(59,111,232,.18)", filter: "blur(80px)" }} />
          <div className="orb-2 aurora-orb absolute w-[400px] h-[400px] rounded-full top-[30%] -right-28"
            style={{ background: "rgba(91,79,207,.14)", filter: "blur(80px)" }} />
          <div className="orb-3 aurora-orb absolute w-[350px] h-[250px] rounded-full bottom-[20%] left-[20%]"
            style={{ background: "rgba(56,189,248,.10)", filter: "blur(80px)" }} />
        </div>

        {/* Noise */}
        <div className="fixed inset-0 pointer-events-none z-[1] opacity-[.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

        {/* ── Hero ── */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-28">

          {/* Pill */}
          <div className="sr sr-d1 sr-visible flex justify-center mb-7">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/7 text-blue-400 text-[11px] font-medium tracking-widest uppercase">
              <span className="pill-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
              Graph-powered route intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="sr sr-d2 sr-visible font-display font-black text-white leading-[1.08] mb-6"
            style={{ fontSize: "clamp(40px,7vw,78px)" }}>
            Railway Route
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Optimization
            </span>
          </h1>

          {/* Sub */}
          <p className="sr sr-d3 sr-visible text-rail-muted font-light leading-relaxed max-w-lg mx-auto mb-10"
            style={{ fontSize: "clamp(15px,2vw,18px)" }}>
            Navigate complex rail networks with precision. Find the fastest, shortest,
            or most cost-efficient routes using advanced graph algorithms.
          </p>

          {/* CTAs */}
          <div className="sr sr-d4 sr-visible flex flex-wrap gap-3 justify-center mb-10">
            <Link to="/planner"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-medium text-white no-underline
                bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] shadow-lg shadow-blue-700/40
                hover:brightness-110 hover:-translate-y-0.5 active:scale-97 transition-all">
              Plan a Route →
            </Link>
            <Link to="/admin"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-light text-rail-text/80 no-underline
                border border-white/12 bg-white/4 backdrop-blur-md
                hover:bg-white/8 hover:border-white/22 hover:-translate-y-0.5 transition-all">
              Admin Panel
            </Link>
          </div>

          {/* Mini train */}
          <div className="sr sr-visible relative w-64 h-16 mx-auto" style={{ transitionDelay: ".5s" }}>
            {/* Steam puffs */}
            <div className="absolute bottom-10 left-7 flex gap-1">
              <div className="puff puff-1 w-2 h-2 rounded-full bg-white/10" />
              <div className="puff puff-2 w-3 h-3 rounded-full bg-white/10" />
              <div className="puff puff-3 w-2 h-2 rounded-full bg-white/10" />
            </div>
            {/* Train */}
            <div className="train-body absolute bottom-3 left-5 flex gap-1">
              <div className="h-7 w-12 rounded-md bg-gradient-to-br from-[#1e3a6e] to-[#253b80] border border-white/10" />
              <div className="h-7 w-9 rounded-md bg-rail-surface border border-white/10" />
              <div className="h-7 w-8 rounded-md bg-rail-surface border border-white/10" />
              <div className="h-7 w-7 rounded-md bg-rail-surface border border-white/10" />
            </div>
            {/* Track */}
            <div className="absolute bottom-2 left-0 right-0 h-[2px] rounded-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.15) 20%,rgba(255,255,255,.15) 80%,transparent)" }} />
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint absolute bottom-8 left-1/2 flex flex-col items-center gap-1.5">
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom,transparent,rgba(255,255,255,.25))" }} />
            <span className="text-[10px] text-white/20 tracking-widest uppercase">scroll</span>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-rail-bg pointer-events-none" />
        </section>


        {/* ── Features ── */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
          <div className="sr flex items-center gap-4 mb-12">
            <span className="text-[11px] font-medium tracking-[.18em] uppercase text-rail-dim whitespace-nowrap">
              Core capabilities
            </span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map(({ letter, color, bg, title, desc }, i) => (
              <article key={title}
                className={`feat-card sr sr-d${i + 1} relative p-9 rounded-2xl border border-white/7 bg-rail-surface backdrop-blur-xl overflow-hidden
                  hover:border-blue-400/28 hover:bg-blue-400/4`}>
                {/* Top glow line */}
                <div className="card-glow absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(91,142,255,.5),transparent)" }} />
                {/* Inner gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/4 to-transparent pointer-events-none" />

                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 font-display font-black italic text-xl ${color} ${bg}`}>
                  {letter}
                </div>
                <h3 className="relative font-display text-[22px] font-bold text-rail-text mb-3">{title}</h3>
                <p className="relative text-rail-muted text-sm font-light leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="relative z-10 px-6 pb-24">
          <div className="sr relative max-w-3xl mx-auto rounded-3xl overflow-hidden text-center px-12 py-16
            bg-gradient-to-br from-blue-600/18 to-indigo-600/18 border border-blue-400/20">

            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(91,142,255,0.18)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
              </svg>
            </div>

            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48
              bg-[radial-gradient(ellipse,rgba(91,142,255,0.15),transparent_70%)] pointer-events-none" />

            <h2 className="relative font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(26px,4vw,42px)" }}>
              Ready to chart your route?
            </h2>
            <p className="relative text-rail-muted text-[15px] font-light leading-relaxed mb-9">
              Open the route planner and let the algorithms do the heavy lifting.
            </p>
            <Link to="/planner"
              className="relative inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-medium text-white no-underline
                bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] shadow-lg shadow-blue-700/40
                hover:brightness-110 hover:-translate-y-0.5 active:scale-97 transition-all">
              Get Started →
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <hr className="relative z-10 border-none border-t border-white/8 m-0" />
        <footer className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-black italic text-xl text-rail-accent tracking-tight">RailRoute</span>
            <span className="text-white/10 text-xl">|</span>
            <span className="text-rail-dim text-[11px] tracking-[.15em] uppercase font-medium">Route Optimizer</span>
          </div>
          <p className="text-rail-dim text-[12px] font-light tracking-wide">
            FastAPI &nbsp;·&nbsp; MongoDB &nbsp;·&nbsp; D3.js &nbsp;·&nbsp; React
          </p>
        </footer>

      </main>
    </>
  );
}

export default HomePage;