import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CURRENCIES, CYCLES } from '../constants/subscriptions'
import type { SubscriptionFormValues } from '../types'
import { errorMessage } from '../util/values'
import { validateSubscription } from '../validations_schemas/account'
import { SelectField, TextAreaField, TextField } from './Fields'

export function SubscriptionForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: SubscriptionFormValues
  submitLabel: string
  onSubmit: (values: SubscriptionFormValues) => Promise<void>
}) {
  const navigate = useNavigate()
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<ReturnType<typeof validateSubscription>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  function set<K extends keyof SubscriptionFormValues>(key: K, value: SubscriptionFormValues[K]) {
    setValues(current => ({ ...current, [key]: value }))
  }

  async function onFormSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateSubscription(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack" noValidate onSubmit={onFormSubmit}>
      <div className="pair">
        <TextField label="Company" value={values.name} error={errors.name} onChange={event => set('name', event.target.value)} />
        <TextField label="Price" inputMode="decimal" value={values.price} error={errors.price} onChange={event => set('price', event.target.value)} />
      </div>
      <div className="pair">
        <SelectField
          label="Currency"
          value={values.currency}
          error={errors.currency}
          options={CURRENCIES.map(currency => ({ value: currency, label: currency }))}
          onChange={event => set('currency', event.target.value)}
        />
        <SelectField
          label="Billing cycle"
          value={values.cycle}
          error={errors.cycle}
          options={CYCLES}
          onChange={event => set('cycle', event.target.value as SubscriptionFormValues['cycle'])}
        />
      </div>
      <div className="pair">
        <TextField label="Start date" type="date" value={values.startDate} error={errors.startDate} onChange={event => set('startDate', event.target.value)} />
        <TextField label="Next renewal date" type="date" value={values.nextRenewal} error={errors.nextRenewal} onChange={event => set('nextRenewal', event.target.value)} />
      </div>
      <TextAreaField label="Note" value={values.note} error={errors.note} onChange={event => set('note', event.target.value)} />
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  )
}
