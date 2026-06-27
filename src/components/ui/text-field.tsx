"use client";

type TextFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
};

/** Controlled labelled input with inline error — shared across all storefront forms. */
export function TextField({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder,
  className = "",
  inputMode,
}: TextFieldProps) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
