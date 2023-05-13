import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, merge } from 'rxjs';
import { ReportService } from '../report.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';

class Todo {
  invoice: string = '';
  p_o: string = '';
  vendor_name: string = '';
  packing_slip: string = '';
  receiving_slip: string = '';
  status: string = '';
  complete: boolean = false;
}

@Component({
  selector: 'app-reports-listing',
  templateUrl: './reports-listing.component.html',
  styleUrls: ['./reports-listing.component.scss']
})
export class ReportsListingComponent {
  allInvoices: any = [];
  dataSource!: any;
  constructor(public ReportServices: ReportService, public httpCall: HttpCall, public uiSpinner: UiSpinnerService,) {

  }

  form: FormGroup = new FormGroup({
    invoice: new FormControl(false),
    p_o: new FormControl(false),
    vendor_name: new FormControl(false),
    packing_slip: new FormControl(false),
    receiving_slip: new FormControl(false),
    status: new FormControl(false)
  });
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });

  invoice = this.form.get('invoice');
  p_o = this.form.get('p_o');
  vendor_name = this.form.get('vendor_name');
  packing_slip = this.form.get('packing_slip');
  receiving_slip = this.form.get('receiving_slip');
  status = this.form.get('status');


  cbValues: any;

  columns: string[] = [];
  /**
   * Control column ordering and which columns are displayed.
   */

  columnDefinitions = [
    { def: 'invoice', label: 'Invoice', hide: this.invoice!.value },
    { def: 'p_o', label: 'PO', hide: this.p_o!.value },
    { def: 'vendor_name', label: 'Vendor Name', hide: this.vendor_name!.value },
    { def: 'packing_slip', label: 'Packing Slip', hide: this.packing_slip!.value },
    { def: 'receiving_slip', label: 'Receiving Slip', hide: this.receiving_slip!.value },
    { def: 'status', label: 'Status', hide: this.status!.value }

  ];

  async getDisplayedColumns() {
    this.columns = this.columnDefinitions.filter(cd => !cd.hide).map(cd => cd.def);
    await this.getReportTable();

  }

  // dataSource: MatTableDataSource<allInvoices>;

  ngAfterViewInit() {
    this.uiSpinner.spin$.next(true);
    let o1: Observable<boolean> = this.invoice!.valueChanges;
    let o2: Observable<boolean> = this.p_o!.valueChanges;
    let o3: Observable<boolean> = this.vendor_name!.valueChanges;
    let o4: Observable<boolean> = this.packing_slip!.valueChanges;
    let o5: Observable<boolean> = this.receiving_slip!.valueChanges;
    let o6: Observable<boolean> = this.status!.valueChanges;


    merge(o1, o2, o3, o4, o5, o6).subscribe(v => {
      this.columnDefinitions[0].hide = this.invoice!.value;
      this.columnDefinitions[1].hide = this.p_o!.value;
      this.columnDefinitions[2].hide = this.vendor_name!.value;
      this.columnDefinitions[3].hide = this.packing_slip!.value;
      this.columnDefinitions[4].hide = this.receiving_slip!.value;
      this.columnDefinitions[5].hide = this.status!.value;

      console.log(this.columnDefinitions);

      this.getDisplayedColumns();
    });

    this.getDisplayedColumns();
  }

  async getReportTable() {
    // const data = await this.ReportServices.getReportTable();
    let that = this;
    let requestObject = {
      start_date: 0,
      end_date: 0,
    };
    that.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.INVOICE_FOR_REPORT, requestObject)
      .subscribe(function (params) {
        console.log('$$$$$$$$$$$$', params);
        if (params.status) {

          if (params.data.length > 0) {
            that.allInvoices = [];
            // for (let i = 0; i < params.data.length; i++) {
            //   let tmpData = [{ invoice: params.data[i].invoice, p_o: params.data[i].p_o, vendor_name: params.data[i].vendor_name, packing_slip: params.data[i].packing_slip, receiving_slip: params.data[i].receiving_slip, status: params.data[i].status }];
            //   that.allInvoices.push(tmpData);
            // }
            for (let i = 0; i < params.data.length; i++) {
              // let tmpData = [{ invoice: params.data[i].invoice, p_o: params.data[i].p_o, vendor_name: params.data[i].vendor_name, packing_slip: params.data[i].packing_slip, receiving_slip: params.data[i].receiving_slip, status: params.data[i].status }];
              // that.allInvoices.push(tmpData);
              that.allInvoices.push({
                'invoice': params.data[i].invoice,
                'p_o': params.data[i].p_o,
                'vendor_name': params.data[i].vendor.vendor_name,
                'packing_slip': params.data[i].packing_slip,
                'receiving_slip': params.data[i].receiving_slip,
                'status': params.data[i].status,
              });
            }
            console.log('###################', that.allInvoices);
            that.dataSource = new MatTableDataSource(that.allInvoices);
            that.uiSpinner.spin$.next(false);
          }
        }
      });
  }
}