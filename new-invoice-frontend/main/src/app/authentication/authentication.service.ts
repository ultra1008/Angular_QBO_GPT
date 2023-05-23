import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor (private httpClient: HttpClient, private httpCall: HttpCall) { }

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

  async forgotPasswordPress(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.USER_FORGET_PASSWORD, reqObject).toPromise();
    return data;
  }

  async changePassword(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.CHANGEPASSWORD, reqObject).toPromise();
    return data;
  }
}
