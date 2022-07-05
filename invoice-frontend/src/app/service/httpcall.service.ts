import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UiSpinnerService } from './spinner.service';
import * as moment from 'moment';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from '../consts';

@Injectable({ providedIn: 'root' })
export class HttpCall {
  observer_distributor = new Subject();
  public openmodeledit_distributor$ = this.observer_distributor.asObservable();
  saveEmit = new Subject();
  public saveEmit_$ = this.saveEmit.asObservable();
  LOCAL_OFFSET: any;
  constructor(private http: HttpClient, public uiSpinner: UiSpinnerService) {
    this.LOCAL_OFFSET = moment().utcOffset() * 60;
  }

  public httpGetCall(userroute: any): Observable<any> {
    let token: any = "";
    let portal_type = sessionStorage.getItem(localstorageconstants.USERTYPE);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    if (portal_type == "superadmin") {
      token = localStorage.getItem('token_superadmin');
    } else if (portal_type == "portal") {
      token = localStorage.getItem('token');
    } else if (portal_type == "ocps-portal") {
      token = localStorage.getItem(localstorageconstants.IFRAMETOKEN);
    } else if (portal_type == "sponsor-portal") {
      token = localStorage.getItem(localstorageconstants.SUPPLIERTOKEN);
    }
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);

    var url = configdata.apiurl;
    return this.http.get(url + userroute, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public httpPostCall(userroute: any, userdata: any): Observable<any> {
    let token: any = "";
    let portal_type = sessionStorage.getItem(localstorageconstants.USERTYPE);
    if (portal_type == "superadmin") {
      token = localStorage.getItem('token_superadmin');
    } else if (portal_type == "portal") {
      token = localStorage.getItem('token');
    } else if (portal_type == "ocps-portal") {
      // iFrame
      token = localStorage.getItem(localstorageconstants.IFRAMETOKEN);
    } else if (portal_type == "sponsor-portal") {
      // Suppllier & Diversity
      token = localStorage.getItem(localstorageconstants.SUPPLIERTOKEN);
    }

    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);

    var url = configdata.apiurl;
    return this.http.post(url + userroute, userdata, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public httpPostCallWithoutToken(userroute: any, userdata: any): Observable<any> {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + userroute, userdata).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllProject(): Observable<any> {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    const token = localStorage.getItem('token');
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getallprojects", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getJSON(url: any): Observable<any> {
    return this.http.get(url);
  }

  handleError(error: any) {
    if (error.error instanceof Error) {
      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }

  sheduleByDate(body: any): Observable<any> {
    var url = configdata.apiurl;
    return this.http.post(url + 'webapi/v1/portal/onedayschedule', body).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }



}


