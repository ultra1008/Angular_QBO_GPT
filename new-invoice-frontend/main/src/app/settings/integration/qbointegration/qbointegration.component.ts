import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
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

  constructor(private formBuilder: FormBuilder, private router: Router, public httpCall: HttpCall, private _snackBar: MatSnackBar) {
    this.integrationinfo = this.formBuilder.group({
      quickbooks_client_id: ['', Validators.required],
      quickbooks_client_secret: ['', Validators.required],
    });
  }

  ngOnInit() {

  }

  logout(): void {
    var reqObject = {
      companycode: localStorage.getItem('companycode')
    };
    document.getElementById('blogin_id')!.style.display = "block";
    document.getElementById('blogout_id')!.style.display = "none";
    localStorage.removeItem("isCheckSync_QBO");
    this.httpCall.httpPostCall(httproutes.QUICKBOOK_LOGOUT, reqObject).subscribe(function (resdata) {

    });
  }
  saveData(): void {
    let that = this;
    var reqObject = this.integrationinfo.value;
    localStorage.setItem('integratewithQBO', 'no');
    reqObject.quickbooks_client_id = configData.QUICKBOOKS_CLIENT_ID;
    reqObject.quickbooks_client_secret = configData.QUICKBOOKS_CLIENT_SECRET;
    reqObject.redirectUri = configData.QUICKBOOKS_REDIRECT_URL;
    reqObject.environment = configData.QUICKBOOKS_ENVIRONMENT;
    reqObject.companycode = localStorage.getItem('companycode');
    this.httpCall.httpPostCall(httpversion.V1 + httproutes.QUICKBOOK_SAVE_INFO, reqObject).subscribe(function (resdata) {
      const authUri = resdata.authUri;
      console.log(authUri);
      var parameters = "location=1,width=800,height=650";
      parameters += ",left=" + (screen.width - 800) / 2 + ",top=" + (screen.height - 650) / 2;
      var win = window.open(authUri, 'connectPopup', parameters);
      var pollOAuth = window.setInterval(function () {
        try {
          if (win?.closed === true) {
            console.log(localStorage.getItem('integratewithQBO'));
            clearInterval(pollOAuth);
          }

        } catch (e) {

          console.log(e);
        }
      }, 100);
      window.addEventListener('message', (event) => {
        console.log('I am Here');
        if (event.data?.msg && win?.closed === false) {
          console.log(event.data);
          console.log(win?.closed);
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
      });
    });

  }

  // connact() {
  //   //this.router.navigate(['settings/qbo-integration-online']);
  //   console.log('connect called');

  // }

  back() {
    this.router.navigate(['/settings/integration']);
  }

  connect() {

  }
}
