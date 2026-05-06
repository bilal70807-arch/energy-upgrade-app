import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsxurvfrdmteyjijuyva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeHVydmZyZG10ZXlqaWp1eXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzUzODUsImV4cCI6MjA5MzI1MTM4NX0._C2vZyRY_nF057_L_CKofgj-gnPnUCrWk-HC9O2kP5s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { first_name, last_name, preferred_name, business_name, phone, email, address, city, zip, spouse_name, spouse_phone, owns_building, owns_home, ownership_years, roof_type, panel_amp, monthly_bill_est, appt_date, appt_time, time_preference, notes } = body

  await resend.emails.send({
    from: 'Energy Upgrade <onboarding@resend.dev>',
    to: 'bilal70807@gmail.com',
    subject: `New Lead — ${first_name} ${last_name}`,
    html: `
      <h2 style="color:#1d4ed8">⚡ New Lead Submitted</h2>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9;width:160px"><b>Name</b></td><td style="padding:8px;border:1px solid #eee">${first_name} ${last_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Preferred Name</b></td><td style="padding:8px;border:1px solid #eee">${preferred_name || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Business</b></td><td style="padding:8px;border:1px solid #eee">${business_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Phone</b></td><td style="padding:8px;border:1px solid #eee">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Email</b></td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Address</b></td><td style="padding:8px;border:1px solid #eee">${address}, ${city} ${zip}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Spouse Name</b></td><td style="padding:8px;border:1px solid #eee">${spouse_name || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Spouse Phone</b></td><td style="padding:8px;border:1px solid #eee">${spouse_phone || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Owns Building</b></td><td style="padding:8px;border:1px solid #eee">${owns_building ? 'Yes ✓' : 'No'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Owns Home</b></td><td style="padding:8px;border:1px solid #eee">${owns_home ? 'Yes ✓' : 'No'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Years Owned</b></td><td style="padding:8px;border:1px solid #eee">${ownership_years || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Roof Type</b></td><td style="padding:8px;border:1px solid #eee">${roof_type || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Panel Size</b></td><td style="padding:8px;border:1px solid #eee">${panel_amp ? panel_amp + ' amp' : '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Monthly Bill</b></td><td style="padding:8px;border:1px solid #eee">${monthly_bill_est ? '$' + monthly_bill_est : '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Zoom Date</b></td><td style="padding:8px;border:1px solid #eee">${appt_date || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Zoom Time</b></td><td style="padding:8px;border:1px solid #eee">${appt_time || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Time Preference</b></td><td style="padding:8px;border:1px solid #eee">${time_preference || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>Notes</b></td><td style="padding:8px;border:1px solid #eee">${notes || '-'}</td></tr>
      </table>
    `
  })

  return NextResponse.json({ success: true })
}