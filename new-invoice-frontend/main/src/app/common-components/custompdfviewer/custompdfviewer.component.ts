import { Component, Input, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { HttpCall } from 'src/app/services/httpcall.service';

@Component({
  selector: 'app-custompdfviewer',
  templateUrl: './custompdfviewer.component.html',
  styleUrls: ['./custompdfviewer.component.scss']
})
export class CustompdfviewerComponent {
  @Input() data: any;
  pdf_url: any;
  isrefresh: boolean = false;
  isspoStatusapprovepending: boolean = false;
  isCertificateStatusPending: boolean = false;

  Custom_Pdf_Viewer_Please_Confirm: string = "";
  Custom_Pdf_Viewer_Want_Approve_Change_Order: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Custom_Pdf_Viewer_Want_Deny_Change_Order: string = "";

  mode: any;
  isDocumentEdit: boolean = false;
  isDocumentDelete: boolean = false;
  documentDeletValue: any;
  editIcon: any;
  deleteIcon: any;
  restoreIcon: any;
  Custom_Pdf_Viewer_Want_Approve_Owner_Direct_Purchase: string = '';
  Custom_Pdf_Viewer_Want_Deny_Owner_Direct_Purchase: string = '';
  Custom_Pdf_Viewer_Want_Accept_Vendor_Certificate: string = '';
  Custom_Pdf_Viewer_Want_Reject_Vendor_Certificate: string = '';
  documentTypes: any = {
    invoice: 'INVOICE',
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
  };
  Archive_Orphan_Document_value: any = [];
  Archive_Orphan_Document: any;
  role_permission: any;
  archivedIcon: any;
  constructor(private location: Location, public route: ActivatedRoute, private router: Router,
    public httpCall: HttpCall, public spinner: UiSpinnerService,
    public translate: TranslateService, public dialog: MatDialog) {


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
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }



  ngOnInit(): void {




  }







}
