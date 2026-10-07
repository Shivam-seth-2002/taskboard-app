import { forwardRef, type SelectHTMLAttributes } from 'react';
import './Input.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, required, className = '', ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className={`select-group ${error ? 'select-group--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="input-group__label">
            {label}
            {required && <span className="input-group__required" aria-hidden="true"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className="select-group__select"
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-required={required}
          required={required}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="select-group__error" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
