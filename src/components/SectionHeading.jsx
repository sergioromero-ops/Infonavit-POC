// src/components/SectionHeading.jsx
import React from "react";

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p className="section-copy">{body}</p> : null}
    </div>
  );
}

export default SectionHeading;
