import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserRestoreFormComponent } from 'src/app/users/user-restore-form/user-restore-form.component';
import { AdvanceTable } from 'src/app/users/user.model';
import { UserService } from 'src/app/users/user.service';
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../settings.service';

export interface DialogData {
  user: any;
  id: number;
  action: string;
  advanceTable: AdvanceTable;
}

@Component({
  selector: 'app-document-type-form',
  templateUrl: './document-type-form.component.html',
  styleUrls: ['./document-type-form.component.scss'],
})
export class DocumentTypeFormComponent {
  action: string;
  dialogTitle: string;
  DocumentInfo: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  userList: any = [];
  isDelete = 0;
  constructor(
    public dialogRef: MatDialogRef<DocumentTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public userTableService: SettingsService,
    private router: Router
  ) {
    console.log('constroctor User', data);

    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.fName + ' ' + data.advanceTable.lName;
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    }
    this.DocumentInfo = this.createDocumentForm();
  }
  formControl = new UntypedFormControl('', [
    Validators.required, // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
      ? 'Not a valid email'
      : '';
  }
  createDocumentForm(): UntypedFormGroup {
    return this.fb.group({
      document_type_name: ['', [Validators.required]],
      is_expiration: ['', [Validators.required]],
    });
  }
  submit() {
    // emppty stuff
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    this.advanceTableService.addAdvanceTable(this.DocumentInfo.getRawValue());
  }
}
