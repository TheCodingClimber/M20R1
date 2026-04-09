import { useState, useEffect, useRef } from "react";

const VIOLET = "#8B5CF6";
const VIOLET_DIM = "rgba(139,92,246,0.06)";
const VIOLET_GLOW = "rgba(139,92,246,0.25)";
const ELECTRIC = "#C4B5FD";
const BG = "#08070C";
const BG_CARD = "#0E0D14";
const TEXT = "#EEEDF2";
const TEXT_DIM = "#5C5A66";
const BORDER = "rgba(139,92,246,0.07)";
const DISPLAY = "'Orbitron', sans-serif";
const SANS = "'Plus Jakarta Sans', sans-serif";
const MONO = "'Fira Code', monospace";

function NeuralCanvas() {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w, h, frame;
    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = document.documentElement.scrollHeight;
      c.style.height = h + "px";
      const count = Math.min(150, Math.floor((w * h) / 12000));
      nodesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.8, pulseOffset: Math.random() * Math.PI * 2,
      }));
    };
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", () => { mouseRef.current.y = mouseRef.current.y; });
    resize();
    window.addEventListener("resize", resize);
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.008;
      const nodes = nodesRef.current;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mx - n.x, dy = my - n.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 200) {
          const force = (1 - md / 200) * 0.015;
          n.vx += dx * force; n.vy += dy * force;
          n.vx *= 0.985; n.vy *= 0.985;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.1;
            const firing = Math.sin(t * 3 + i + j) > 0.75;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = firing ? `rgba(139,92,246,${alpha * 3})` : `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = firing ? 1.2 : 0.4; ctx.stroke();
            if (firing) {
              const p = (Math.sin(t * 5 + i) + 1) / 2;
              ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(196,181,253,${alpha * 4})`; ctx.fill();
            }
          }
        }
      }
      for (const n of nodes) {
        const pulse = Math.sin(t * 2 + n.pulseOffset) * 0.3 + 0.7;
        const dx = mx - n.x, dy = my - n.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        const boost = md < 150 ? (1 - md / 150) * 0.5 : 0;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 1.5 + boost * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${pulse * 0.12 + boost * 0.25})`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${pulse * 0.5 + boost})`; ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)",
      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>{children}</div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(8,7,12,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.4s",
    }}>
      <div style={{
        padding: "1.25rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 14, color: TEXT, fontWeight: 700, letterSpacing: 4 }}>M20R1</span>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_DIM }}>{Math.round(pct)}% SCANNED</span>
          <a href="#contact" style={{
            fontFamily: SANS, fontSize: 12, color: BG, textDecoration: "none", fontWeight: 700,
            padding: "0.5rem 1.5rem", background: VIOLET, borderRadius: 2,
          }}>Contact</a>
        </div>
      </div>
      <div style={{ height: 2, background: BORDER }}>
        <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg, ${VIOLET}, ${ELECTRIC})`, transition: "width 0.1s" }} />
      </div>
    </nav>
  );
}

const col = { maxWidth: 680, margin: "0 auto", padding: "0 2rem" };

function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 300); }, []);
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", ...col }}>
      <div style={{
        fontFamily: MONO, fontSize: 10, color: VIOLET, letterSpacing: 4, marginBottom: "2rem",
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
      }}>DOCUMENT CLASS: OPERATIONAL BRIEF — M20R1 LLC</div>
      <h1 style={{
        fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900,
        lineHeight: 1.1, color: TEXT, margin: 0, letterSpacing: 2,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(25px)",
        transition: "all 0.8s ease 0.4s",
      }}>
        We build technology<br />that governs itself.
      </h1>
      <div style={{
        width: 40, height: 2, background: VIOLET, margin: "2rem 0",
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 0.8s",
      }} />
      <p style={{
        fontFamily: SANS, fontSize: 17, lineHeight: 1.9, color: TEXT_DIM, margin: 0,
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 1s",
      }}>
        M20R1 is a technology company that builds and operates real infrastructure.
        We own NVIDIA deep learning servers. We built our own facility. We run our
        own network, our own security, and our own deployment pipeline.
      </p>
    </section>
  );
}

function BigQuote() {
  return (
    <section style={{ padding: "8rem 2rem" }}>
      <FadeIn>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: DISPLAY, fontSize: "clamp(1.5rem, 4vw, 3rem)", fontWeight: 800,
            lineHeight: 1.25, letterSpacing: 1,
            background: `linear-gradient(135deg, ${VIOLET}, ${ELECTRIC})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            "We do not outsource our compute to a cloud provider and call ourselves
            a tech company."
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Dossier() {
  const entries = [
    { classification: "INFRASTRUCTURE", content: "NVIDIA deep learning servers commissioned and operated in-house. Commercial-grade HVAC, electrical, plumbing, and networking — built from raw space to production-ready. No cloud dependency. No shared tenancy." },
    { classification: "PLATFORM", content: "Aletheos is our flagship — a governed operations console with real-time enforcement, cryptographic audit trails, and operator control from desktop and mobile. We built it because we needed it. We are our own first customer." },
    { classification: "TEAM", content: "Three members. Full technology stack coverage. Governance and platform architecture. Infrastructure and security engineering. Full-stack software development and SaaS delivery. Every member is a hands-on technical contributor. No passengers. No advisory titles." },
    { classification: "GOVERNANCE", content: "Real-time control plane that validates state integrity, detects drift, enforces rules, and surfaces the truth to the operator — continuously. Not compliance checklists. Not annual audits. Continuous enforcement with cryptographic proof." },
  ];
  return (
    <section style={{ ...col, padding: "0 2rem 6rem" }}>
      {entries.map((e, i) => (
        <FadeIn key={i} delay={i * 0.08}>
          <div style={{
            marginBottom: "4rem", paddingLeft: "2rem",
            borderLeft: `2px solid ${i === entries.length - 1 ? VIOLET : BORDER}`,
          }}>
            <div style={{
              fontFamily: DISPLAY, fontSize: 9, letterSpacing: 5, color: VIOLET,
              marginBottom: "1rem", fontWeight: 400,
            }}>{e.classification}</div>
            <p style={{
              fontFamily: SANS, fontSize: 16, lineHeight: 1.9, color: TEXT_DIM, margin: 0,
            }}>{e.content}</p>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}

function FullWidthBreak() {
  return (
    <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
      <FadeIn>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", gap: "3rem", fontFamily: MONO, fontSize: 11, color: TEXT_DIM,
          }}>
            {[
              { val: "3", label: "OPERATORS" },
              { val: "0", label: "CLOUD DEPS" },
              { val: "24/7", label: "MONITORED" },
              { val: "∞", label: "TIME HORIZON" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: DISPLAY, fontSize: 28, fontWeight: 800,
                  color: i === 3 ? VIOLET : TEXT, marginBottom: "0.25rem",
                }}>{s.val}</div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: TEXT_DIM }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Standard() {
  return (
    <section style={{ ...col, padding: "2rem 2rem 8rem" }}>
      <FadeIn>
        <div style={{
          fontFamily: DISPLAY, fontSize: 9, letterSpacing: 5, color: VIOLET,
          marginBottom: "1.5rem",
        }}>THE NEW STANDARD</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { old: "Annual audits", now: "Continuous state validation" },
            { old: "Cloud provider lock-in", now: "Self-owned bare metal" },
            { old: "Compliance theater", now: "Real-time rule enforcement" },
            { old: "Status reports", now: "Cryptographic proof of state" },
            { old: "Advisory titles", now: "Every operator builds and ships" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", padding: "1.25rem 0",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{
                fontFamily: MONO, fontSize: 13, color: TEXT_DIM, flex: 1,
                textDecoration: "line-through", opacity: 0.4,
              }}>{row.old}</span>
              <svg width="24" height="12" viewBox="0 0 24 12" style={{ margin: "0 1.5rem", flexShrink: 0 }}>
                <line x1="0" y1="6" x2="20" y2="6" stroke={VIOLET} strokeWidth="1" />
                <polyline points="16,2 22,6 16,10" fill="none" stroke={VIOLET} strokeWidth="1" />
              </svg>
              <span style={{
                fontFamily: SANS, fontSize: 14, color: ELECTRIC, flex: 1, fontWeight: 600, textAlign: "right",
              }}>{row.now}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [focused, setFocused] = useState(null);
  const inp = (field) => ({
    width: "100%", padding: "1rem 0", fontFamily: SANS, fontSize: 15,
    background: "transparent", border: "none",
    borderBottom: `1px solid ${focused === field ? VIOLET : BORDER}`,
    color: TEXT, outline: "none", transition: "border-color 0.3s", boxSizing: "border-box",
  });
  return (
    <section id="contact" style={{ ...col, padding: "0 2rem 8rem" }}>
      <FadeIn>
        <div style={{
          borderTop: `1px solid ${BORDER}`, paddingTop: "4rem",
        }}>
          <div style={{
            fontFamily: DISPLAY, fontSize: 9, letterSpacing: 5, color: VIOLET,
            marginBottom: "1rem",
          }}>CONTACT</div>
          <h2 style={{
            fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: TEXT,
            margin: "0 0 0.75rem", letterSpacing: 1,
          }}>Reach the operators.</h2>
          <p style={{
            fontFamily: SANS, fontSize: 14, color: TEXT_DIM, lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}>
            We respond to people who build things. State your purpose.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <input placeholder="Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              style={inp("name")} />
            <input placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              style={inp("email")} />
            <textarea placeholder="Message" rows={5} value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
              style={{ ...inp("message"), resize: "vertical", fontFamily: SANS }} />
            <button style={{
              alignSelf: "flex-start", padding: "0.8rem 2.5rem", marginTop: "0.5rem",
              background: VIOLET, border: "none", color: "#fff", borderRadius: 2,
              fontFamily: SANS, fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 30px ${VIOLET_GLOW}`; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
            >Send Message</button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ ...col, padding: "2rem", borderTop: `1px solid ${BORDER}`,
      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: SANS, fontSize: 12, color: TEXT_DIM }}>© {new Date().getFullYear()} M20R1 LLC</span>
      <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_DIM, letterSpacing: 2 }}>A NOVE MANI COMPANY</span>
    </footer>
  );
}

export default function M20R1Dossier() {
  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      <NeuralCanvas />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <Hero />
        <BigQuote />
        <Dossier />
        <FullWidthBreak />
        <Standard />
        <ContactForm />
        <Footer />
      </div>
    </div>
  );
}
