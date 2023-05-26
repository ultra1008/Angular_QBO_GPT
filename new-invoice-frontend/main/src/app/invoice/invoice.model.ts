export class Invoice {
  _id: string;
  invoice_date: string;
  due_date: string;
  vendor: string;
  invoice_number: string;
  total_amount: string;
  net_amount: string;
  approver: string;
  status: string;
  constructor (invoice: Invoice) {
    {
      this._id = invoice._id;
      this.invoice_date = invoice.invoice_date || '';
      this.due_date = invoice.due_date || '';
      this.vendor = invoice.vendor || '';
      this.invoice_number = invoice.invoice_number || '';
      this.total_amount = invoice.total_amount || '';
      this.net_amount = invoice.net_amount || '';
      this.approver = invoice.approver || '';
      this.status = invoice.status || '';
    }
  }
}
