// src/pages/DashboardPage.jsx
import React, { useState } from "react";
import { AuthConsumer } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";
import { roleScreens } from "../data";
import SectionHeading from "../components/SectionHeading";

const DashboardPage = () => {
  // En un caso real, el rol vendría del perfil del usuario (auth.getProfile()).
  // Por ahora, lo simulamos con un selector.
  const [selectedRole, setSelectedRole] = useState("derechohabientes");

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const role = roleScreens.find((r) => r.key === selectedRole);

  return (
    <AuthConsumer>
      {({ isAuthenticated }) => {
        if (!isAuthenticated()) {
          return <Navigate to="/login" />;
        }
        return (
          <div className="section">
            <SectionHeading
              eyebrow="Dashboard de Usuario"
              title="Bienvenido a tu portal de servicio"
            />

            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label htmlFor="role-selector" style={{ marginRight: "1rem" }}>
                Simular Rol:
              </label>
              <select
                id="role-selector"
                value={selectedRole}
                onChange={handleRoleChange}
                className="pill"
              >
                <option value="derechohabientes">Derechohabiente</option>
                <option value="proveedores">Proveedor</option>
                <option value="interno">Interno Infonavit</option>
              </select>
            </div>

            {role && (
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
                  <h4>Línea de tiempo del journey</h4>
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
            )}
          </div>
        );
      }}
    </AuthConsumer>
  );
};

export default DashboardPage;
