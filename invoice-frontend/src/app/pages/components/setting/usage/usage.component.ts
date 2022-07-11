import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes } from 'src/app/consts';


@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent implements OnInit {
  usageinfo: FormGroup;
  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall) {
    this.usageinfo = this.formBuilder.group({
      amount_of_supervisor: [{ value: '', disabled: true }],
      amount_of_employee: [{ value: '', disabled: true }],
      wasabi_storage_size: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_USEAGE).subscribe(function (params) {
      if (params.status) {
        that.usageinfo = that.formBuilder.group({
          amount_of_supervisor: [{ value: params.data.totalSuervisor, disabled: true }],
          amount_of_employee: [{ value: params.data.totalUser, disabled: true }],
          wasabi_storage_size: [{ value: params.data.bucket_size, disabled: true }]
        });
      }
    });
  }

}
