import * as React from "react";

function Input({ className = "", type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`input ${className}`}
      {...props}
    />
  );
}

export { Input };
