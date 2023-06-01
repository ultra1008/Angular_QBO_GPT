import { User } from "../users/user.model";
import { Vendor } from "../vendors/vendor.model";

export class Report {
     _id: string;
     invoice_date_epoch: string;
     due_date_epoch: string;
     vendor_data: Vendor;
     invoice_no: string;
     invoice_total_amount: string;
     sub_total: string;
     assign_to_data: User;
     status: string;
     constructor (invoice: Report) {
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
