import { User } from "../users/user.model";
import { Vendor } from "../vendors/vendor.model";

export class Invoice {
  _id: string;
  invoice_date_epoch: string;
  due_date_epoch: string;
  vendor_data: Vendor;
  invoice_no: string;
  invoice_total_amount: string;
  sub_total: string;
  assign_to_data: User;
  status: string;
  constructor (invoice: Invoice) {
    {
      this._id = invoice._id;
      this.invoice_date_epoch = invoice.invoice_date_epoch || '';
      this.due_date_epoch = invoice.due_date_epoch || '';
      this.vendor_data = invoice.vendor_data || '';
      this.invoice_no = invoice.invoice_no || '';
      this.invoice_total_amount = invoice.invoice_total_amount || '';
      this.sub_total = invoice.sub_total || '';
      this.assign_to_data = invoice.assign_to_data || '';
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
  invoice_id: string;
  constructor (response: InvoiceMessage) {
    {
      this._id = response._id;
      this.created_at = response.created_at;
      this.sender = response.sender;
      this.receiver = response.receiver;
      this.invoice = response.invoice;
      this.seen_last_message = response.seen_last_message;
      this.invoice_id = response.invoice_id;
    }
  }
}
