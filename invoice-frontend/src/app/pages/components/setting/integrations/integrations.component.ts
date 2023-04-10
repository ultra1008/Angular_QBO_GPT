import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { ModeDetectService } from '../../map/mode-detect.service';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  integrationinfo: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  backIcon = icon.BACK;
  subscription: Subscription;
  mode: any;
  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    private route: ActivatedRoute, private router: Router,) {

    this.integrationinfo = this.formBuilder.group({
      quickbooks_client_id: ['', Validators.required],
      quickbooks_client_secret: ['', Validators.required],
    });

    var modeLocal = localStorage.getItem('darkmood');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }


    });
  }

  ngOnInit(): void {
    let that = this;
    let userData = JSON.parse(localStorage.getItem("userdata") ?? '');

    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_SMTP).subscribe(function (params) {
      if (params.status) {
        that.integrationinfo = that.formBuilder.group({
          quickbooks_client_id: [params.data.quickbooks_client_id, Validators.required],
          quickbooks_client_secret: [params.data.quickbooks_client_secret, Validators.required],
        });
      }
    });


  }

  back(): void {

  }

  clickOnCard(type: any) {
    this.router.navigate(['/setting/view-integration'],);
  }

  saveData(): void {
    let that = this;
    let userData = JSON.parse(localStorage.getString("userdata"));

    if (this.integrationinfo.valid) {
      let reqObject = this.integrationinfo.value;
      reqObject._id = userData.companydata._id;
      this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_QUICKBOOK_UPDATE, reqObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
    }
  }

}
