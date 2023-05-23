import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { WEB_ROUTES } from 'src/consts/routes';
import { amountChange, numberWithCommas, showNotification } from 'src/consts/utils';
import { UserService } from '../user.service';
import { configData } from 'src/environments/configData';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { Location } from '@angular/common';
import { icon } from 'src/consts/icon';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class UserFormComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  isLinear = false;

  HFormGroup1?: UntypedFormGroup;
  HFormGroup2?: UntypedFormGroup;
  HFormGroup3?: UntypedFormGroup;
  HFormGroup4?: UntypedFormGroup;
  HFormGroup5?: UntypedFormGroup;
  VFormGroup1?: UntypedFormGroup;
  VFormGroup2?: UntypedFormGroup;
  VFormGroup3?: UntypedFormGroup;
  @ViewChild('OpenFilebox') OpenFilebox: any;
  @ViewChild('OpenFilebox_mobile') OpenFilebox_mobile: any;
  userpersonalinfo!: UntypedFormGroup;
  usercontactinfo!: UntypedFormGroup;
  useremployeeinfo!: UntypedFormGroup;
  showHideExpiration: any = [];
  doc_controller = 0;
  document_array = Array(Array());
  sample_img = '/assets/images/image-gallery/logo.png';

  defalut_image: string = icon.MALE_PLACEHOLDER;
  defalut_female_image: string = icon.FEMALE_PLACEHOLDER;
  defalut_image_mobile: string = icon.MALE_PLACEHOLDER;
  defalut_female_image_mobile: string = icon.FEMALE_PLACEHOLDER;

  imageError: any;
  isImageSaved = false;
  cardImageBase64: any;
  filepath: any;
  isImageSaved_Mobile = false;
  cardImageBase64_Mobile: any;
  filepath_Mobile: any;
  change_mobile_pic = false;

  maxDate = new Date();
  variablesRoleList: any = [];
  db_roles: any = this.variablesRoleList.slice();

  //db_manager_users
  variablesdb_manager_users: any = [];
  db_manager_users: any = this.variablesdb_manager_users.slice();

  //db_locations
  variablesdb_locations: any = [];
  db_locations: any = this.variablesdb_locations.slice();

  //db_supervisor_users
  variablesdb_supervisor_users: any = [];
  db_supervisor_users: any = this.variablesdb_supervisor_users.slice();

  //db_jobtitle
  variablesdb_jobtitle: any = [];
  db_jobtitle: any = this.variablesdb_jobtitle.slice();

  //db_jobtype
  variablesdb_jobtype: any = [];
  db_jobtype: any = this.variablesdb_jobtype.slice();

  // languageList
  variableslanguageList: any = [];
  languageList: any = this.variableslanguageList.slice();

  //db_Departmaents
  variablesdb_Departmaents: any = [];
  db_Departmaents: any = this.variablesdb_Departmaents.slice();

  variablesdb_Doc_types: any = [];
  db_Doc_types: any = this.variablesdb_Doc_types.slice();

  public gender_array: any = configData.gender;
  public statuss: any = configData.Status;

  db_costcodes: any = [];

  breadscrums = [
    {
      title: 'Wizard',
      items: ['Forms'],
      active: 'Wizard',
    },
  ];

  id: any;
  userfullName = '';
  step_index = 0;

  constructor (private location: Location, public uiSpinner: UiSpinnerService, public UserService: UserService, private fb: UntypedFormBuilder,
    public route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar,) {
    super();
    this.id = this.route.snapshot.queryParamMap.get("_id");
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.step_index = Number(this.router.getCurrentNavigation()?.extras.state?.['value']);
    }

  }
  ngOnInit() {
    this.getRole();
    this.getManeger();
    this.getLocation();
    this.getSupervisor();
    this.getJobTitle();
    this.getAlljobtype();
    this.getAllDocumentType();
    this.getDepartment();
    this.getLanguage();
    this.userpersonalinfo = this.fb.group({
      username: ['', Validators.required],
      usermiddlename: [""],
      userlastname: ['', Validators.required],
      useremail: ["", [Validators.required, Validators.email]],
      password: [""],
      userssn: [""],
      user_no: [""],
      userroleId: ["", Validators.required],
      usergender: [""],
      // project_email_group: [""],
      // compliance_officer: ["false"],
      userdob: [""],
      userstatus: ["", Validators.required],
      login_from: ["All", Validators.required],
      usersDocument: new FormArray([]),
      allow_for_projects: ["true"]
    });
    this.usercontactinfo = this.fb.group({
      userphone: [""],
      usersecondary_email: ["", [Validators.email]],
      userstreet1: [""],
      userstreet2: [""],
      usercity: [""],
      user_state: [""],
      userzipcode: [""],
      usercountry: [""]
    });
    this.useremployeeinfo = this.fb.group({
      usersalary: ["0.00", Validators.required],
      userstartdate: [""],
      usermanager_id: [""],
      usersupervisor_id: [""],
      userlocation_id: [""],
      userdepartment_id: ["", Validators.required],
      userjob_type_id: [""],
      userjob_title_id: [""],
      user_payroll_rules: [""],
      user_id_payroll_group: [""],
      card_no: [""],
      card_type: [""],
      usercostcode: [""],
      user_languages: []
    });
    if (this.id) {
      this.getOneUser();
    }
  }

  selectionChange(e: any) {
    this.step_index = e.selectedIndex;
  }

  async getOneUser() {
    let that = this;
    const data = await this.UserService.getOneUser(this.id);
    if (data.status) {
      const userData = data.data;

      if (userData.userpicture != "") {
        if (userData.usergender == 'Male') {
          that.defalut_image = userData.userpicture;
          if (userData.userpicture != icon.MALE_PLACEHOLDER) {
            that.defalut_female_image = userData.userpicture;
          }
        }
        if (userData.usergender == 'Female') {
          that.defalut_female_image = userData.userpicture;
          if (userData.userpicture != icon.FEMALE_PLACEHOLDER) {
            that.defalut_image = userData.userpicture;
          }
        }
      }

      if (userData.usermobile_picture != "") {
        if (userData.usergender == 'Male') {
          that.defalut_image_mobile = userData.usermobile_picture;
          if (userData.usermobile_picture != icon.MALE_PLACEHOLDER) {
            that.defalut_female_image_mobile = userData.usermobile_picture;
          }
        }
        if (userData.usergender == 'Female') {
          that.defalut_female_image_mobile = userData.usermobile_picture;
          if (userData.usermobile_picture != icon.FEMALE_PLACEHOLDER) {
            that.defalut_image_mobile = userData.usermobile_picture;
          }
        }
      }

      let complianceOfficer = "false";
      if (userData.compliance_officer) {
        complianceOfficer = userData.compliance_officer.toString();
      }

      that.userfullName = '- ' + userData.userfullname;
      that.userpersonalinfo = that.formBuilder.group({
        username: [userData.username, Validators.required],
        usermiddlename: [userData.usermiddlename],
        userlastname: [userData.userlastname, Validators.required],
        useremail: [userData.useremail],
        password: [""],
        userssn: [userData.userssn],
        user_no: [userData.user_no],
        userroleId: [userData.userroleId],
        usergender: [userData.usergender],
        project_email_group: [userData.project_email_group],
        compliance_officer: [complianceOfficer],
        userdob: [userData.userdob],
        userstatus: [userData.userstatus],
        login_from: [userData.login_from, Validators.required],
        allow_for_projects: [userData.allow_for_projects],
        usersDocument: new FormArray([]),
      });

      /* if (that.role_name == configdata.ROLE_ADMIN) {
        that.userpersonalinfo.get('userroleId')!.setValidators([Validators.required]);
        that.userpersonalinfo.get('userroleId')!.updateValueAndValidity();
      } else {
        that.is_role_disabled = true;
      }
      if (userData.is_first) {
        that.is_role_disabled = true;
      } */
      that.usercontactinfo = that.formBuilder.group({
        userphone: [userData.userphone],
        usersecondary_email: [userData.usersecondary_email, [Validators.email]],
        userstreet1: [userData.userstreet1],
        userstreet2: [userData.userstreet2],
        usercity: [userData.usercity],
        user_state: [userData.user_state],
        userzipcode: [userData.userzipcode],
        usercountry: [userData.usercountry]
      });

      that.useremployeeinfo = that.formBuilder.group({
        usersalary: [userData.usersalary, Validators.required],
        userstartdate: [userData.userstartdate],
        usermanager_id: [userData.usermanager_id],
        usersupervisor_id: [userData.usersupervisor_id],
        userlocation_id: [userData.userlocation_id],
        userdepartment_id: [userData.userdepartment_id, Validators.required],
        userjob_type_id: [userData.userjob_type_id],
        userjob_title_id: [userData.userjob_title_id],
        user_payroll_rules: [Number(userData.user_payroll_rules)],
        user_id_payroll_group: [userData.user_id_payroll_group],
        card_no: [userData.card_no],
        card_type: [userData.card_type],
        usercostcode: [userData.usercostcode],
        user_languages: [userData.user_languages],
      });

      that.useremployeeinfo.get("usersalary")!.setValue(numberWithCommas(userData.usersalary.toFixed(2)));

      /* that.idcardinfo = that.formBuilder.group({
        show_id_card_on_qrcode_scan: [userData.show_id_card_on_qrcode_scan],
      }); */
    }
  }

  amountChange(params: any) {
    this.useremployeeinfo.get("usersalary")!.setValue(amountChange(params));
  }

  async getRole() {
    const data = await this.UserService.getRole();
    if (data.status) {
      this.variablesRoleList = data.data;
      this.db_roles = this.variablesRoleList.slice();
    }
  }

  async getManeger() {
    const data = await this.UserService.getManeger();
    if (data.status) {
      this.variablesdb_manager_users = data.data;
      this.db_manager_users = this.variablesdb_manager_users.slice();

    }
  }

  async getSupervisor() {
    const data = await this.UserService.getSupervisor();
    if (data.status) {
      this.variablesdb_supervisor_users = data.data;
      this.db_supervisor_users = this.variablesdb_supervisor_users.slice();
    }
  }

  async getLocation() {
    const data = await this.UserService.getLocation();
    if (data.status) {
      this.variablesdb_locations = data.data;
      this.db_locations = this.variablesdb_locations.slice();
    }
  }

  async getJobTitle() {
    const data = await this.UserService.getJobTitle();
    if (data.status) {
      this.variablesdb_jobtitle = data.data;
      this.db_jobtitle = this.variablesdb_jobtitle.slice();
    }
  }

  async getAlljobtype() {
    const data = await this.UserService.getAlljobtype();
    if (data.status) {
      this.variablesdb_jobtype = data.data;
      this.db_jobtype = this.variablesdb_jobtype.slice();
    }
  }

  async getAllDocumentType() {
    const data = await this.UserService.getAllDocumentType();
    if (data.status) {
      this.variablesdb_Doc_types = data.data;
      this.db_Doc_types = this.variablesdb_Doc_types.slice();
    }
  }

  async getDepartment() {
    const data = await this.UserService.getDepartment();
    if (data.status) {
      this.variablesdb_Departmaents = data.data;
      this.db_Departmaents = this.variablesdb_Departmaents.slice();
    }
  }

  async getLanguage() {
    const data = await this.UserService.getLanguage();
    if (data.status) {
      this.variableslanguageList = data.data;
      this.languageList = this.variableslanguageList.slice();
    }
  }

  language_change(event: any) {
    let language = event.value;
    this.useremployeeinfo.get("user_languages")!.setValue(language);
  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  openfilebox_mobile() {
    let el: HTMLElement = this.OpenFilebox_mobile.nativeElement;
    el.click();
  }

  showHideExpirationDate(event: any, i: any) {
    let found = this.db_Doc_types.find((element: any) => element._id == event);
    this.showHideExpiration[i] = found.is_expiration;
  }
  documentChangeEvent(fileInput: any, index: any) {

    if (fileInput.target.files && fileInput.target.files[0]) {
      this.document_array[index] = fileInput.target.files[0];
    }
  }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.imageError = result.message;
        showNotification(this.snackBar, result.message, 'error');
      }
    });
  }

  fileChangeEvent_Mobile(fileInput: any) {
    this.imageError = null;
    this.change_mobile_pic = true;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
      if (result.status) {
        this.filepath_Mobile = result.filepath;
        this.cardImageBase64_Mobile = result.base64;
        this.isImageSaved_Mobile = true;
      } else {
        this.imageError = result.message;
        showNotification(this.snackBar, result.message, 'error');
      }
    });
  }

  get u_from() { return this.userpersonalinfo.controls; }
  get U_D() { return this.u_from['usersDocument'] as FormArray; }

  getFormGroup(control: AbstractControl) { return control as FormGroup; }

  addDoc() {
    this.doc_controller++;
    this.U_D.push(this.formBuilder.group({
      userdocument_type_id: new FormControl('', [Validators.required]),
      userdocument_expire_date: new FormControl()
    }));
  }

  async savedata() {
    let that = this;
    this.userpersonalinfo.markAllAsTouched();
    this.usercontactinfo.markAllAsTouched();
    this.useremployeeinfo.markAllAsTouched();
    this.saveUser();
    // if (this.userpersonalinfo.valid && this.useremployeeinfo.valid && this.usercontactinfo.valid) {
    //   swalWithBootstrapButtons.fire({
    //     title: this.YOU_WANT_TO_ADD_SCHEDULE,
    //     showDenyButton: true,
    //     showCancelButton: false,
    //     confirmButtonText: this.Compnay_Equipment_Delete_Yes,
    //     denyButtonText: this.Compnay_Equipment_Delete_No,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.openScheduleform({});
    //     } else {
    //       this.saveUserInDB("");
    //     }

    //   });
    // }
  }

  async saveUser() {
    let that = this;
    if (that.userpersonalinfo.valid && that.useremployeeinfo.valid && that.usercontactinfo.valid) {
      let usersDocument = that.userpersonalinfo.value.usersDocument || [];
      delete that.userpersonalinfo.value.usersDocument;
      let reqObject = {
        ...that.userpersonalinfo.value,
        ...that.useremployeeinfo.value,
        usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),
        ...that.usercontactinfo.value


      };
      reqObject.userpicture = that.sample_img;

      reqObject.allow_for_projects = String(reqObject.allow_for_projects);

      let department_name = that.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
      let jobtitle_name = that.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
      let costcode_name = that.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });

      reqObject.department_name = department_name != undefined ? department_name.department_name : "";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";

      reqObject.userfullname = reqObject.username + " " + reqObject.usermiddlename + " " + reqObject.userlastname;
      reqObject.userfulladdress = reqObject.userstreet1 + "," + reqObject.userstreet2 + "," + reqObject.usercity + "," + reqObject.user_state + reqObject.user_state + "-" + reqObject.userzipcode;
      reqObject = await that.removeEmptyOrNull(reqObject);
      const formData = new FormData();
      formData.append('file', that.filepath);
      formData.append('reqObject', JSON.stringify(reqObject));
      const data = await this.UserService.saveUsers(formData);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate([WEB_ROUTES.USER]);
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async savePersonalInfo() {
    let that = this;
    const tmp_data_emp_info = that.useremployeeinfo.value;
    this.userpersonalinfo.markAllAsTouched();
    if (this.userpersonalinfo.valid) {
      this.uiSpinner.spin$.next(true);
      const reqObject = this.userpersonalinfo.value;
      const department_name = this.db_Departmaents.find((dpt: any) => { return dpt._id == tmp_data_emp_info.userdepartment_id; });
      const jobtitle_name = this.db_jobtitle.find((dpt: any) => { return dpt._id == tmp_data_emp_info.userjob_title_id; });
      const costcode_name = this.db_costcodes.find((dpt: any) => { return dpt._id == tmp_data_emp_info.usercostcode; });
      if (reqObject.password == "" || reqObject.password == null || reqObject.password == undefined) {
        delete reqObject.password;
      }
      reqObject.department_name = department_name != undefined ? department_name.department_name : " ";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : " ";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : " ";
      const fname = reqObject.username != undefined && reqObject.username != "" ? reqObject.username : "";
      const mname = reqObject.usermiddlename != undefined && reqObject.usermiddlename != "" ? reqObject.usermiddlename : "";
      const lname = reqObject.userlastname != undefined && reqObject.userlastname != "" ? reqObject.userlastname : "";
      reqObject.userfullname = fname + " " + mname + " " + lname;

      const formData = new FormData();
      if (this.isImageSaved) {
        formData.append('file', this.filepath);
      } else {
        if (reqObject.usergender == 'Male') {
          reqObject.userpicture = that.defalut_image;
        } else {
          reqObject.userpicture = that.defalut_female_image;
        }
      }
      if (!that.change_mobile_pic) {
        if (reqObject.usergender == 'Male') {
          reqObject.usermobile_picture = that.defalut_image_mobile;
        } else {
          reqObject.usermobile_picture = that.defalut_female_image_mobile;
        }
      }
      formData.append("_id", this.id);
      formData.append('reqObject', JSON.stringify(reqObject));

      const data = await this.UserService.saveUserPersonalInfo(formData);
      if (data.status) {
        if (that.change_mobile_pic) {
          const formData_new = new FormData();
          formData_new.append('file', that.filepath_Mobile);
          formData_new.append("_id", this.id);
          const data_new = await this.UserService.saveUserMobilePicInfo(formData_new);
          if (data_new.status) {
            showNotification(this.snackBar, data_new.message, 'success');
            that.uiSpinner.spin$.next(false);
            that.back();
          } else {
            showNotification(this.snackBar, data_new.message, 'success');
            that.uiSpinner.spin$.next(false);
          }
        } else {
          showNotification(this.snackBar, data.message, 'success');
          that.uiSpinner.spin$.next(false);
          that.back();
        }
      } else {
        showNotification(this.snackBar, data.message, 'error');
        that.uiSpinner.spin$.next(false);
      }
    }
  }

  async saveContactInfo() {
    let that = this;
    const reqObject = this.usercontactinfo.value;
    this.usercontactinfo.markAllAsTouched();
    if (this.usercontactinfo.valid) {
      reqObject._id = this.id;
      this.uiSpinner.spin$.next(true);
      const data = await this.UserService.saveUserContactInfo(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        that.uiSpinner.spin$.next(false);
        that.back();
      } else {
        showNotification(this.snackBar, data.message, 'error');
        that.uiSpinner.spin$.next(false);
      }
    }
  }

  async saveEmployeeInfo() {
    let that = this;
    this.useremployeeinfo.markAllAsTouched();
    if (this.useremployeeinfo.valid) {
      const reqObject = {
        ...this.useremployeeinfo.value,
        usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),
        _id: this.id
      };

      const department_name = this.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
      const jobtitle_name = this.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
      const costcode_name = this.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });

      reqObject.department_name = department_name != undefined ? department_name.department_name : "";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";
      const tmp_per_info = this.userpersonalinfo.value;
      reqObject.userfullname = tmp_per_info.username + " " + tmp_per_info.usermiddlename + " " + tmp_per_info.userlastname;

      const role_name_tmp = this.db_roles.find((dpt: any) => { return dpt._id == reqObject.userroleId; });
      reqObject.role_name = role_name_tmp != undefined ? role_name_tmp.role_name : "";

      // reqObject.userqrcode = that.user_data.userqrcode;
      this.uiSpinner.spin$.next(true);
      const data = await this.UserService.saveUserInfo(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        that.uiSpinner.spin$.next(false);
        that.back();
      } else {
        showNotification(this.snackBar, data.message, 'error');
        that.uiSpinner.spin$.next(false);
      }
    }
  }

  /*  async saveEmployeeInfo() {
      console.log('saveEmployeeInfo');
      let that = this;
      this.useremployeeinfo.markAllAsTouched();
      if (this.useremployeeinfo.valid) {
        let id = this.user_id.toString();
        // let reqObject = this.useremployeeinfo.value;
        let reqObject = {
  
          ...this.useremployeeinfo.value,
          usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),
  
        };
  
        reqObject._id = id;
  
        let department_name = this.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
        let jobtitle_name = this.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
        let costcode_name = this.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });
  
        reqObject.department_name = department_name != undefined ? department_name.department_name : "";
        reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
        reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";
        let tmp_per_info = this.userpersonalinfo.value;
        reqObject.userfullname = tmp_per_info.username + " " + tmp_per_info.usermiddlename + " " + tmp_per_info.userlastname;
  
        let role_name_tmp = this.db_roles.find((dpt: any) => { return dpt._id == reqObject.userroleId; });
        reqObject.role_name = role_name_tmp != undefined ? role_name_tmp.role_name : "";
  
        reqObject.userqrcode = that.user_data.userqrcode;
        this.uiSpinner.spin$.next(true);
  
        this.httpCall.httpPostCall(httproutes.EMPLOYEE_EMPLOYEE_INFO, reqObject).subscribe(function (params) {
  
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.uiSpinner.spin$.next(false);
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
            that.uiSpinner.spin$.next(false);
          }
        });
      }
    } */
  removeEmptyOrNull = (obj: any) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && this.removeEmptyOrNull(obj[k]) ||
      (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
  };

  back(): void {
    this.router.navigate([WEB_ROUTES.USER]);
  }

  onRegister() {
    // console.log('Form Value', this.useremployeeinfo?.value);
  }
} 
