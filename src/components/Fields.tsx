import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

type FieldProps = {
  label: string
  error?: string
  children: ReactNode
  htmlFor?: string
}

export function Field({ label, error, children, htmlFor }: FieldProps) {
  return (
    <div className="field">
      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span className="field-label">{label}</span>}
      {children}
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  )
}

export function TextField({ label, error, id, ...props }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Field label={label} error={error} htmlFor={fieldId}>
      <input id={fieldId} {...props} />
    </Field>
  )
}

export function TextAreaField({
  label,
  error,
  id,
  ...props
}: { label: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Field label={label} error={error} htmlFor={fieldId}>
      <textarea id={fieldId} rows={4} {...props} />
    </Field>
  )
}

export function SelectField({
  label,
  error,
  options,
  placeholder,
  id,
  ...props
}: {
  label: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Field label={label} error={error} htmlFor={fieldId}>
      <select id={fieldId} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
