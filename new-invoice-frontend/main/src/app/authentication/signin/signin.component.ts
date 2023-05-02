import { AuthService } from 'src/app/core/service/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  returnUrl!: string;
  error = '';
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['admin', Validators.required],
      password: ['admin', Validators.required],
    });
  }
  get f() {
    return this.authForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      return;
    } else {
      this.authService
        .login(this.f['username'].value, this.f['password'].value)
        .subscribe({
          next: (res) => {
            if (res) {
              if (res) {
                const token = this.authService.currentUserValue.token;
                if (token) {
                  this.router.navigate(['/dashboard/main']);
                }
              } else {
                this.error = 'Invalid Login';
              }
            } else {
              this.error = 'Invalid Login';
            }
          },
          error: (error) => {
            this.error = error;
            this.submitted = false;
            this.loading = false;
          },
        });
    }
  }
}
