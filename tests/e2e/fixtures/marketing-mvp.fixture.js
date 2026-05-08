const validLead = {
  firstName: "Laura",
  lastName: "Suarez",
  documentType: "CC",
  documentNumber: "1020304050",
  phonePrefix: "57",
  mobile: "3001234567",
  email: "laura.suarez@example.com",
  country: "COL",
  department: "BOG",
  city: "11001",
  attendeeType: "Aspirante",
  academicLevel: "PREG",
  faculty: "Ingenier\u00eda",
  program: "ISIST",
  period: "PREG2630",
};

const hiddenFields = [
  "utm_source",
  "utm_subsource",
  "utm_campaign",
  "utm_medium",
  "fevento",
  "nevento",
];

module.exports = {
  hiddenFields,
  validLead,
};
