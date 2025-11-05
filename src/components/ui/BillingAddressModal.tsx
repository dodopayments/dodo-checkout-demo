"use client"

import React from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'

type BillingAddress = {
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

type Customer = {
  name?: string
  email: string
}

export type BillingPayload = {
  billing: BillingAddress
  customer: Customer
}

export default function BillingAddressModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  initial?: Partial<BillingPayload>
  onClose: () => void
  onSubmit: (payload: BillingPayload) => Promise<void> | void
}) {
  const COUNTRIES: { code: string; name: string }[] = [
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SG', name: 'Singapore' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NZ', name: 'New Zealand' },
    // Add more as needed; Dodo expects ISO 3166-1 alpha-2 codes
  ]
  const [name, setName] = React.useState(initial?.customer?.name || '')
  const [email, setEmail] = React.useState(initial?.customer?.email || '')
  const [address1, setAddress1] = React.useState(initial?.billing?.address_line1 || '')
  const [address2, setAddress2] = React.useState(initial?.billing?.address_line2 || '')
  const [city, setCity] = React.useState(initial?.billing?.city || '')
  const [state, setState] = React.useState(initial?.billing?.state || '')
  const [postal, setPostal] = React.useState(initial?.billing?.postal_code || '')
  const [country, setCountry] = React.useState(initial?.billing?.country || '')
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    setName(initial?.customer?.name || '')
    setEmail(initial?.customer?.email || '')
    setAddress1(initial?.billing?.address_line1 || '')
    setAddress2(initial?.billing?.address_line2 || '')
    setCity(initial?.billing?.city || '')
    setState(initial?.billing?.state || '')
    setPostal(initial?.billing?.postal_code || '')
    setCountry((initial?.billing?.country || '').toUpperCase())
  }, [initial?.customer?.name, initial?.customer?.email, initial?.billing?.address_line1, initial?.billing?.address_line2, initial?.billing?.city, initial?.billing?.state, initial?.billing?.postal_code, initial?.billing?.country])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !address1 || !city || !postal || !country) return
    setSubmitting(true)
    try {
      await onSubmit({
        billing: {
          address_line1: address1,
          address_line2: address2,
          city,
          state,
          postal_code: postal,
          country: country.toUpperCase(),
        },
        customer: {
          name,
          email,
        },
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Billing details</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" type="email" disabled readOnly />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Address line 1</Label>
              <Input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="123 Main St" required />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Address line 2</Label>
              <Input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Apt, suite, etc. (optional)" />
            </div>
            <div>
              <Label className="mb-1 block">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1 block">State/Province</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Postal code</Label>
              <Input value={postal} onChange={(e) => setPostal(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1 block">Country</Label>
              <select
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-2.5 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-lime-400/20 focus:border-lime-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                required
              >
                <option value="" disabled>
                  Select country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting} isLoading={submitting} loadingText="Saving…">
              Save and continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


