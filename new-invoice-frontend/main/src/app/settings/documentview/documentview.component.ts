import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';

@Component({
  selector: 'app-documentview',
  templateUrl: './documentview.component.html',
  styleUrls: ['./documentview.component.scss']
})
export class DocumentviewComponent {

  Document_View_time_value!: string;
  Document_View: boolean = false;
  Archive_Orphan_Document_time_value!: string;
  Archive_Orphan_Document: boolean = false;
  settingObject: any;
  setting_id!: string;
  Document_Settings_Alert_Sure_Want_Change: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  constructor(private router: Router, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public translate: TranslateService) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }

  modelChangeSwitch(event: any, checkoption: any) {

  }

  modelChangeLocationText(event: any, checkoption: any) {

  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
}
