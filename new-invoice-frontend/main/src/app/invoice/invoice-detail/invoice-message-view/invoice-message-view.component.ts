import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification } from 'src/consts/utils';
import * as  moment from "moment";

@Component({
  selector: 'app-invoice-message-view',
  templateUrl: './invoice-message-view.component.html',
  styleUrls: ['./invoice-message-view.component.scss']
})
export class InvoiceMessageViewComponent {
  @ViewChild('FileSelectInputDialog') FileSelectInputDialog: ElementRef | any;

  pdf_url = '/assets/pdf_url/file-3.pdf';
  myId = '';
  id: any;
  invoiceId: any;
  messageData: any;
  messageList: any = [];
  isLoading = true;

  form!: UntypedFormGroup;
  endScroll = 0;
  showPDF = true;
  toggled = false;
  emojiPickerDirection = "'top'";

  constructor (public commonService: CommonService, public route: ActivatedRoute, private formBuilder: FormBuilder,
    public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, private router: Router) {
    const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');
    this.myId = userData.UserData._id;
    this.invoiceId = this.route.snapshot.queryParamMap.get('invoice_id') ?? '';
    this.getOneInvoiceMessage();
    this.form = this.formBuilder.group({
      message: ["", Validators.required],
    });
  }

  async getOneInvoiceMessage() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_INVOICE_MESSAGE, { invoice_id: this.invoiceId });
    if (data.status) {
      this.messageData = data.data;
      this.messageList = data.messages;
      this.isLoading = false;
      this.updateSeenFlag();
    }
    setTimeout(() => {
      /*  const myElement = document.getElementById("myPageId");
       myElement.scrollTop = document.getElementById('messageListDiv')?.scrollHeight; */
      // this.endScroll = document.getElementById('messageListDiv')?.scrollHeight;
    }, 100);
  }

  updateSeenFlag() {
    const requestObject = {
      _id: this.id,
      receiver_id: this.myId,
    };
    this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.UPDATE_INVOICE_MESSAGE_SEEN_FLAG, requestObject);
  }

  async sendMessage() {
    if (this.form.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.form.value;
      formValues.invoice_id = this.messageData.invoice_id;
      formValues.is_first = false;
      formValues.invoice_message_id = this.id;
      if (this.myId === this.messageData.sender_id) {
        formValues.users = [this.messageData.receiver_id];
      } else {
        formValues.users = [this.messageData.sender_id];
      }

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SEND_INVOICE_MESSAGE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.form.reset();
        this.messageList.push(data.data);
        /* this.endScroll = document.getElementById('messageListDiv')?.scrollHeight;
        window.scrollTo(0,document.getElementById('messageListDiv')?.scrollHeight) */
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  viewInvoice() {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: this.messageData.invoice_id } });
  }

  back() {
    const from = this.route.snapshot.queryParamMap.get('from') ?? '';
    if (from) {
      this.router.navigate([WEB_ROUTES.INVOICE_MESSAGES]);
    } else {
      this.viewInvoice();
    }
  }

  download() {
    //
  }

  print() {
    //
  }

  handleAttachment() {
    // const e: HTMLElement = this.FileSelectInputDialog.nativeElement;
    // e.click();
    document.getElementById('upload-file')?.click();
  }

  async addAttachment(fileInput: any) {
    const fileReaded = fileInput.target.files[0];
    if (fileReaded) {
      this.uiSpinner.spin$.next(true);
      const formData = new FormData();
      formData.append("file[]", fileReaded);
      formData.append("dir_name", 'invoice_message');
      formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));

      const attachmentData = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, formData);

      const requestObject = {
        message: attachmentData.data[0],
        invoice_id: this.messageData.invoice_id,
        is_first: false,
        invoice_message_id: this.id,
        users: this.myId === this.messageData.sender_id ? [this.messageData.receiver_id] : [this.messageData.sender_id],
        is_attachment: true,
      };

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SEND_INVOICE_MESSAGE, requestObject);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.messageList.push(data.data);
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  collabPDF() {
    this.showPDF = !this.showPDF;
  }

  viewAttachment(message: any) {
    if (message.is_attachment) {
      window.location.href = message.message;
    }
  }

  handleSelection(event: any) {
    const formValues = this.form.value;
    const message = formValues.message + event.char;
    this.form.get('message')?.setValue(message);
  }

}