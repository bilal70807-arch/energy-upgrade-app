'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const JULY_DEADLINE = new Date('2026-07-01')

function getDaysLeft() {
  const today = new Date()
  const diff = JULY_DEADLINE.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Home() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    preferred_name: '',
    business_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    spouse_name: '',
    spouse_phone: '',
    owns_building: '',
    owns_home: '',
    ownership_years: '',
    panel_amp: '',
    monthly_bill_est: '',
    appt_date: '',
    appt_time: '',
    time_preference: '',
    notes: '',
  })
  const [roofTypes, setRoofTypes] = useState<string[]>([])
  const [billFiles, setBillFiles] = useState<File[]>([])
  const [panelFiles, setPanelFiles] = useState<File[]>([])
  const [meterFiles, setMeterFiles] = useState<File[]>([])

  const daysLeft = getDaysLeft()

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleRoof = (type: string) => {
    setRoofTypes(prev =>
      prev.includes(type) ? prev.filter(r => r !== type) : [...prev, type]
    )
  }

  const uploadFiles = async (files: File[], folder: string, leadId: string) => {
    for (const file of files) {
      const path = `${folder}/${leadId}/${Date.now()}_${file.name}`
      await supabase.storage.from('lead-docs').upload(path, file)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          first_name: form.first_name,
          last_name: form.last_name,
          preferred_name: form.preferred_name || form.first_name,
          business_name: form.business_name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          zip: form.zip,
          spouse_name: form.spouse_name,
          spouse_phone: form.spouse_phone,
          owns_building: form.owns_building === 'yes',
          owns_home: form.owns_home === 'yes',
          ownership_years: parseInt(form.ownership_years) || null,
          roof_type: roofTypes.join(', '),
          panel_amp: parseInt(form.panel_amp) || null,
          monthly_bill_est: parseFloat(form.monthly_bill_est) || null,
          status: 'docs_pending',
          is_residential_lead: form.owns_home === 'yes',
        }])
        .select()
        .single()

      if (error) throw error

      if (billFiles.length > 0) await uploadFiles(billFiles, 'electric_bill', data.id)
      if (panelFiles.length > 0) await uploadFiles(panelFiles, 'power_box', data.id)
      if (meterFiles.length > 0) await uploadFiles(meterFiles, 'power_meter', data.id)

      if (form.appt_date && form.appt_time) {
        await supabase.from('appointments').insert([{
          lead_id: data.id,
          scheduled_at: new Date(`${form.appt_date}T${form.appt_time}`).toISOString(),
          time_preference: form.time_preference,
          notes: form.notes,
        }])
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">You're all set!</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Your rep will reach out shortly to confirm your Zoom appointment. Get ready to eliminate your electric bill.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white text-center py-3 px-4 text-sm font-medium">
        ⚡ <strong>{daysLeft} days left</strong> — Government incentives to eliminate your electric bill expire soon
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-5 text-center">
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">LA DWP</span>
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Energy Upgrade</span>
          <span className="border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">SoCal Edison</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Let's Get You Started</h1>
        <p className="text-gray-500 text-sm mt-1">Takes less than 3 minutes. No obligation.</p>
      </div>

      <div className="bg-white px-6 py-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Step {step} of 6</span>
          <span>{Math.round(((step - 1) / 6) * 100)}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full">
          <div className="h-1 bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 6) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 1 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">About You</h2>
            <p className="text-gray-500 text-sm mb-6">We'll use this to confirm your Zoom appointment.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input className={inputClass} placeholder="First" value={form.first_name} onChange={e => update('first_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input className={inputClass} placeholder="Last" value={form.last_name} onChange={e => update('last_name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                <input className={inputClass} placeholder="e.g. Bob instead of Robert" value={form.preferred_name} onChange={e => update('preferred_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input className={inputClass} placeholder="Your business name" value={form.business_name} onChange={e => update('business_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Best Phone Number *</label>
                <input type="tel" className={inputClass} placeholder="(000) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" className={inputClass} placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input className={inputClass} placeholder="Street address" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input className={inputClass} placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                  <input className={inputClass} placeholder="00000" value={form.zip} onChange={e => update('zip', e.target.value)} />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!form.first_name || !form.last_name || !form.phone || !form.email || !form.address || !form.city) {
                  alert('Please fill in all required fields.'); return
                }
                setStep(2)
              }}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
            >Continue →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 2 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Property</h2>
            <p className="text-gray-500 text-sm mb-6">A few quick details about your business and home.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you own the building for your business? *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['yes', 'no'].map(v => (
                    <button key={v} onClick={() => update('owns_building', v)}
                      className={`py-3 rounded-xl border-2 font-semibold text-base transition ${form.owns_building === v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                      {v === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you also own your home?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['yes', 'no'].map(v => (
                    <button key={v} onClick={() => update('owns_home', v)}
                      className={`py-3 rounded-xl border-2 font-semibold text-base transition ${form.owns_home === v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                      {v === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
                {form.owns_home === 'yes' && (
                  <p className="text-green-600 text-sm mt-2 font-medium">✓ Great — we can eliminate your home electric bill too!</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years Owned</label>
                <input className={inputClass} placeholder="e.g. 5" value={form.ownership_years} onChange={e => update('ownership_years', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roof Type <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {['Comp', 'Flat Tile', 'S Tile', 'Metal', 'Flat'].map(r => (
                    <button key={r} onClick={() => toggleRoof(r)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${roofTypes.includes(r) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-500'}`}>
                      {roofTypes.includes(r) ? '✓ ' : ''}{r}
                    </button>
                  ))}
                </div>
                {roofTypes.length > 0 && <p className="text-blue-600 text-xs mt-2 font-medium">Selected: {roofTypes.join(', ')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Power Box Size</label>
                <div className="flex gap-3">
                  {['100', '125', '200'].map(a => (
                    <button key={a} onClick={() => update('panel_amp', a)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${form.panel_amp === a ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-500'}`}>
                      {a} amp
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Monthly Electric Bill ($)</label>
                <input type="number" className={inputClass} placeholder="e.g. 450" value={form.monthly_bill_est} onChange={e => update('monthly_bill_est', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className={inputClass} placeholder="Spouse or partner's name" value={form.spouse_name} onChange={e => update('spouse_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Phone Number</label>
                <input type="tel" className={inputClass} placeholder="(000) 000-0000" value={form.spouse_phone} onChange={e => update('spouse_phone', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-gray-400 transition">← Back</button>
              <button onClick={() => { if (!form.owns_building) { alert('Please answer if you own the building.'); return } setStep(3) }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 3 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Electric Bill</h2>
            <p className="text-gray-500 text-sm mb-6">Upload your most recent electric bill. This helps us calculate exactly how much we can save you.</p>
            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <input type="file" className="hidden" accept="image/*,application/pdf" multiple onChange={e => setBillFiles(Array.from(e.target.files || []))} />
              <div className="text-4xl mb-3">📄</div>
              <p className="font-semibold text-gray-700">Tap to upload your electric bill</p>
              <p className="text-sm text-gray-400 mt-1">Photo, screenshot, or PDF</p>
              {billFiles.length > 0 && <p className="mt-3 text-green-600 font-semibold text-sm">✓ {billFiles.length} file{billFiles.length > 1 ? 's' : ''} selected</p>}
            </label>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-gray-400 transition">← Back</button>
              <button onClick={() => setStep(4)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 4 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Power Box</h2>
            <p className="text-gray-500 text-sm mb-6">Take 1–2 photos of your electrical panel — the gray metal box usually in your garage or utility room. Open the door and photograph the inside too.</p>
            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <input type="file" className="hidden" accept="image/*" multiple onChange={e => setPanelFiles(Array.from(e.target.files || []))} />
              <div className="text-4xl mb-3">⚡</div>
              <p className="font-semibold text-gray-700">Tap to take or upload photos</p>
              <p className="text-sm text-gray-400 mt-1">Outside panel + inside panel door</p>
              {panelFiles.length > 0 && <p className="mt-3 text-green-600 font-semibold text-sm">✓ {panelFiles.length} file{panelFiles.length > 1 ? 's' : ''} selected</p>}
            </label>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(3)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-gray-400 transition">← Back</button>
              <button onClick={() => setStep(5)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 5 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Power Meter</h2>
            <p className="text-gray-500 text-sm mb-6">Take a photo of your power meter — usually on the outside of your building or home. This is the round dial or digital display that tracks your electricity usage.</p>
            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <input type="file" className="hidden" accept="image/*" multiple onChange={e => setMeterFiles(Array.from(e.target.files || []))} />
              <div className="text-4xl mb-3">🔌</div>
              <p className="font-semibold text-gray-700">Tap to take or upload photos</p>
              <p className="text-sm text-gray-400 mt-1">Clear photo of your meter display</p>
              {meterFiles.length > 0 && <p className="mt-3 text-green-600 font-semibold text-sm">✓ {meterFiles.length} file{meterFiles.length > 1 ? 's' : ''} selected</p>}
            </label>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(4)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-gray-400 transition">← Back</button>
              <button onClick={() => setStep(6)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step 6 of 6</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Pick Your Zoom Time</h2>
            <p className="text-gray-500 text-sm mb-6">Choose when works best. Your rep will confirm the day before.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                  <input type="date" className={inputClass} value={form.appt_date} onChange={e => update('appt_date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
                  <input type="time" className={inputClass} value={form.appt_time} onChange={e => update('appt_time', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generally prefer mornings or afternoons?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Mornings', 'Afternoons'].map(t => (
                    <button key={t} onClick={() => update('time_preference', t)}
                      className={`py-3 rounded-xl border-2 font-semibold text-base transition ${form.time_preference === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                      {t === 'Mornings' ? '🌅 Mornings' : '☀️ Afternoons'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anything else we should know?</label>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Questions, concerns, anything that helps us prepare..." value={form.notes} onChange={e => update('notes', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(5)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-gray-400 transition">← Back</button>
              <button
                onClick={() => {
                  if (!form.appt_date || !form.appt_time) { alert('Please select a date and time.'); return }
                  handleSubmit()
                }}
                disabled={loading}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit ✓'}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Your information is private and only shared with your Energy Upgrade rep.</p>
          </div>
        )}
      </div>
    </main>
  )
}