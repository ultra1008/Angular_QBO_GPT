import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-invoice-message-view',
  templateUrl: './invoice-message-view.component.html',
  styleUrls: ['./invoice-message-view.component.scss']
})
export class InvoiceMessageViewComponent {
  myId = '';
  id: any;
  messageData: any;
  messageList: any = [];
  isLoading = true;

  constructor (public commonService: CommonService, public route: ActivatedRoute) {
    const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');
    this.myId = userData.UserData._id;
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.getOneInvoiceMessage();
  }

  async getOneInvoiceMessage() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_INVOICE_MESSAGE, { _id: this.id });
    if (data.status) {
      this.messageData = data.data;
      this.messageList = data.messages;
      this.isLoading = false;
    }
  }
}