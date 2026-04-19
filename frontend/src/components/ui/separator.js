import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

function Separator({
  className = "",
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={`separator ${className}`}
      {...props}
    />
  );
}

export { Separator };
