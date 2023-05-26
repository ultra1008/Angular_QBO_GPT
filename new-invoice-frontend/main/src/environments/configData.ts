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
  gender: [
    { value: 'Male', tmp_lanaguage: 'COMMON.GENDER_ALL.Male_All' },
    { value: 'Female', tmp_lanaguage: 'COMMON.GENDER_ALL.Female_All' },
  ],
  Status: [
    { value: 1, viewValue: 'Active', tmp_lanaguage: 'COMMON.STATUS.ACTIVE' },
    {
      value: 2,
      viewValue: 'Inactive',
      tmp_lanaguage: 'COMMON.STATUS.INACTIVE',
    },
  ],
  MAILBOX_MONITOR_TIME: [
    { time: '5 minutes', value: 'Every 5 min', cron_time: '*/5 * * * *' },
    { time: '10 minutes', value: 'Every 10 min', cron_time: '*/10 * * * *' },
    { time: '15 minutes', value: 'Every 15 min', cron_time: '*/15 * * * *' },
    { time: '20 minutes', value: 'Every 20 min', cron_time: '*/20 * * * *' },
    { time: '30 minutes', value: 'Every 30 min', cron_time: '*/30 * * * *' },
    { time: '1 hours', value: 'Every 1 hours', cron_time: '*/60 * * * *' },
    { time: '4 hours', value: 'Every 4 hours', cron_time: '0 */4 * * *' },
    { time: '8 hours', value: 'Every 8 hours', cron_time: '0 */8 * * *' },
    { time: '12 hours', value: 'Every 12 hours', cron_time: '0 */12 * * *' },
    { time: '24 hours', value: 'Every 24 hours', cron_time: '0 */24 * * *' },
  ],
  LTS_ACTIVE: [
    { value: 'Yes', viewValue: 'Yes' },
    { value: 'No', viewValue: 'No' },
  ],
  TIMEROPTIONS: [
    {
      name: '1',
      key: '1',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '2',
      key: '2',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '3',
      key: '3',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '4',
      key: '4',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '5',
      key: '5',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '6',
      key: '6',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '7',
      key: '7',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '8',
      key: '8',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '9',
      key: '9',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '10',
      key: '10',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '11',
      key: '11',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '12',
      key: '12',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '13',
      key: '13',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '14',
      key: '14',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '15',
      key: '15',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '16',
      key: '16',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '17',
      key: '17',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '18',
      key: '18',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '19',
      key: '19',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '20',
      key: '20',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '21',
      key: '21',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '22',
      key: '22',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '23',
      key: '23',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '24',
      key: '24',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '25',
      key: '25',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '26',
      key: '26',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '27',
      key: '27',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '28',
      key: '28',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '29',
      key: '29',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '30',
      key: '30',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '31',
      key: '31',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '32',
      key: '32',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '33',
      key: '33',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '34',
      key: '34',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '35',
      key: '35',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '36',
      key: '36',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '37',
      key: '37',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '38',
      key: '38',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '39',
      key: '39',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '40',
      key: '40',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '41',
      key: '41',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '42',
      key: '42',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '43',
      key: '43',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '44',
      key: '44',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '45',
      key: '45',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '46',
      key: '46',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '47',
      key: '47',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '48',
      key: '48',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '49',
      key: '49',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '50',
      key: '50',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '51',
      key: '51',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '52',
      key: '52',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '53',
      key: '53',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '54',
      key: '54',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '55',
      key: '55',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '56',
      key: '56',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '57',
      key: '57',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '58',
      key: '58',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
    {
      name: '59',
      key: '59',
      tmp_language:
        'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.TIMEROPTIONS',
    },
  ],
  OTPOPTIONS: [
    { name: 'Yes', key: 'Yes', tmp_language: 'COMMON.ACTIONS.YES' },
    { name: 'No', key: 'No', tmp_language: 'COMMON.ACTIONS.NO' },
  ],

  PENDING_ITEM_ALERT: [
    { name: '1 hours', key: '1 hours' },
    { name: '2 hours', key: '2 hours' },
    { name: '3 hours', key: '3 hours' },
    { name: '4 hours', key: '4 hours' },
    { name: '5 hours', key: '5 hours' },
    { name: '6 hours', key: '6 hours' },
    { name: '12 hours', key: '12 hours' },
    { name: '1 days', key: '1 days' },
    { name: '2 days', key: '2 days' },
    { name: '3 days', key: '3 days' },
    { name: '4 days', key: '4 days' },
    { name: '5 days', key: '5 days' },
    { name: '6 days', key: '6 days' },
    { name: '7 days', key: '7 days' },
    { name: '8 days', key: '8 days' },
    { name: '9 days', key: '9 days' },
    { name: '10 days', key: '10 days' },
  ],
  INVOICE_DUE_TIME_ALERT: [
    { name: '60 minutes', key: '60 minutes' },
    { name: '6 hours', key: '6 hours' },
    { name: '12 hours', key: '12 hours' },
    { name: '24 hours', key: '24 hours' },
    { name: '6 days', key: '6 days' },
    { name: '15 days', key: '15 days' },
  ],
  INVOICE_DUE_DAY_ALERT: [
    { name: '1 days', key: '1' },
    { name: '2 days', key: '2' },
    { name: '3 days', key: '3' },
    { name: '4 days', key: '4' },
    { name: '5 days', key: '5' },
    { name: '6 days', key: '6' },
    { name: '7 days', key: '7' },
    { name: '8 days', key: '8' },
    { name: '9 days', key: '9' },
    { name: '10 days', key: '10' },
    { name: '11 days', key: '11' },
    { name: '12 days', key: '12' },
    { name: '13 days', key: '13' },
    { name: '14 days', key: '14' },
    { name: '15 days', key: '15' },
    { name: '16 days', key: '16' },
    { name: '17 days', key: '17' },
    { name: '18 days', key: '18' },
    { name: '19 days', key: '19' },
    { name: '20 days', key: '20' },
    { name: '21 days', key: '21' },
    { name: '22 days', key: '22' },
    { name: '23 days', key: '23' },
    { name: '24 days', key: '24' },
    { name: '25 days', key: '25' },
    { name: '26 days', key: '26' },
    { name: '27 days', key: '27' },
    { name: '28 days', key: '28' },
    { name: '29 days', key: '29' },
    { name: '30 days', key: '30' },
  ],
  USER_NOTIFY_BY: [
    { name: 'Email', key: 'Email' },
    { name: 'Alert', key: 'Alert' },
    { name: 'Notification', key: 'Notification' },
  ],
  DOCUMENT_TYPE_LIST: [
    { name: 'Invoice', key: 'INVOICE' },
    { name: 'PO', key: 'PURCHASE_ORDER' },
    { name: 'Packing Slip', key: 'PACKING_SLIP' },
    { name: 'Receiving Slip', key: 'RECEIVING_SLIP' },
    { name: 'Quote', key: 'QUOTE' },
  ],
  DOCUMENT_TYPES: {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
    invoice: 'INVOICE'
  }
};
