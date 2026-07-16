// Canva-like positioning configuration for HPS Invoice template
// Base coordinates are relative to an 800px x 1131px page (standard A4 aspect ratio)

export const baseDimensions = {
  width: 800,
  height: 1131
};

export const fieldPositions = {
  referenceNo: {
    x: 65,
    y: 154,
    width: 320,
    fontSize: 13.5,
    fontWeight: 600,
    textAlign: "left"
  },
  invoiceNo: {
    x: 550,
    y: 178,
    width: 185,
    fontSize: 13.5,
    fontWeight: 600,
    textAlign: "right"
  },
  date: {
    x: 550,
    y: 154,
    width: 185,
    fontSize: 13.5,
    fontWeight: 600,
    textAlign: "right"
  },
  customerLabel: {
    x: 95,
    y: 200,
    width: 40,
    fontSize: 14.5,
    fontWeight: 700,
    textAlign: "left"
  },
  customerName: {
    x: 95,
    y: 220,
    width: 300,
    fontSize: 13.5,
    fontWeight: 700,
    textAlign: "left"
  },
  customerAddress: {
    x: 95,
    y: 238,
    width: 300,
    height: 70,
    fontSize: 12.5,
    lineHeight: 1.35,
    textAlign: "left"
  },
  customerGst: {
    x: 95,
    y: 305,
    width: 300,
    fontSize: 12.5,
    textAlign: "left"
  },
  companyLabel: {
    x: 435,
    y: 185,
    width: 60,
    fontSize: 14.5,
    fontWeight: 700,
    textAlign: "left"
  },
  companyName: {
    x: 435,
    y: 212,
    width: 300,
    fontSize: 13.5,
    fontWeight: 700,
    textAlign: "left"
  },
  companyAddress: {
    x: 435,
    y: 232,
    width: 300,
    height: 50,
    fontSize: 12.5,
    lineHeight: 1.35,
    textAlign: "left"
  },
  companyGST: {
    x: 435,
    y: 282,
    width: 300,
    fontSize: 12.5,
    fontWeight: 700,
    textAlign: "left"
  },
  table: {
    x: 65,
    y: 320,
    width: 670,
    height: 345
  },
  amountWords: {
    x: 65,
    y: 685,
    width: 670,
    fontSize: 14,
    fontWeight: 600,
    textAlign: "left"
  },
  termsTitle: {
    x: 65,
    y: 728,
    width: 670,
    fontSize: 14,
    fontWeight: 700,
    textAlign: "left"
  },
  termsList: {
    x: 65,
    y: 750,
    width: 670,
    fontSize: 11.5,
    lineHeight: 1.45,
    textAlign: "left"
  },
  termsClosing: {
    x: 65,
    y: 865,
    width: 670,
    fontSize: 11.5,
    fontWeight: 600,
    textAlign: "left"
  },
  signLabel: {
    x: 65,
    y: 905,
    width: 200,
    fontSize: 12.5,
    fontWeight: 600,
    textAlign: "left"
  },
  authorizedSignature: {
    x: 65,
    y: 955,
    width: 250,
    fontSize: 13,
    fontWeight: 700,
    textAlign: "left"
  }
};
