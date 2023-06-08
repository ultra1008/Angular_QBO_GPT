import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<boolean>;
  public currentUser: Observable<boolean>;

  constructor (private httpClient: HttpClient, private httpCall: HttpCall) {
    const logout = localStorage.getItem(localstorageconstants.LOGOUT) ?? 'true';
    this.currentUserSubject = new BehaviorSubject<boolean>(logout == 'true');
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): boolean {
    return this.currentUserSubject.value;
  }

  changeLoginValue(value: boolean) {
    console.log("update value", value);
    this.currentUserSubject.next(value);
  }

  async getCompanySettings(companycode: string) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.GET_COMPANY_SETTINGS, { companycode: companycode }).toPromise();
    return data;
  }

  async userLogin(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.USER_LOGIN, reqObject).toPromise();
    return data;
  }

  async checkUserCompany(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.GET_USER_COMPANY, reqObject).toPromise();
    return data;
  }

  async sendOTP(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.SEND_OTP_EMAIL, reqObject).toPromise();
    return data;
  }

  async submitOTP(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.SUBMITT_OTP, reqObject).toPromise();
    return data;
  }

  async loginwithOTP(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.LOGIN_WITH_OTP, reqObject).toPromise();
    return data;
  }

  async emailForgotPassword(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.EMAIL_FORGET_PASSWORD, reqObject).toPromise();
    return data;
  }

  async sendEmailForgotPassword(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.SEND_EMAIL_FORGET_PASSWORD, reqObject).toPromise();
    return data;
  }

  async changePassword(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.CHANGEPASSWORD, reqObject).toPromise();
    return data;
  }
}
