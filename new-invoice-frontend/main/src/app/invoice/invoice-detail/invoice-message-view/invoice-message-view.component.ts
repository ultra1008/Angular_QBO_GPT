import { Component, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-invoice-message-view',
  templateUrl: './invoice-message-view.component.html',
  styleUrls: ['./invoice-message-view.component.scss']
})
export class InvoiceMessageViewComponent {
  disabled = false;
  compact = true;
  invertX = false;
  invertY = false;

  // @ViewChild(NgScrollbar) scrollbarRef: NgScrollbar;

  myId = '';
  id: any;
  messageData: any;
  messageList: any = [];
  isLoading = true;

  form!: UntypedFormGroup;
  endScroll = 0;

  constructor (public commonService: CommonService, public route: ActivatedRoute, private formBuilder: FormBuilder,
    public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar,) {
    const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');
    this.myId = userData.UserData._id;
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.getOneInvoiceMessage();
    this.form = this.formBuilder.group({
      message: ["", Validators.required],
    });
  }

  async getOneInvoiceMessage() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_INVOICE_MESSAGE, { _id: this.id });
    if (data.status) {
      this.messageData = data.data;
      this.messageList = data.messages;
      this.isLoading = false;
    }
    setTimeout(() => {
      /*  const myElement = document.getElementById("myPageId");
       myElement.scrollTop = document.getElementById('messageListDiv')?.scrollHeight; */
      // this.endScroll = document.getElementById('messageListDiv')?.scrollHeight;
    }, 100);
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
}