import React from 'react';

export default function SectionHeader({ eyebrow, title, description, badge, badgeTone = 'default' }) {
  const badgeClassName = badgeTone === 'accent' ? 'section-badge section-badge-accent' : 'section-badge';

  return (
    <div className="section-header">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {badge ? <span className={badgeClassName}>{badge}</span> : null}
    </div>
  );
}