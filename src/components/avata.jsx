import React from "react";

// Avatar: khung tròn, có thể chứa ảnh hoặc fallback
export const Avatar = React.forwardRef(function Avatar({ className = "", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={"testimonial-avatar " + className}
      {...props}
    >
      {children}
    </div>
  );
});

// AvatarImage: ảnh đại diện
export const AvatarImage = React.forwardRef(function AvatarImage({ src, alt, className = "", ...props }, ref) {
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={"testimonial-avatar-img " + className}
      {...props}
    />
  );
});

// AvatarFallback: fallback khi không có ảnh
export const AvatarFallback = React.forwardRef(function AvatarFallback({ className = "", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={"testimonial-avatar-fallback " + className}
      {...props}
    >
      {children}
    </div>
  );
}); 