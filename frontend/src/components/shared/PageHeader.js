import React from 'react';
import { GrayTitle, GoldTitle, SectionLabel } from './GradientText';

export default function PageHeader({ label, gray, gold, description, right }) {
  return (
    <div className="page-header">
      <div className="page-header-inner">
        <div>
          {label && <SectionLabel>{label}</SectionLabel>}
          <h1>
            {gray && <GrayTitle>{gray} </GrayTitle>}
            {gold && <GoldTitle>{gold}</GoldTitle>}
          </h1>
          {description && (
            <p className="page-header-description">{description}</p>
          )}
        </div>
        {right && <div className="page-header-right">{right}</div>}
      </div>
    </div>
  );
}
