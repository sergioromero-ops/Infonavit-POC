import { useState } from "react";
import {
  architecture,
  experiences,
  journeys,
  metrics,
  roadmap,
  roleScreens,
} from "./data";

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p className="section-copy">{body}</p> : null}
    </div>
  );
}

function App() {
  const [activeJourney, setActiveJourney] = useState(0);
  const [activeRole, setActiveRole] = useState(0);

  const journey = journeys[activeJourney];
  const role = roleScreens[activeRole];

  return (
    <div className="page-shell">
      <header className="hero">
        <nav className="topbar">
          <span className="brand">Infonavit POC</span>
          <div className="pill-row">
            <span className="pill">Interno</span>
            <span className="pill">Proveedores</span>
            <span className="pill">Derechohabientes</span>
          </div>
        </nav>

        <section className="hero-grid">
          <div>
            <p className="eyebrow">React Demo Experience</p>
            <h1>Una propuesta digital para todo el ecosistema de servicio.</h1>
            <p className="lead">
              La POC ahora vive como aplicacion React y presenta journeys ejecutivos junto con
              pantallas detalladas por audiencia para contar una historia completa de operacion y
              autoservicio.
            </p>
            <div className="cta-row">
              <a href="#role-screens" className="button primary">
                Explorar pantallas
              </a>
              <a href="#architecture" className="button secondary">
                Revisar arquitectura
              </a>
            </div>
          </div>

          <aside className="hero-panel">
            <h2>Indicadores esperados</h2>
            <div className="metric-grid">
              {metrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-label">{metric.label}</div>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </header>

      <main>
        <section className="section">
          <SectionHeading
            eyebrow="Mapa de Solucion"
            title="Tres experiencias, una misma capa de orquestacion."
          />
          <div className="experience-grid">
            {experiences.map((item) => (
              <article className="experience-card" key={item.title}>
                <span className="card-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="role-screens">
          <SectionHeading
            eyebrow="Pantallas por Rol"
            title="Vistas detalladas para demo guiada por audiencia."
            body="Cada vista representa una conversacion distinta: operacion interna, colaboracion con proveedores y experiencia de derechohabientes."
          />
          <div className="tabs">
            {roleScreens.map((item, index) => (
              <button
                key={item.key}
                className={`tab ${index === activeRole ? "active" : ""}`}
                onClick={() => setActiveRole(index)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <article className={`role-stage ${role.theme}`}>
            <div className="role-stage-header">
              <div>
                <span className="card-tag">{role.label}</span>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
              <div className="stage-highlight">
                <strong>{role.heroStat}</strong>
                <span>{role.heroDetail}</span>
              </div>
            </div>

            <div className="role-columns">
              {role.columns.map((column) => (
                <section className="role-card" key={column.title}>
                  <h4>{column.title}</h4>
                  <ul>
                    {column.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <section className="timeline-card">
              <h4>Linea de tiempo del journey</h4>
              <div className="timeline-list">
                {role.timeline.map((item) => (
                  <div className="timeline-item" key={item}>
                    <span className="timeline-dot" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </section>

        <section className="section" id="journeys">
          <SectionHeading
            eyebrow="Journeys Prioritarios"
            title="Flujos de valor listos para presentar en demo."
          />
          <div className="tabs">
            {journeys.map((item, index) => (
              <button
                key={item.audience}
                className={`tab ${index === activeJourney ? "active" : ""}`}
                onClick={() => setActiveJourney(index)}
                type="button"
              >
                {item.audience}
              </button>
            ))}
          </div>

          <article className="journey-panel">
            <span className="card-tag">{journey.audience}</span>
            <h3>{journey.title}</h3>
            <p>{journey.summary}</p>
            <ul className="journey-list">
              {journey.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="journey-meta">
              <div className="meta-box">
                <strong>Impacto esperado</strong>
                <span>{journey.impact}</span>
              </div>
              <div className="meta-box">
                <strong>KPI sugerido</strong>
                <span>{journey.kpi}</span>
              </div>
              <div className="meta-box">
                <strong>Capacidades</strong>
                <span>{journey.capabilities}</span>
              </div>
            </div>
          </article>
        </section>

        <section className="section" id="architecture">
          <SectionHeading
            eyebrow="Arquitectura"
            title="Capas funcionales para una evolucion ordenada a produccion."
          />
          <div className="architecture-grid">
            {architecture.map((item) => (
              <article className="architecture-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeading
            eyebrow="Roadmap"
            title="Ruta propuesta para pasar de POC a piloto."
          />
          <div className="roadmap">
            {roadmap.map((item) => (
              <article className="roadmap-card" key={item.title}>
                <span className="card-tag">{item.title}</span>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
