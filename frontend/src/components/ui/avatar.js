import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

function Avatar({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={`avatar ${className}`}
      {...props}
    />
  );
}

function AvatarImage({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={`avatar-image ${className}`}
      {...props}
    />
  );
}

function AvatarFallback({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={`avatar-fallback ${className}`}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
