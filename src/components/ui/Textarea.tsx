import { forwardRef, type TextareaHTMLAttributes } from 'react';
import './Input.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, required, className = '', ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className={`textarea-group ${error ? 'textarea-group--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="input-group__label">
            {label}
            {required && <span className="input-group__required" aria-hidden="true"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className="textarea-group__textarea"
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-required={required}
          required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="textarea-group__error" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
