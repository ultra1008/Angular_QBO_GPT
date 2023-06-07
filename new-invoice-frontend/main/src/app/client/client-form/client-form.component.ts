import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TermModel, CountryModel } from 'src/app/vendors/vendor.model';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification, swalWithBootstrapButtons, } from 'src/consts/utils';
import { ClientService } from '../client.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';

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
  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  variablecostcodeList: any = [];
  costcodeList: any = this.variablecostcodeList.slice();
  variableapproverList: any = [];
  approverList: any = this.variableapproverList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id = '';
  isDelete = 1;
  submitting_text = '';
  titleMessage = '';
  show = false;
  role_permission!: RolePermission;

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
      client_number: [''],
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
      this.vendorForm = this.fb.group({
        client_name: [clientData.client_name, [Validators.required]],
        client_number: [clientData.client_number],
        client_email: [
          clientData.client_email,
          [Validators.required, Validators.email, Validators.minLength(5)],
        ],
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

      const data = await this.vendorService.saveClient(requestObject);
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
}
