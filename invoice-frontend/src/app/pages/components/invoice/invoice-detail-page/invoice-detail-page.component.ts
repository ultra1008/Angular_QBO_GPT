import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../../map/mode-detect.service';

@Component({
  selector: 'app-invoice-detail-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  displayMode: string = 'default';
  placeholderIcon: icon.PHOTO_PLACEHOLDER;
  show_tabs: boolean = true;
  hideToggle = false;
  disabled = false;
  pdf_url = 'https://s3.us-west-1.wasabisys.com/rovukdata/invoice-sample-pdfs/adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e4939f2250519457511c73e527873ff3e198be850e1d1c710b0.pdf';
  multi = false;
  hide: Boolean = true;

  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;

  id: any;
  invoiceData: any;
  loadInvoice: boolean = false;

  poDocumentType = 'PO';
  packingSlipDocumentType = 'Packing Slip';
  receivingSlipDocumentType = 'Receiving Slip';
  quoteoDocumentType = 'Quote';


  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  constructor(private modeService: ModeDetectService, private router: Router, public route: ActivatedRoute, public uiSpinner: UiSpinnerService, public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.id = this.route.snapshot.queryParamMap.get('_id');
    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      }
    });
    if (this.id) {
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
    }
  }

  ngOnInit(): void {
  }

  getOneInvoice() {
    let that = this;
    that.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id })
      .subscribe(function (params) {
        if (params.status) {
          that.invoiceData = params.data;
          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
  }

  goToInvoiceEdit(invoiceData) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoiceData._id } });

  }
  print() {
    fetch(this.invoiceData.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow!.print();
        });
      };
    });
  }

  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    a.href = this.invoiceData.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

}





