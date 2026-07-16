import React from 'react'
import { calculateInvoice, formatRupees } from '../utils/invoiceCalculations'

export default function OverlayTable({ items, position }) {
  if (!position) return null;

  const leftPercent = (position.x / 800) * 100;
  const topPercent = (position.y / 1131) * 100;
  const widthPercent = (position.width / 800) * 100;
  const heightPercent = position.height ? (position.height / 1131) * 100 : null;

  const { items: calculatedItems, totalGrand } = calculateInvoice(items);

  const style = {
    position: 'absolute',
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: '#ffffff',
    zIndex: 6,
    boxSizing: 'border-box'
  };

  return (
    <div style={style} className="canvas-table-container">
      <table className="canvas-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Requirements</th>
            <th style={{ width: '80px', textAlign: 'center' }}>HSN</th>
            <th style={{ width: '90px', textAlign: 'right' }}>Unit price</th>
            <th style={{ width: '60px', textAlign: 'center' }}>Quantity</th>
            <th style={{ width: '95px', textAlign: 'right' }}>Taxable amount</th>
            <th style={{ width: '95px', textAlign: 'right' }}>GST(18%)</th>
            <th style={{ width: '105px', textAlign: 'right' }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {calculatedItems.map((item, index) => (
            <tr key={item.id || index}>
              <td style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{item.requirement}</td>
              <td style={{ textAlign: 'center' }}>{item.hsn || '-'}</td>
              <td style={{ textAlign: 'right' }}>
                {item.unitPrice > 0 ? `${formatRupees(item.unitPrice)}/-` : '-'}
              </td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{formatRupees(item.taxable)}</td>
              <td style={{ textAlign: 'right' }}>{formatRupees(item.gst)}</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>
                {item.total > 0 ? `₹${formatRupees(item.total)}/-` : '-'}
              </td>
            </tr>
          ))}
          <tr className="canvas-total-row">
            <td colSpan={6} style={{ textAlign: 'left', fontWeight: 700 }}>
              Total(Inclusive of taxes):
            </td>
            <td style={{ textAlign: 'right', fontWeight: 700 }}>
              ₹{formatRupees(totalGrand)}/-
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
