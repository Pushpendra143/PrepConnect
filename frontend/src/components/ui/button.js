import * as React from "react";
import { Slot } from "radix-ui";

const VARIANT_CLASSES = {
  default: "btn-default",
  gold: "btn-gold",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
  link: "btn-link",
};

const SIZE_CLASSES = {
  default: "",
  xs: "btn-xs",
  sm: "btn-sm",
  lg: "btn-lg",
  hero: "btn-hero",
  icon: "btn-icon",
};

function Button({
  className = "",
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";

  const classes = [
    "btn",
    VARIANT_CLASSES[variant] || "",
    SIZE_CLASSES[size] || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={classes}
      {...props}
    />
  );
}

export { Button };
