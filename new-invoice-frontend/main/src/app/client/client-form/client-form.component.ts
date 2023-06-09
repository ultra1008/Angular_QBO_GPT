import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification, swalWithBootstrapButtons, swalWithBootstrapTwoButtons, } from 'src/consts/utils';
import { ClientService } from '../client.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';
import { CostCodeModel, CountryModel, TermModel } from 'src/app/settings/settings.model';
import { UserModel } from 'src/app/users/user.model';
import { ClientJobModel } from '../client.model';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
})
export class ClientFormComponent {
  vendorForm: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: Array<TermModel> = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  variablecostcodeList: Array<CostCodeModel> = [];
  costcodeList: Array<CostCodeModel> = this.variablecostcodeList.slice();
  variableapproverList: Array<UserModel> = [];
  approverList: Array<UserModel> = this.variableapproverList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id: any;
  submitting_text = '';
  titleMessage = '';
  show = false;
  role_permission!: RolePermission;
  is_delete: any;
  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public vendorService: ClientService,
    private sanitiser: DomSanitizer,
    public commonService: CommonService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;

    this.vendorForm = this.fb.group({
      client_name: ['', [Validators.required]],
      client_number: ['', [Validators.required]],
      client_email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      client_cost_cost_id: [''],
      approver_id: [''],
      client_status: [''],
      client_notes: [''],
    });
    this.getapprover();
    this.getcostcode();
    if (this.id) {
      this.getOneVendor();
    }
  }

  async getOneVendor() {
    const data = await this.vendorService.getOneClient(this.id);
    if (data.status) {
      const clientData = data.data;
      this.is_delete = clientData.is_delete;
      this.vendorForm = this.fb.group({
        client_name: [clientData.client_name, [Validators.required]],
        client_number: [clientData.client_number, [Validators.required]],
        client_email: [clientData.client_email, [Validators.required, Validators.email, Validators.minLength(5)],],
        client_cost_cost_id: [clientData.client_cost_cost_id],
        approver_id: [clientData.approver_id],
        client_status: [clientData.client_status],
        client_notes: [clientData.client_notes],
      });

      this.vendorForm.markAllAsTouched();
    }
  }

  async getcostcode() {
    const data = await this.vendorService.getcostcode();
    if (data.status) {
      this.variablecostcodeList = data.data;
      this.costcodeList = this.variablecostcodeList.slice();
    }
  }

  async getapprover() {
    const data = await this.vendorService.getApprover();
    if (data.status) {
      this.variableapproverList = data.data;
      this.approverList = this.variableapproverList.slice();
    }
  }

  async saveVendor() {
    if (this.vendorForm.valid) {
      const requestObject = this.vendorForm.value;
      if (this.id) {
        requestObject._id = this.id;
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_CLIENT, requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate([WEB_ROUTES.CLIENT]);
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('VENDOR.CONFIRMATION_DIALOG.SAVING'),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.SAVE_EXIT'),
        cancelButtonText: this.translate.instant('COMMON.ACTIONS.DONT_SAVE'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.CANCEL'),
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.submitting_text = this.translate.instant(
            'VENDOR.CONFIRMATION_DIALOG.SUBMIT'
          );
          // Move to the vendor listing
          if (this.vendorForm.valid) {
            this.saveVendor();
          } else {
            // alert form invalidation
            showNotification(this.snackBar, this.submitting_text, 'error');
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.router.navigate([WEB_ROUTES.CLIENT]);
          }, 100);
        }
      });
  }

  async deleteClient() {
    if (this.is_delete == 1) {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.RESTORE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const requestObject = {
            _id: this.id,
            is_delete: this.is_delete == 1 ? 0 : 1,
          };
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_DELETE, requestObject);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            this.router.navigate([WEB_ROUTES.CLIENT]);
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }
}
