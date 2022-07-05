import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forcefully-resetpassword',
  templateUrl: './forcefully-resetpassword.component.html',
  styleUrls: ['./forcefully-resetpassword.component.scss']
})
export class ForcefullyResetpasswordComponent implements OnInit {
  forcefully_resetpassword: FormGroup;
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

  constructor() {

    this.forcefully_resetpassword = new FormGroup({
      oldpassword: new FormControl("", [Validators.required]),
      newpassword: new FormControl("", [Validators.required]),
      currentpassword: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

}
