import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private httpClient: HttpClient, private httpCall: HttpCall) { }

  async getCompunySettings(companycode: string) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.GET_COMPANY_SETTINGS, { companycode: companycode }).toPromise();
    return data;
  }
  async userLogin(reqObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.V1 + httproutes.USER_LOGIN, reqObject).toPromise();
    return data;

  }

}
