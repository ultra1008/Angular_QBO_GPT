import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  userpersonalinfo: UntypedFormGroup;
  showHideExpiration: any = [];
  db_Doc_types: any = [];
  doc_controller: number = 0;
  document_array: any = Array(Array());

  imageError: any;
  isImageSaved: boolean = false;
  cardImageBase64: any;
  filepath: any;
  maxDate = new Date();
  constructor(private fb: UntypedFormBuilder, private formBuilder: FormBuilder, private snackBar: MatSnackBar,) {
    this.maxDate.setDate(this.maxDate.getDate() - 5114);

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

  }
  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  addDoc() {
    this.doc_controller++;

    // this.U_D.push(this.formBuilder.group({
    //   userdocument_type_id: ['', Validators.required],
    //   userdocument_expire_date: ['']
    // }));
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
  get u_from() { return this.userpersonalinfo.controls; }
  get U_D() { return this.u_from['usersDocument']; }

}
