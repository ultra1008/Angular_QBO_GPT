import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from '../../map/mode-detect.service';

@Component({
  selector: 'app-invoice-other-document',
  templateUrl: './invoice-other-document.component.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class InvoiceOtherDocumentComponent implements OnInit {
  @Input() documentType: any;

  hideToggle = false;
  disabled = false;
  displayMode: string = 'default';
  pdf_url = 'https://s3.us-west-1.wasabisys.com/rovukdata/invoice-sample-pdfs/adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e4939f2250519457511c73e527873ff3e198be850e1d1c710b0.pdf';
  multi = false;
  hide: Boolean = true;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;
  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };

  constructor(private router: Router, private modeService: ModeDetectService, public route: ActivatedRoute,) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";

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
  }

  ngOnInit(): void {
  }
  goToEdit() {
    let that = this;
    console.log("sdafdsf", that.documentType, that.documentTypes);
    if (that.documentType == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form']);
    } else if (that.documentType == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form']);
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form']);
    } else if (that.documentType == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form']);
    }

  }
  print() {
    fetch(this.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
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
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
}
