import { Vendor } from "../vendors/vendor.model";

export class Invoice {
  _id: string;
  invoice_date: string;
  due_date: string;
  vendor: Vendor;
  invoice: string;
  total: string;
  net_amount: string;
  approver: string;
  status: string;
  constructor (invoice: Invoice) {
    {
      this._id = invoice._id;
      this.invoice_date = invoice.invoice_date || '';
      this.due_date = invoice.due_date || '';
      this.vendor = invoice.vendor || '';
      this.invoice = invoice.invoice || '';
      this.total = invoice.total || '';
      this.net_amount = invoice.net_amount || '';
      this.approver = invoice.approver || '';
      this.status = invoice.status || '';
    }
  }
}

export class InvoiceUser {
  _id: string;
  userfullname: string;
  userpicture: string;
  constructor (response: InvoiceUser) {
    {
      this._id = response._id;
      this.userfullname = response.userfullname;
      this.userpicture = response.userpicture;
    }
  }
}
export class InvoiceMessage {
  _id: string;
  created_at: number;
  sender: InvoiceUser;
  receiver: InvoiceUser;
  invoice: Invoice;
  seen_last_message: string;
  constructor (response: InvoiceMessage) {
    {
      this._id = response._id;
      this.created_at = response.created_at;
      this.sender = response.sender;
      this.receiver = response.receiver;
      this.invoice = response.invoice;
      this.seen_last_message = response.seen_last_message;

    }
  }
}
