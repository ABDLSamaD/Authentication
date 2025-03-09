"use client";

const Input = ({
  id,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  className = "",
  autoComplete,
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      className={`w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${className}`}
    />
  );
};

export default Input;
