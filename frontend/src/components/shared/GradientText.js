import React from 'react';

export const GrayTitle = ({ children }) => (
  <span className="text-gray-gradient">{children}</span>
);

export const GoldTitle = ({ children }) => (
  <span className="text-gold-gradient">{children}</span>
);

export const SectionLabel = ({ children }) => (
  <p className="section-label">
    <span className="section-label-line" />
    {children}
  </p>
);

export const SectionHeading = ({ gray, gold }) => (
  <h2 className="section-heading">
    <GrayTitle>{gray}</GrayTitle>
    <br />
    <GoldTitle>{gold}</GoldTitle>
  </h2>
);
