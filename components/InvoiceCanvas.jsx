import React from 'react'
import OverlayText from './OverlayText'
import OverlayTable from './OverlayTable'
import { fieldPositions } from '../utils/fieldPositions'
import { calculateInvoice } from '../utils/invoiceCalculations'
import { toIndianWords } from '../utils/amountToWords'
import '../styles/invoiceCanvas.css'

export default function InvoiceCanvas({ data }) {
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
  } = data || {};

  const { totalGrand } = calculateInvoice(items);
  const amountWords = toIndianWords(totalGrand);
  const termsList = terms ? terms.split('\n').filter(t => t.trim() !== '') : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="invoice-canvas-container">
      <div className="editable-overlay">
        {/* Metadata Fields */}
        <OverlayText value={`Reference No: ${refNo}`} position={fieldPositions.referenceNo} />
        <OverlayText value={`Date: ${formatDate(invoiceDate)}`} position={fieldPositions.date} />
        <OverlayText value={`Invoice No.: ${invoiceNo}`} position={fieldPositions.invoiceNo} />

        {/* Customer Address Block */}
        <OverlayText value="TO:" position={fieldPositions.customerLabel} mask={false} />
        <OverlayText value={customerName} position={fieldPositions.customerName} />
        <OverlayText 
          value={
            `${customerAddress}${customerGst ? `\nGSTIN: ${customerGst}` : ''}${customerPhone ? `\nPhone: ${customerPhone}` : ''}${customerEmail ? `\nEmail: ${customerEmail}` : ''}`
          } 
          position={fieldPositions.customerAddress} 
        />

        {/* Company Address Block */}
        <OverlayText value="FROM:" position={fieldPositions.companyLabel} mask={false} />
        <OverlayText value={companyName} position={fieldPositions.companyName} />
        <OverlayText value={companyAddress} position={fieldPositions.companyAddress} />
        <OverlayText value={`GSTIN: ${companyGst}`} position={fieldPositions.companyGST} />

        {/* Dynamic Items Table */}
        <OverlayTable items={items} position={fieldPositions.table} />

        {/* Total in Words */}
        <OverlayText 
          value={
            <>
              Total amount in words : <span style={{ fontWeight: 700 }}>{amountWords}</span>
            </>
          } 
          position={fieldPositions.amountWords} 
        />

        {/* Terms & Conditions */}
        <OverlayText value="Terms & Conditions" position={fieldPositions.termsTitle} mask={false} />
        <OverlayText 
          value={
            <ol style={{ listStyleType: 'decimal', paddingLeft: '15px', margin: 0 }}>
              {termsList.map((term, i) => {
                const cleanedTerm = term.replace(/^\d+[\.\-\s]+/, '')
                return <li key={i}>{cleanedTerm}</li>
              })}
            </ol>
          } 
          position={fieldPositions.termsList} 
        />
        <OverlayText value="We hope the above quotation meets your requirements and look forward to your positive response." position={fieldPositions.termsClosing} mask={false} />

        {/* Signatory Section */}
        <OverlayText value="From" position={fieldPositions.signLabel} mask={false} />
        <OverlayText value={authorizedSignature} position={fieldPositions.authorizedSignature} />
      </div>
    </div>
  );
}
