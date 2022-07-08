import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { icon } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { configdata } from 'src/environments/configData';

@Component({
  selector: 'app-mailbox-monitor',
  templateUrl: './mailbox-monitor.component.html',
  styleUrls: ['./mailbox-monitor.component.scss']
})
export class MailboxMonitorComponent implements OnInit {
  smtpinfo: FormGroup;
  compnay_id: any;
  LTS_ACTIVE: any = configdata.LTS_ACTIVE;
  saveIcon = icon.SAVE_WHITE;
  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService) {

    this.smtpinfo = this.formBuilder.group({
      password: ['', Validators.required],
      frequency: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
  }

}
