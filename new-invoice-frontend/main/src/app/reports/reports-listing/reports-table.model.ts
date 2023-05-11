export class Report {
     _id: string;
     invoice: string;
     p_o: string;
     vendor_name: string;
     packing_slip: string;
     receiving_slip: string;
     status: string;

     constructor(response: Report) {
          {
               this._id = response._id;
               this.invoice = response.invoice;
               this.p_o = response.p_o;
               this.vendor_name = response.vendor_name;
               this.packing_slip = response.packing_slip;
               this.receiving_slip = response.receiving_slip;
               this.status = response.status;

          }
     }
}
