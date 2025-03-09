import React from "react";

const Button = ({
  children,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  onClick,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-black hover:bg-gray-800 text-white",
    outline: "border border-gray-300 hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
