import * as React from "react";
import { Slot } from "radix-ui";

const VARIANT_CLASSES = {
  default: "badge-default",
  secondary: "badge-secondary",
  outline: "badge-outline",
  gold: "badge-gold",
  ghost: "badge-ghost",
};

function Badge({ className = "", variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "span";

  const classes = ["badge", VARIANT_CLASSES[variant] || "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={classes}
      {...props}
    />
  );
}

export { Badge };
