import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { configdata } from 'src/environments/configData';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../map/mode-detect.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

@Component({
  selector: 'app-settings-other',
  templateUrl: './settings-other.component.html',
  styleUrls: ['./settings-other.component.scss']
})

export class SettingsOtherComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false }) datatableElement: any;
  @ViewChild('OpenFilebox') OpenFilebox: any;
  packaging_data: any = [];
  manufacturer_data: any = [];
  equipment_data: any = [];
  ownership_data: any = [];
  status_data: any = [];
  frequency_data: any = [];
  expenses_type_data: any = [];
  itemType: any = [];
  color_data: any = [];
  terms_data: any = [];
  language_data: any = [];
  weight_data: any = [];
  creditCard: any = [];
  projectdoc_data: any = [];
  currrent_tab: string = "Item Type";
  GAS_SETTING: string = configdata.GAS_SETTING;
  STATUS_IDLE_SETTING: string = configdata.STATUS_IDLE_SETTING;
  STATUS_In_Use_SETTING: string = configdata.STATUS_In_Use_SETTING;
  Settings_Other_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  tab_Array: any = ['Item Type', 'Packaging', 'Manufacturer', 'Equipment'
    , 'Frequency', 'Expenses', 'Weight',
    'Project Document', 'Credit Cards', 'Color', 'Terms', 'Language'];
  Company_Equipment_File_Not_Match: any;
  editIcon: string;
  deleteIcon: string;
  importIcon: string;
  mode: any;
  subscription: Subscription;
  constructor(private modeService: ModeDetectService, public dialog: MatDialog, public http: HttpClient, public httpCall: HttpCall, public sb: Snackbarservice,
    public translate: TranslateService) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.importIcon = icon.IMPORT;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
    } else {
      this.importIcon = icon.IMPORT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.importIcon = icon.IMPORT;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
      } else {
        this.mode = 'on';
        this.importIcon = icon.IMPORT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
      }
      console.log("DARK MODE: " + this.mode);
    });
    let that = this;
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.translate.stream(['']).subscribe((textarray) => {
      this.Settings_Other_Do_Want_Delete = this.translate.instant('Settings_Other_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      that.Company_Equipment_File_Not_Match = that.translate.instant('Company_Equipment_File_Not_Match');
    });
    let url = "./assets/i18n/es.json";
    if (user_data.companydata.companylanguage) {
      url = "./assets/i18n/" + user_data.companydata.companylanguage + ".json";
    }

    this.httpCall.getJSON(url).subscribe((params) => {
      that.STATUS_IDLE_SETTING = params["status_Idle"];
      that.STATUS_In_Use_SETTING = params["status_In_Use"];
    });
  }

  ngOnInit(): void {
    this.projectGetData();
    this.manufacturerGetData();
    this.equipmentGetData();
    this.ownershipGetData();
    this.statusGetData();
    this.frequencyGetData();
    this.expensesGetData();
    this.weightGetData();
    this.projectDocGetData();
    this.creditCardData();
    this.itemTypeData();
    this.colorData();
    this.termsData();
    this.languageData();
  }


  addOtherSetting(reqData: any, SettingType: any, name: any, tmp_name: any): void {
    const dialogRef = this.dialog.open(otherSettingManually, {
      data: {
        reqData: reqData,
        SettingType: SettingType,
        name: name,
        tmp_name: tmp_name
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (this.currrent_tab == "Packaging") {
        this.projectGetData();
      } else if (this.currrent_tab == "Manufacturer") {
        this.manufacturerGetData();
      } else if (this.currrent_tab == "Equipment") {
        this.equipmentGetData();
      } else if (this.currrent_tab == "Ownership") {
        this.ownershipGetData();
      } else if (this.currrent_tab == "Equipment Status") {
        this.statusGetData();
      } else if (this.currrent_tab == "Frequency") {
        this.frequencyGetData();
      } else if (this.currrent_tab == "Expenses") {
        this.expensesGetData();
      } else if (this.currrent_tab == "Weight") {
        this.weightGetData();
      } else if (this.currrent_tab == "Project Document") {
        this.projectDocGetData();
      } else if (this.currrent_tab == "Credit Cards") {
        this.creditCardData();
      } else if (this.currrent_tab == "Item Type") {
        this.itemTypeData();
      } else if (this.currrent_tab == "Color") {
        this.colorData();
      }
      else if (this.currrent_tab == "Terms") {
        this.termsData();
      }
      else if (this.currrent_tab == "Language") {
        this.languageData();
      }
    });
  }




  onTabChanged($event: any) {
    this.currrent_tab = this.tab_Array[$event.index];

  }

  deletesetting(data: any) {
    let that = this, url: any;
    if (that.currrent_tab == "Packaging") {
      url = httproutes.OTHER_SEETING_PACKAGING_DELETE;
    } else if (that.currrent_tab == "Manufacturer") {
      url = httproutes.OTHER_SEETING_MANUFACTURERS_DELETE;
    } else if (that.currrent_tab == "Equipment") {
      url = httproutes.OTHER_SEETING_EQUIPMENT_DELETE;
    } else if (this.currrent_tab == "Ownership") {
      url = httproutes.OTHER_SEETING_OWNERSHIP_DELETE;
    } else if (this.currrent_tab == "Equipment Status") {
      url = httproutes.OTHER_SEETING_STATUSSETTING_DELETE;
    } else if (that.currrent_tab == "Frequency") {
      url = httproutes.OTHER_SEETING_FREQUENCY_DELETE;
    } else if (that.currrent_tab == "Expenses") {
      url = httproutes.OTHER_SEETING_EXPENSES_TYPE_DELETE;
    } else if (that.currrent_tab == "Weight") {
      url = httproutes.OTHER_SETTING_WEIGHT_DELETE;
    } else if (that.currrent_tab == "Project Document") {
      url = httproutes.OTHER_SETTING_PROJECT_DOC_DELETE;
    } else if (that.currrent_tab == "Credit Cards") {
      url = httproutes.OTHER_SETTING_CREDIT_CARD_DELETE;
    } else if (that.currrent_tab == "Item Type") {
      url = httproutes.PORTAL_COMPANY_ITEM_TYPE_DELETE;
    } else if (this.currrent_tab == "Color") {
      url = httproutes.OTHER_COLOR_DELETE;
    }
    else if (this.currrent_tab == "Terms") {
      url = httproutes.OTHER_TERM_DELETE;
    }
    else if (that.currrent_tab == "Language") {
      url = httproutes.OTHER_LANGUAGE_DELETE;
    }
    swalWithBootstrapButtons.fire({
      title: this.Settings_Other_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(url, { _id: data._id }).subscribe(function (params) {
          if (params.status) {
            that.sb.openSnackBar(params.message, "success");
            if (that.currrent_tab == "Packaging") {
              that.projectGetData();
            } else if (that.currrent_tab == "Manufacturer") {
              that.manufacturerGetData();
            } else if (that.currrent_tab == "Equipment") {
              that.equipmentGetData();
            } else if (that.currrent_tab == "Ownership") {
              that.ownershipGetData();
            } else if (that.currrent_tab == "Equipment Status") {
              that.statusGetData();
            } else if (that.currrent_tab == "Frequency") {
              that.frequencyGetData();
            } else if (that.currrent_tab == "Expenses") {
              that.expensesGetData();
            } else if (that.currrent_tab == "Weight") {
              that.weightGetData();
            } else if (that.currrent_tab == "Project Document") {
              that.projectDocGetData();
            } else if (that.currrent_tab == "Credit Cards") {
              that.creditCardData();
            } else if (that.currrent_tab == "Item Type") {
              that.itemTypeData();
            } else if (that.currrent_tab == "Color") {
              that.colorData();
            }
            else if (that.currrent_tab == "Terms") {
              that.termsData();
            }
            else if (that.currrent_tab == "Language") {
              that.languageData();
            }
          } else {
            that.sb.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }


  projectGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_PACKAGING_GET).subscribe(function (params: any) {
      if (params.status) {
        self.packaging_data = params.data;
      }
    });
  }
  manufacturerGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_MANUFACTURERS_GET).subscribe(function (params: any) {
      if (params.status) {
        self.manufacturer_data = params.data;
      }
    });
  }
  equipmentGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_EQUIPMENT_GET).subscribe(function (params: any) {
      if (params.status) {
        self.equipment_data = params.data;
      }
    });
  }

  ownershipGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_OWNERSHIP_GET).subscribe(function (params: any) {
      if (params.status) {
        self.ownership_data = params.data;
      }
    });
  }

  statusGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_STATUSSETTING_GET).subscribe(function (params: any) {
      if (params.status) {
        self.status_data = params.data;
      }
    });
  }

  frequencyGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_FREQUENCY_GET).subscribe(function (params: any) {
      if (params.status) {
        self.frequency_data = params.data;
      }
    });
  }

  expensesGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SEETING_EXPENSES_TYPE_GET).subscribe(function (params: any) {
      if (params.status) {
        self.expenses_type_data = params.data;
      }
    });
  }

  weightGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SETTING_WEIGHT_GET).subscribe(function (params: any) {
      if (params.status) {
        self.weight_data = params.data;
      }
    });
  }

  projectDocGetData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SETTING_PROJECT_DOC_GET).subscribe(function (params: any) {
      if (params.status) {
        self.projectdoc_data = params.data;
      }
    });
  }

  creditCardData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_SETTING_CREDIT_CARD_GET).subscribe(function (params: any) {
      if (params.status) {
        let tmp_data = _.remove(params.data, function (n: any) { return n.name != 'None'; });
        self.creditCard = tmp_data;
      }
    });
  }
  itemTypeData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_COMPANY_ITEM_TYPE_GET).subscribe(function (params: any) {
      if (params.status) {
        self.itemType = params.data;
      }
    });
  }

  colorData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_COLOR_GET).subscribe(function (params: any) {
      if (params.status) {
        self.color_data = params.data;
      }
    });
  }

  termsData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_TERM_GET).subscribe(function (params: any) {
      if (params.status) {
        self.terms_data = params.data;
      }
    });
  }

  languageData() {
    let self = this;
    this.httpCall.httpGetCall(httproutes.OTHER_LANGUAGE_GET).subscribe(function (params: any) {
      if (params.status) {
        self.language_data = params.data;
      }
    });
  }
  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  onFileChange(ev: any) {
    let that = this;
    let workBook: any = null;
    let jsonData = null;
    let header_: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = (XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        header_ = data.shift();

        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const keys_OLD = ['item_type_name', 'packaging_name', 'terms_name'];
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append("file", file);
        that.httpCall.httpPostCall(httproutes.PORTAL_COMPANY_OTHER_SETTING, formData_profle).subscribe(function (params) {
          if (params.status) {
            that.sb.openSnackBar(params.message, "success");
            that.itemTypeData();
            that.termsData();
            that.projectGetData();
            //that.rerenderfunc();
          } else {
            that.sb.openSnackBar(params.message, "error");
          }
        });
      }
    };
    reader.readAsBinaryString(file);
  }

}


@Component({
  selector: 'other-setting-manually',
  templateUrl: './other-setting-manually.component.html',
  styleUrls: ['./settings-other.component.scss']
})

export class otherSettingManually implements OnInit {
  costcode_module: any = configdata.COSTCODE_MODULE_ARRAY;
  public credit_card_types: any = configdata.CREDIT_CARD_TYPES;
  public othersetting: FormGroup;
  name: any;
  tmp_name: any = "";
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon = icon.SAVE_WHITE;
  constructor(public dialogRef: MatDialogRef<otherSettingManually>, private modeService: ModeDetectService, public translate: TranslateService, public sb: Snackbarservice,
    public formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall) {
    let new_name;
    let new_number;
    let is_expiration;

    this.name = data.name;
    this.tmp_name = data.tmp_name;
    this.othersetting = this.formBuilder.group({
      name: ["", Validators.required],
      number: [""],
      is_expiration: new FormControl(false)
    });

    if (this.data.SettingType == "CreditCards") {
      this.othersetting.get('number')!.setValidators([Validators.required]);
      this.othersetting.get('number')!.updateValueAndValidity();
    }
    else {
      this.othersetting.get('number')!.clearValidators();
      this.othersetting.get('number')!.updateValueAndValidity();
    }

    if (this.data.SettingType)
      if (this.data.reqData._id) {
        if (this.data.SettingType == "packaging") {
          new_name = this.data.reqData.packaging_name;
        } else if (this.data.SettingType == "Manufacturer") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Equipment") {
          new_name = this.data.reqData.equipment_type;
        } else if (this.data.SettingType == "Ownership") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Status") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Frequency") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Expenses") {
          new_name = this.data.reqData.expensestype;
        } else if (this.data.SettingType == "Weight") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "ProjectDocument") {
          new_name = this.data.reqData.project_document_type_name;
          is_expiration = this.data.reqData.is_expiration;
        } else if (this.data.SettingType == "CreditCards") {
          let arrayName = this.data.reqData.name.split("-");
          new_name = arrayName[0];
          new_number = arrayName[1];
        } else if (this.data.SettingType == "ItemType") {
          new_name = this.data.reqData.item_type_name;
        } else if (this.data.SettingType == "Color") {
          new_name = this.data.reqData.name;
        }
        else if (this.data.SettingType == "Terms") {
          new_name = this.data.reqData.name;
        }
        else if (this.data.SettingType == "Language") {
          new_name = this.data.reqData.name;
        }
        this.othersetting = this.formBuilder.group({
          name: [new_name, Validators.required],
          number: [new_number],
          is_expiration: new FormControl(is_expiration)
        });
      }


    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    console.log("this.mode main", this.mode);
    if (this.mode == 'off') {
      console.log("this.mod", this.mode);
      this.backIcon = icon.BACK;


    } else {
      console.log("this.mod else", this.mode);
      this.backIcon = icon.BACK_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;

      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;

      }
      console.log("DARK MODE: " + this.mode);
    });
  }

  ngOnInit() {
  }

  saveData() {

    let url, reqObject: any;
    let that = this;
    let formvalue = this.othersetting.value;
    if (this.othersetting.valid) {
      if (this.data.SettingType == "packaging") {
        url = httproutes.OTHER_SEETING_PACKAGING_SAVE;
        reqObject = {
          packaging_name: formvalue.name
        };
      } else if (this.data.SettingType == "Manufacturer") {
        url = httproutes.OTHER_SEETING_MANUFACTURERS_SAVE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "Equipment") {
        url = httproutes.OTHER_SEETING_EQUIPMENT_SAVE;
        reqObject = {
          equipment_type: formvalue.name
        };
      } else if (this.data.SettingType == "Ownership") {
        url = httproutes.OTHER_SEETING_OWNERSHIP_SAVE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "Status") {
        url = httproutes.OTHER_SEETING_STATUSSETTING_SAVE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "Frequency") {
        url = httproutes.OTHER_SEETING_FREQUENCY_SAVE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "Expenses") {
        url = httproutes.OTHER_SEETING_EXPENSES_TYPE_SAVE;
        reqObject = {
          expensestype: formvalue.name
        };
      } else if (this.data.SettingType == "Weight") {
        url = httproutes.OTHER_SEETING_WEIGHT_SAVE;
        reqObject = {
          name: formvalue.name
        };
      }
      else if (this.data.SettingType == "ProjectDocument") {
        url = httproutes.OTHER_SETTING_PROJECT_DOC_SAVE;
        reqObject = {
          project_document_type_name: formvalue.name,
          is_expiration: formvalue.is_expiration
        };
      }
      else if (this.data.SettingType == "CreditCards") {
        url = httproutes.OTHER_SETTING_CREDIT_CARD_SAVE;
        reqObject = {
          name: formvalue.name + "-" + formvalue.number
        };
      }
      else if (this.data.SettingType == "ItemType") {
        url = httproutes.PORTAL_COMPANY_ITEM_TYPE_SAVE;
        reqObject = {
          item_type_name: formvalue.name
        };
      }
      else if (this.data.SettingType == "Color") {
        url = httproutes.OTHER_COLOR_SAVE;
        reqObject = {
          name: formvalue.name
        };
      }
      else if (this.data.SettingType == "Terms") {
        url = httproutes.OTHER_TERM_SAVE;
        reqObject = {
          name: formvalue.name
        };
      }
      else if (this.data.SettingType == "Language") {
        url = httproutes.OTHER_LANGUAGE_SAVE;
        reqObject = {
          name: formvalue.name
        };
      }
    }

    if (this.data.reqData._id) {
      reqObject._id = this.data.reqData._id;
    }

    this.httpCall.httpPostCall(url, reqObject).subscribe(function (params: any) {
      if (params.status) {
        that.sb.openSnackBar(params.message, "success");
        that.dialogRef.close();
      } else {
        that.sb.openSnackBar(params.message, "error");
      }
    });
  }
}