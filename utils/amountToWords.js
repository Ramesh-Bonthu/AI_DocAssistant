// Indian numbering system word converter

export function toIndianWords(num) {
  const rounded = Math.round(num);
  if (rounded === 0) return 'zero';

  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const formatWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) {
      const hundredPart = a[Math.floor(n / 100)] + ' hundred';
      const remainder = n % 100;
      return remainder !== 0 ? hundredPart + ' and ' + formatWords(remainder) : hundredPart;
    }
    return '';
  };

  let temp = rounded;
  let words = '';

  // Crore (1,00,00,000)
  const crores = Math.floor(temp / 10000000);
  if (crores > 0) {
    words += formatWords(crores) + ' crore ';
    temp %= 10000000;
  }

  // Lakh (1,00,000)
  const lakhs = Math.floor(temp / 100000);
  if (lakhs > 0) {
    words += formatWords(lakhs) + ' lakh ';
    temp %= 100000;
  }

  // Thousand (1,000)
  const thousands = Math.floor(temp / 1000);
  if (thousands > 0) {
    words += formatWords(thousands) + ' thousand ';
    temp %= 1000;
  }

  // Remaining hundred/tens/units
  if (temp > 0) {
    if (words !== '' && temp < 100) {
      words += 'and ';
    }
    words += formatWords(temp);
  }

  const result = words.trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' rupees only';
}
