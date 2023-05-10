export const configData = {
  API_URL: 'https://dbtest.rovuk.us:4207/',
  DEFAULT_LOADER_GIF: '../assets/images/rovuk-gif.gif',
  INVOICES_STATUS: [
    { name: 'Pending', key: 'Pending' },
    { name: 'Approved', key: 'Approved' },
    { name: 'Rejected', key: 'Rejected' },
    { name: 'Late', key: 'Late' },
    { name: 'Paid', key: 'Paid' },
    { name: 'Unpaid', key: 'Unpaid' },
    { name: 'Overdue', key: 'Overdue' },
  ],
  SITELANGUAGES: ['es', 'en'],
  INITIALLANGUAGE: 'en',
  LANGUAGE_ARRAY: [
    { name: 'English', value: 'en' },
    { name: 'Español', value: 'es' },
  ],
  PRIME_VENDOR_TYPE: 'Prime',
  gender: [{ value: "Male", tmp_lanaguage: "COMMON.GENDER_ALL.Male_All" },
  { value: "Female", tmp_lanaguage: "COMMON.GENDER_ALL.Female_All" }],
  Status: [
    { value: 1, viewValue: "Active", tmp_lanaguage: "COMMON.STATUS.ACTIVE" },
    { value: 2, viewValue: "Inactive", tmp_lanaguage: "COMMON.STATUS.INACTIVE" }],
};
