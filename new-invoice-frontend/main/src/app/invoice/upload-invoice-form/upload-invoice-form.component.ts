import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SwitchCompanyComponent } from 'src/app/layout/header/switch-company/switch-company.component';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { DialogData } from 'src/app/vendors/vendor-report/vendor-report.component';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { commonLocalThumbImage, showNotification } from 'src/consts/utils';
import * as  moment from "moment";
import { commonFileChangeEvent } from 'src/app/services/utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-invoice-form',
  templateUrl: './upload-invoice-form.component.html',
  styleUrls: ['./upload-invoice-form.component.scss']
})
export class UploadInvoiceFormComponent {
  invoice_logo = icon.INVOICE_LOGO;
  files: File[] = [];

  constructor (public dialogRef: MatDialogRef<SwitchCompanyComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private commonService: CommonService, private snackBar: MatSnackBar, private router: Router, public uiSpinner: UiSpinnerService,
    private formBuilder: FormBuilder, private sanitiser: DomSanitizer) {

  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  fileBrowseHandler(files: any) {
    commonFileChangeEvent(files, "pdf").then((result: any) => {
      if (result.status) {
        this.prepareFilesList(files.target.files);
      } else {
        showNotification(this.snackBar, 'File type is not supported.', 'error');
      }
    });
  }

  thumbImage(file: any) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  async uploadDocument() {
    if (this.files.length === 0) {
      showNotification(this.snackBar, 'Please select atleast on document.', 'error');
    } else {
      this.uiSpinner.spin$.next(true);
      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append("file[]", this.files[i]);
      }
      formData.append("dir_name", 'invoice');
      formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));

      let pdfUrls = [];
      const attachmentData = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, formData);
      if (attachmentData.status) {
        pdfUrls = attachmentData.data;
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_DOCUMENT_PROCESS, { pdf_urls: pdfUrls });
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        this.dialogRef.close();
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }
}
