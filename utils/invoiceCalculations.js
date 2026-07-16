// Calculations for HPS Invoice template

export function formatRupees(num) {
  const rounded = Math.round(num);
  const str = rounded.toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherParts = str.substring(0, str.length - 3);
  const formattedOthers = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return formattedOthers + ',' + lastThree;
}

export function calculateInvoice(items) {
  let totalTaxable = 0;
  let totalGst = 0;
  let totalGrand = 0;

  const calculatedItems = (items || []).map((item) => {
    const total = (item.unitPrice || 0) * (item.quantity || 0);
    const taxable = total / 1.18; // 18% inclusive GST
    const gst = total - taxable;

    totalTaxable += taxable;
    totalGst += gst;
    totalGrand += total;

    return {
      ...item,
      taxable,
      gst,
      total
    };
  });

  return {
    items: calculatedItems,
    totalTaxable,
    totalGst,
    totalGrand
  };
}
