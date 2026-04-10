import { useEffect, useRef, useState } from "react";
import heroImage from "./assets/hero.png";
import "./App.css";

const navigation = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Operating Model", href: "#operating-model" },
  { label: "Contact", href: "#contact" },
];

const signalCards = [
  {
    value: "3",
    label: "Operators",
    detail: "A compact team covering infrastructure, platform, and product delivery.",
  },
  {
    value: "0",
    label: "Cloud Dependencies",
    detail: "Core systems are designed around owned hardware and direct control.",
  },
  {
    value: "24/7",
    label: "State Visibility",
    detail: "Monitoring, auditability, and enforcement are treated as operating requirements.",
  },
  {
    value: "1",
    label: "Governed Stack",
    detail: "Facility, network, compute, and software are treated as one system.",
  },
];

const capabilityCards = [
  {
    title: "Owned Compute",
    text: "Bare-metal AI and application infrastructure operated directly instead of abstracted away behind rented tenancy.",
  },
  {
    title: "Governed Platform",
    text: "A control layer built for validation, operator awareness, and real accountability when systems drift.",
  },
  {
    title: "End-to-End Execution",
    text: "Facility, networking, security, software, and deployment are handled as one continuous responsibility chain.",
  },
];

const operatingModel = [
  {
    title: "Infrastructure First",
    text: "The physical layer is part of the product strategy, not an afterthought delegated to a vendor.",
  },
  {
    title: "Truth Over Theater",
    text: "The goal is to know the system state continuously instead of producing periodic confidence theater.",
  },
  {
    title: "Operators Ship",
    text: "Everyone involved is expected to build, maintain, and improve the actual system in production.",
  },
];

const standards = [
  {
    legacy: "Annual audit cycles",
    current: "Continuous validation with evidence",
  },
  {
    legacy: "Cloud lock-in as default",
    current: "Owned hardware with deliberate control points",
  },
  {
    legacy: "Status reports as reassurance",
    current: "Operational telemetry with clear accountability",
  },
  {
    legacy: "Disconnected infra and product teams",
    current: "One operating model across stack layers",
  },
];

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (isVisible) {
      return undefined;
    }

    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={`fade-in${isVisible ? " is-visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function Starfield() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;

    const buildParticles = () => {
      const count = Math.max(54, Math.min(110, Math.floor((width * height) / 18000)));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.8 + 0.8,
      }));
    };

    const resize = () => {
      ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildParticles();
    };

    const movePointer = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const resetPointer = () => {
      pointerRef.current = { x: -1000, y: -1000 };
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const pointer = pointerRef.current;

      for (const particle of particles) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 180) {
          const pull = (1 - distance / 180) * 0.014;
          particle.vx += dx * pull;
          particle.vy += dy * pull;
        }

        particle.vx *= 0.986;
        particle.vy *= 0.986;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        for (let compare = index + 1; compare < particles.length; compare += 1) {
          const neighbor = particles[compare];
          const dx = particle.x - neighbor.x;
          const dy = particle.y - neighbor.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 140) {
            const alpha = (1 - distance / 140) * 0.22;
            context.strokeStyle = `rgba(139, 211, 255, ${alpha})`;
            context.lineWidth = distance < 70 ? 1.1 : 0.7;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(neighbor.x, neighbor.y);
            context.stroke();
          }
        }
      }

      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = "rgba(220, 242, 255, 0.85)";
        context.fill();

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 3.4, 0, Math.PI * 2);
        context.fillStyle = "rgba(67, 182, 255, 0.08)";
        context.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = total > 0 ? (window.scrollY / total) * 100 : 0;

      setIsScrolled(window.scrollY > 24);
      setProgress(Math.max(0, Math.min(100, nextProgress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <header className={`nav-shell${isScrolled ? " is-scrolled" : ""}`}>
      <div className="nav">
        <a className="brand" href="#top">
          M20R1
        </a>
        <nav className="nav-links" aria-label="Primary">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-status">
          <span>{Math.round(progress)}% scanned</span>
          <a className="button button--solid" href="#contact">
            Start a Brief
          </a>
        </div>
      </div>
      <div className="nav-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero shell" id="top">
      <FadeIn>
        <div className="hero-copy">
          <p className="eyebrow">Operational brief for governed infrastructure</p>
          <h1>Owned infrastructure for systems that cannot afford drift.</h1>
          <p className="hero-lead">
            M20R1 builds and operates the stack directly: facility, network,
            compute, security posture, and software controls. The point is not
            to rent confidence. The point is to know what state the system is in.
          </p>
          <div className="hero-actions">
            <a className="button button--solid" href="#contact">
              Request a briefing
            </a>
            <a className="button button--ghost" href="#capabilities">
              Explore the stack
            </a>
          </div>
          <ul className="hero-chips" aria-label="Operating highlights">
            <li>Owned GPU infrastructure</li>
            <li>In-house network and facility controls</li>
            <li>Operator-led governance workflow</li>
          </ul>
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <aside className="hero-panel">
          <div className="hero-panel__image-wrap">
            <img
              className="hero-panel__image"
              src={heroImage}
              alt="Layered system illustration representing an owned infrastructure stack."
            />
          </div>
          <div className="hero-panel__card">
            <div>
              <p className="panel-label">Operating envelope</p>
              <h2>One accountability chain from hardware to operator console.</h2>
            </div>
            <ul className="panel-list">
              <li>Facility and environment treated as production infrastructure.</li>
              <li>Control-plane design centered on validation, not appearances.</li>
              <li>Small team, direct ownership, fewer handoff seams.</li>
            </ul>
          </div>
        </aside>
      </FadeIn>
    </section>
  );
}

function SignalRail() {
  return (
    <section className="shell section section--tight">
      <FadeIn>
        <div className="signal-grid">
          {signalCards.map((card, index) => (
            <article key={card.label} className="signal-card">
              <span className="signal-index">0{index + 1}</span>
              <strong>{card.value}</strong>
              <h2>{card.label}</h2>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="shell section" id="capabilities">
      <FadeIn>
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Built as one operating surface, not stitched together after the fact.</h2>
          <p className="section-copy">
            M20R1 is positioned around direct ownership of infrastructure,
            governance, and delivery. Each layer below reinforces the same
            idea: fewer black boxes, tighter control, and clearer accountability.
          </p>
        </div>
      </FadeIn>
      <div className="capability-grid">
        {capabilityCards.map((card, index) => (
          <FadeIn key={card.title} delay={0.08 * (index + 1)}>
            <article className="capability-card">
              <span className="card-kicker">Track 0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function OperatingModel() {
  return (
    <section className="shell section" id="operating-model">
      <div className="operating-layout">
        <FadeIn>
          <div className="section-heading">
            <p className="eyebrow">Operating Model</p>
            <h2>Designed to make the real state of the system visible.</h2>
          </div>
        </FadeIn>

        <div className="operating-grid">
          {operatingModel.map((item, index) => (
            <FadeIn key={item.title} delay={0.1 * (index + 1)}>
              <article className="operating-card">
                <span className="operating-count">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Standards() {
  return (
    <section className="shell section">
      <FadeIn>
        <div className="section-heading">
          <p className="eyebrow">The New Standard</p>
          <h2>Position the company against legacy operating assumptions.</h2>
        </div>
      </FadeIn>

      <div className="comparison-list">
        {standards.map((row, index) => (
          <FadeIn key={row.legacy} delay={0.06 * (index + 1)}>
            <div className="comparison-row">
              <p className="comparison-row__legacy">{row.legacy}</p>
              <span className="comparison-row__arrow" aria-hidden="true">
                {"->"}
              </span>
              <p className="comparison-row__current">{row.current}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus("Please fill in your name, email, and message first.");
      return;
    }

    const inquiry = [
      "M20R1 inquiry brief",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company || "Not provided"}`,
      "",
      form.message,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(inquiry);
      setStatus(
        "Inquiry brief copied to your clipboard. You can wire this form to Formspree, Resend, or your own API route next.",
      );
    } catch {
      setStatus(
        "The form is ready, but clipboard access was blocked in this browser. The next production step is wiring it to an inbox or API endpoint.",
      );
    }
  };

  return (
    <section className="shell section" id="contact">
      <FadeIn>
        <div className="contact-panel">
          <div className="contact-copy">
            <p className="eyebrow">Contact</p>
            <h2>Start with a concrete brief.</h2>
            <p className="section-copy">
              Outline the system, constraints, and what kind of operating
              partnership you need. The brief below is structured to make that
              first exchange clear and useful.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              Company
              <input
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                placeholder="Organization"
                autoComplete="organization"
              />
            </label>

            <label>
              What are you building?
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe the system, constraints, and what kind of partnership you are looking for."
              />
            </label>

            <button className="button button--solid" type="submit">
              Copy inquiry brief
            </button>
            <p className="contact-status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer className="shell footer">
      <p>
        <span>M20R1 LLC</span>
        <span>Owned infrastructure. Governed systems. Direct operators.</span>
      </p>
      <span>{new Date().getFullYear()}</span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page">
      <Starfield />
      <div className="page__mesh" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <SignalRail />
        <Capabilities />
        <OperatingModel />
        <Standards />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
