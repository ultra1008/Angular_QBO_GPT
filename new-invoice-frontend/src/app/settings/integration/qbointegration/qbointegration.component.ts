import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { WEB_ROUTES } from 'src/consts/routes';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-qbointegration',
  templateUrl: './qbointegration.component.html',
  styleUrls: ['./qbointegration.component.scss']
})
export class QbointegrationComponent {
  integrationinfo: FormGroup;
  qboIcon: any = icon.QUICKBOOKS_ONLINE_LOGO;
  qboIntegrated: any;
  showConnectionButton: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  code = '';
  state = '';
  realmId = '';

  constructor (private formBuilder: FormBuilder, private router: Router, public httpCall: HttpCall, private _snackBar: MatSnackBar,
    public route: ActivatedRoute, private commonService: CommonService) {
    route.queryParams.subscribe(queryParams => {
      if (queryParams['code']) {
        this.code = queryParams['code'];
      }
      if (queryParams['state']) {
        this.state = queryParams['state'];
      }
      if (queryParams['realmId']) {
        this.realmId = queryParams['realmId'];
      }
    });

    this.integrationinfo = this.formBuilder.group({
      quickbooks_client_id: ['', Validators.required],
      quickbooks_client_secret: ['', Validators.required],
    });
    setTimeout(() => {
      if (this.code != '' && this.state != '' && this.realmId != '') {
        this.saveQuickbookData();
      }
      /*   that.router.navigate(['/settings/qbo-integration']).then(); */
    }, 100);
  }

  async saveQuickbookData() {
    const requestObject = {
      client_id: configData.QUICKBOOKS_CLIENT_ID,
      client_secret: configData.QUICKBOOKS_CLIENT_SECRET,
      redirectUri: configData.QUICKBOOKS_REDIRECT_URL,
      environment: configData.QUICKBOOKS_ENVIRONMENT,
      // code: this.code,
      // state: this.state,
      // realmId: this.realmId,
    };
    const url = httpversion.V1 + httproutes.QUICKBOOK_CALLBACK + `?grant_type=authorization_code&code=${this.code}&state=${this.state}&realmId=${this.realmId}`;
    this.router.navigate(['/settings/qbo-integration']).then();
    const data = await this.commonService.postRequestAPI(url, requestObject);
  }
  logout(): void {
    const reqObject = {
      companycode: localStorage.getItem('companycode')
    };
    document.getElementById('blogin_id')!.style.display = "block";
    document.getElementById('blogout_id')!.style.display = "none";
    localStorage.removeItem("isCheckSync_QBO");
    this.httpCall.httpPostCall(httproutes.QUICKBOOK_LOGOUT, reqObject).subscribe(function (resdata) {
      //
    });
  }
  saveData(): void {
    let that = this;
    const reqObject = this.integrationinfo.value;
    localStorage.setItem('integratewithQBO', 'no');
    reqObject.quickbooks_client_id = configData.QUICKBOOKS_CLIENT_ID;
    reqObject.quickbooks_client_secret = configData.QUICKBOOKS_CLIENT_SECRET;
    reqObject.redirectUri = configData.QUICKBOOKS_REDIRECT_URL;
    reqObject.environment = configData.QUICKBOOKS_ENVIRONMENT;
    reqObject.companycode = localStorage.getItem('companycode');
    this.httpCall.httpPostCall(httpversion.V1 + httproutes.QUICKBOOK_SAVE_INFO, reqObject).subscribe(function (resdata) {
      const authUri = resdata.authUri;
      window.location.href = authUri;
      /* let parameters = "location=1,width=800,height=650";
     parameters += ",left=" + (screen.width - 800) / 2 + ",top=" + (screen.height - 650) / 2;
     const win = window.open(authUri, 'connectPopup', parameters);
     const pollOAuth = window.setInterval(function () {
       try {
         if (win?.closed === true) {
           clearInterval(pollOAuth);
           console.log("hello clear interval");
         }
       } catch (e) {
         console.log(e);
       }
     }, 100);
     window.addEventListener('message', (event) => {
       if (event.data?.msg && win?.closed === false) {
         that._snackBar.open("You have integrated with QB", "Close", {
           horizontalPosition: that.horizontalPosition,
           verticalPosition: that.verticalPosition,
           duration: 4000,
         });
         document.getElementById('blogin_id')!.style.display = "none";
         document.getElementById('blogout_id')!.style.display = "block";
         localStorage.setItem("isCheckSync_QBO", JSON.stringify(event.data));
         const { bill, vendor, gl } = event.data;
         if (bill) {
           that.httpCall.httpPostCall(httproutes.SAVE_INVOICE_DATABASE, reqObject).subscribe(function (resdata) {
             console.log("I have saved bill datas");
           });
         }
         if (vendor) {
           that.httpCall.httpPostCall(httproutes.SAVE_VENDORS_DATABASE, reqObject).subscribe(function (resdata) {
             console.log("I have saved vendor datas");
           });
         }
         if (gl) {
           that.httpCall.httpPostCall(httproutes.SAVE_GLACCOUNTS_DATABASE, reqObject).subscribe(function (resdata) {
             console.log("I have saved GL account datas");
           });
         }
       }
       if (event.data?.data) {
         console.log(event.data.data);
       }
     }); */
    });
  }

  back() {
    this.router.navigate([WEB_ROUTES.INTEGRATION_SETTING]);
  }

  connect() {
    //
  }
}
