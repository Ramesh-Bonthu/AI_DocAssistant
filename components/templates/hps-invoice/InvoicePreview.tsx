'use client'

import React from 'react'

interface InvoiceItem {
  id: string
  requirement: string
  hsn: string
  unitPrice: number
  quantity: number
}

interface InvoiceData {
  refNo: string
  invoiceNo: string
  invoiceDate: string
  companyName: string
  companyAddress: string
  companyGst: string
  companyLogo?: string
  customerName: string
  customerAddress: string
  customerGst?: string
  customerPhone?: string
  customerEmail?: string
  items: InvoiceItem[]
  terms: string
  authorizedSignature: string
}

interface InvoicePreviewProps {
  data: InvoiceData
}

// Indian numbering system converter
function toIndianWords(num: number): string {
  const rounded = Math.round(num)
  if (rounded === 0) return 'zero'

  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ]
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  const formatWords = (n: number): string => {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    if (n < 1000) {
      const hundredPart = a[Math.floor(n / 100)] + ' hundred'
      const remainder = n % 100
      return remainder !== 0 ? hundredPart + ' and ' + formatWords(remainder) : hundredPart
    }
    return ''
  }

  let temp = rounded
  let words = ''

  // Crore (1,00,00,000)
  const crores = Math.floor(temp / 10000000)
  if (crores > 0) {
    words += formatWords(crores) + ' crore '
    temp %= 10000000
  }

  // Lakh (1,00,000)
  const lakhs = Math.floor(temp / 100000)
  if (lakhs > 0) {
    words += formatWords(lakhs) + ' lakh '
    temp %= 100000
  }

  // Thousand (1,000)
  const thousands = Math.floor(temp / 1000)
  if (thousands > 0) {
    words += formatWords(thousands) + ' thousand '
    temp %= 1000
  }

  // Remaining hundred/tens/units
  if (temp > 0) {
    if (words !== '' && temp < 100) {
      words += 'and '
    }
    words += formatWords(temp)
  }

  const result = words.trim()
  return result.charAt(0).toUpperCase() + result.slice(1) + ' rupees only'
}

// Utility to format number into Indian Rupees format (e.g. 1,07,000)
function formatRupees(num: number): string {
  const rounded = Math.round(num)
  const str = rounded.toString()
  if (str.length <= 3) return str
  const lastThree = str.substring(str.length - 3)
  const otherParts = str.substring(0, str.length - 3)
  const formattedOthers = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return formattedOthers + ',' + lastThree
}

export function InvoiceTable({ items }: { items: InvoiceItem[] }) {
  // Aggregate calculations
  let totalTaxable = 0
  let totalGst = 0
  let totalGrand = 0

  const calculatedItems = items.map((item) => {
    const total = item.unitPrice * item.quantity
    const taxable = total / 1.18 // 18% inclusive GST
    const gst = total - taxable

    totalTaxable += taxable
    totalGst += gst
    totalGrand += total

    return {
      ...item,
      taxable,
      gst,
      total
    }
  })

  return (
    <div className="w-full">
      <table className="hps-table">
        <thead>
          <tr>
            <th className="col-requirements">Requirements</th>
            <th className="col-hsn">HSN</th>
            <th className="col-unitprice">Unit price</th>
            <th className="col-qty">Quantity</th>
            <th className="col-taxable">Taxable<br/>amount</th>
            <th className="col-gst">GST(18%)</th>
            <th className="col-total">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {calculatedItems.map((item, index) => (
            <tr key={item.id || index}>
              <td className="col-requirements">{item.requirement}</td>
              <td className="col-hsn">{item.hsn || '-'}</td>
              <td className="col-unitprice">
                {item.unitPrice > 0 ? `${formatRupees(item.unitPrice)}/-` : '-'}
              </td>
              <td className="col-qty">{item.quantity}</td>
              <td className="col-taxable">{formatRupees(item.taxable)}</td>
              <td className="col-gst">{formatRupees(item.gst)}</td>
              <td className="col-total">
                {item.total > 0 ? `₹${formatRupees(item.total)}/-` : '-'}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr>
            <td colSpan={6} className="row-total-label">
              Total(Inclusive of taxes):
            </td>
            <td className="row-total-value">
              ₹{formatRupees(totalGrand)}/-
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function InvoiceSummary({ totalAmount }: { totalAmount: number }) {
  const words = toIndianWords(totalAmount)
  return (
    <div className="amount-in-words">
      Total amount in words : <span>{words}</span>
    </div>
  )
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  // Safety checks
  const {
    refNo = 'HPS/MVGR/Dev/2026',
    invoiceNo = 'IVHPS-0626-5032',
    invoiceDate = '2026-06-25',
    companyName = 'Harsha Perfect Solutions (OPC) Pvt Ltd',
    companyAddress = '31-7-67, Assam Gardens, Visakhapatnam, Andhra Pradesh - 530004, India',
    companyGst = '37AAGCH2004L1ZP',
    customerName = 'The Director',
    customerAddress = 'MVGR College of Engineering(A), Chintalavalasa, Vizianagaram, 535005',
    customerGst = '',
    customerPhone = '',
    customerEmail = '',
    items = [],
    terms = '',
    authorizedSignature = 'HPS(OPC) Pvt. Ltd.'
  } = data || {}

  // Calculate total grand for words
  const grandTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

  // Split terms by newline to display as list items
  const termsList = terms ? terms.split('\n').filter(t => t.trim() !== '') : []

  // Format Date for invoice (YYYY-MM-DD to Month DD, YYYY)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const dateObj = new Date(dateStr)
    if (isNaN(dateObj.getTime())) return dateStr
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="hps-invoice-wrapper select-none">
      {/* Decorative Wave Headers - Rendered at top level to touch absolute edges */}
      <svg viewBox="0 0 794 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="invoice-header-wave">
        <path d="M0 0 H794 V60 C610 125, 310 40, 0 105 Z" fill="#7dd3fc" opacity="0.3"/>
        <path d="M0 0 H794 V45 C600 110, 300 30, 0 90 Z" fill="url(#headerGlow)"/>
        <defs>
          <linearGradient id="headerGlow" x1="397" y1="0" x2="397" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Content Area - contains padding block */}
      <div className="hps-invoice-content">
        <div className="w-full flex flex-col">
          {/* Brand Header */}
          <div className="hps-logo-container">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#0284c7" />
              {/* stylized 'H' and 'P' block design */}
              <path d="M30 28 H44 V46 H56 V28 H70 V72 H56 V58 H44 V72 H30 Z" fill="white" />
              <path d="M50 5 A45 45 0 0 1 95 50 A45 45 0 0 0 50 5 Z" fill="white" opacity="0.15" />
            </svg>
            <div className="hps-logo-text-block">
              <span className="hps-logo-title">HPS</span>
              <span className="hps-logo-subtitle">HARSHA PERFECT<br/>SOLUTIONS</span>
            </div>
          </div>

          <h1 className="tax-invoice-title">Tax Invoice</h1>

          <div className="metadata-grid">
            <div className="metadata-left">
              Reference No: {refNo}
            </div>
            <div className="metadata-right">
              <div>Date: {formatDate(invoiceDate)}</div>
              <div>Invoice No.: {invoiceNo}</div>
            </div>
          </div>

          {/* TO / FROM addresses aligned side-by-side */}
          <div className="addresses-grid">
            <div className="address-block-to">
              <span className="address-label">TO:</span>
              <span className="font-bold">{customerName}</span>
              <span className="address-value">{customerAddress}</span>
              {customerGst && <div>GSTIN: {customerGst}</div>}
              {customerPhone && <div>Phone: {customerPhone}</div>}
              {customerEmail && <div>Email: {customerEmail}</div>}
            </div>
            
            <div className="address-block-from">
              <span className="address-label">FROM:</span>
              <span className="font-bold">{companyName}</span>
              <span className="address-value">{companyAddress}</span>
              {companyGst && <div className="font-bold">GSTIN: {companyGst}</div>}
            </div>
          </div>

          <InvoiceTable items={items} />
          <InvoiceSummary totalAmount={grandTotal} />
        </div>

        {/* Footer content wrapper */}
        <div className="w-full mt-auto">
          <div className="terms-container">
            <h3 className="terms-title">Terms & Conditions</h3>
            {termsList.length > 0 ? (
              <ol className="terms-list">
                {termsList.map((term, i) => {
                  const cleanedTerm = term.replace(/^\d+[\.\-\s]+/, '')
                  return <li key={i}>{cleanedTerm}</li>
                })}
              </ol>
            ) : (
              <p className="text-slate-400">No terms specified.</p>
            )}
            <p className="terms-closing">
              We hope the above quotation meets your requirements and look forward to your positive response.
            </p>
          </div>

          <div className="sign-container">
            <span className="sign-label">From</span>
            <span className="sign-line">{authorizedSignature}</span>
          </div>
        </div>
      </div>

      {/* Decorative Wave Footers - Rendered at top level to touch bottom edge */}
      <svg viewBox="0 0 794 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="invoice-footer-wave">
        <path d="M0 100 H794 V40 C600 95, 300 15, 0 75 Z" fill="#7dd3fc" opacity="0.3"/>
        <path d="M0 100 H794 V50 C600 85, 300 30, 0 90 Z" fill="url(#footerGlow)"/>
        <defs>
          <linearGradient id="footerGlow" x1="397" y1="100" x2="397" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
