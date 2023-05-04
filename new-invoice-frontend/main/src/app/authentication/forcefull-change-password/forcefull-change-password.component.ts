import { Component } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-forcefull-change-password',
  templateUrl: './forcefull-change-password.component.html',
  styleUrls: ['./forcefull-change-password.component.scss']
})
export class ForcefullChangePasswordComponent {

  forcefullyPasswordInfo?: UntypedFormGroup;
  hide = true;
  hideOld: boolean = true;
  hideNew: boolean = true;
  hideConfirm: boolean = true;
  eyeButtonForOldPassword() {
    this.hideOld = !this.hideOld;
  }

  eyeButtonForNewPassword() {
    this.hideNew = !this.hideNew;
  }

  eyeButtonForConfirmPassword() {
    this.hideConfirm = !this.hideConfirm;
  }

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  constructor(private fb: UntypedFormBuilder, private router: Router, private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar) {
    this.initForm();

  }
  initForm() {
    this.forcefullyPasswordInfo = this.fb.group({
      oldpassword: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      password_confirmation: new FormControl("", [Validators.required, this.passwordMatcher.bind(this),])

    });
  }
  // confirm new password validator
  private passwordMatcher(control: FormControl): { [s: string]: boolean; } {
    const reqObject = this.forcefullyPasswordInfo?.value;
    if (reqObject) {
      console.log("sagar: ", control.value, reqObject.password, "-----", control.value == reqObject.password);
      if (this.forcefullyPasswordInfo && control.value !== reqObject.password) {
        console.log("true");
        return { passwordNotMatch: true };
      }
    }
    console.log("false");
    return { passwordNotMatch: false };
  }

  async changePassword() {
    this.forcefullyPasswordInfo?.markAllAsTouched();
    const reqObject = this.forcefullyPasswordInfo?.value;
    let that = this;
    if (reqObject.password !== reqObject.password_confirmation) {
      showNotification(this.snackBar, "Password and confirm password is not matched", 'error');
      return;
    }
    console.log("oldpassword: ", that.forcefullyPasswordInfo?.get('oldpassword')?.valid);
    console.log("password: ", that.forcefullyPasswordInfo?.get('password')?.valid);
    console.log("password_confirmation: ", that.forcefullyPasswordInfo?.get('password_confirmation')?.valid);
    // console.log("call change passwoed", that.forcefullyPasswordInfo?.valid, that.forcefullyPasswordInfo?.value);
    if (that.forcefullyPasswordInfo?.valid) {

      const data = await this.authenticationService.changePassword(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate(['/dashboard/main']);
        // for delete we use splice in order to remove single object from DataService

      } else {
        showNotification(this.snackBar, data.message, 'error');
      }

    }
  }
  onRegister() {
    console.log('Form Value', this.forcefullyPasswordInfo?.value);
  }

}
