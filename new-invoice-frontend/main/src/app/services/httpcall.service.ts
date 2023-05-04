import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, catchError, map, throwError } from 'rxjs';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { configData } from 'src/environments/configData';

@Injectable({
  providedIn: 'root'
})
export class HttpCall {

  temp_gif = localStorage.getItem(localstorageconstants.INVOICE_GIF);
  gif = configData.DEFAULT_LOADER_GIF;

  constructor (private http: HttpClient) {
  }

  getLoader(): string {
    return this.temp_gif != null && this.temp_gif != undefined && this.temp_gif != "" ? this.temp_gif : this.gif;
  }

  public httpGetCall(apiRoute: string): Observable<any> {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJEQl9IT1NUIjoibG9jYWxob3N0IiwiREJfTkFNRSI6InJvdnVrXzk4ODUxNCIsIkRCX1BPUlQiOjI3MDE3LCJEQl9VU0VSTkFNRSI6IiIsIkRCX1BBU1NXT1JEIjoiIiwiY29tcGFueWNvZGUiOiJSLTk4ODUxNCIsInRva2VuIjoiIiwiVXNlckRhdGEiOnsiX2lkIjoiNjNjNjYzMTQwOTk4OTQ0MmU4ZWEyYjc5IiwidXNlcnJvbGVJZCI6IjYwZjgwMjE4MTVhYWUzZGRhN2JjODdkZiIsInVzZXJlbWFpbCI6ImNpc2FnYXJwQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU2FnYXIiLCJwYXNzd29yZCI6IiQyYSQxMCRKbXdMQS41YnNmMldUQjNqbnBNaXpPeTA2Q3lyZFBDOUIwTFAyUUkuT3Jzc0JsSzQubFc2NiIsInVzZXJtaWRkbGVuYW1lIjoiIiwidXNlcmxhc3RuYW1lIjoiUGF0ZWwiLCJ1c2VyZnVsbG5hbWUiOiJTYWdhciAgUGF0ZWwiLCJ1c2Vyc3NuIjoiIiwidXNlcmRldmljZV9waW4iOiIiLCJ1c2VycGhvbmUiOiIiLCJ1c2Vyc2Vjb25kYXJ5X2VtYWlsIjoiIiwidXNlcmdlbmRlciI6Ik1hbGUiLCJ1c2VyZG9iIjoiIiwidXNlcnN0YXR1cyI6MSwidXNlcnBpY3R1cmUiOiJodHRwczovL3MzLndhc2FiaXN5cy5jb20vci05ODg1MTQvcm92dWtfaW52b2ljZS9lbXBsb3llZS82M2M2NjMxNDA5OTg5NDQyZThlYTJiNzkvcHJvZmlsZV9waWN0dXJlL3VzZXJfcGljdHVyZS5qcGciLCJ1c2VybW9iaWxlX3BpY3R1cmUiOiJodHRwczovL3MzLnVzLXdlc3QtMS53YXNhYmlzeXMuY29tL3JvdnVrZGF0YS9tYWxlLXBsYWNlaG9sZGVyLnBuZyIsInVzZXJmdWxsYWRkcmVzcyI6IiwsLC0iLCJ1c2Vyc3RyZWV0MSI6IiIsInVzZXJzdHJlZXQyIjoiIiwidXNlcmNpdHkiOiIiLCJ1c2VyX3N0YXRlIjoiIiwidXNlcnppcGNvZGUiOiIiLCJ1c2VyY291bnRyeSI6IiIsInVzZXJzdGFydGRhdGUiOiIiLCJ1c2Vyc2FsYXJ5IjowLCJ1c2VybWFuYWdlcl9pZCI6IiIsInVzZXJzdXBlcnZpc29yX2lkIjoiIiwidXNlcmxvY2F0aW9uX2lkIjoiIiwidXNlcmpvYl90aXRsZV9pZCI6IjYwYmI2OGY2MGJhYzIzOTk0Zjk3ODhkYSIsInVzZXJkZXBhcnRtZW50X2lkIjoiNjBiYjQ2OGUwYmFjMjM5OTRmOTc3NzUzIiwidXNlcmpvYl90eXBlX2lkIjoiNjBiYjY5YjAwYmFjMjM5OTRmOTc4OTNkIiwidXNlcm5vbl9leGVtcHQiOiIiLCJ1c2VybWVkaWNhbEJlbmlmaXRzIjoiIiwidXNlcmFkZGl0aW9uYWxCZW5pZml0cyI6IiIsInVzZXJpc19wYXNzd29yZF90ZW1wIjpmYWxzZSwidXNlcnRlcm1fY29uZGl0aW9ucyI6dHJ1ZSwidXNlcndlYl9zZWN1cml0eV9jb2RlIjoiIiwidXNlcl9wYXlyb2xsX3J1bGVzIjoxLCJ1c2VyX2lkX3BheXJvbGxfZ3JvdXAiOiI2MGJmM2M5NDBiYWMyMzk5NGY5N2FiYjciLCJ1c2VyY29zdGNvZGUiOiI2M2M2NjMxMzA5OTg5NDQyZThlYTJiNzYiLCJ1c2VycXJjb2RlIjoiIiwidXNlcmZpcmViYXNlX2lkIjoiIiwiY2FyZF90eXBlIjoiNjExMTZjNjdjZmZlOTkzZjAwYWRhOWU4IiwiYXBpX3NldHRpbmciOnsibG9jYXRpb24iOmZhbHNlLCJlbXBsb3llZSI6ZmFsc2UsImNvbG9yIjpmYWxzZSwib3duZXJzaGlwIjpmYWxzZSwibWFudWZhY3R1cmVyIjpmYWxzZSwiZnJlcXVlbmN5c2V0dGluZyI6ZmFsc2UsInN0YXR1c3NldHRpbmciOmZhbHNlLCJlcXVpcG1lbnRfdHlwZSI6ZmFsc2UsImNvc3Rjb2RlIjpmYWxzZSwicGFja2FnaW5nIjpmYWxzZSwid2VpZ2h0IjpmYWxzZSwicHJvamVjdCI6ZmFsc2UsImV4cGVuc2VzdHlwZXMiOmZhbHNlLCJpdGVtIjpmYWxzZSwiZXF1aXBtZW50IjpmYWxzZSwidmVuZG9yIjpmYWxzZSwiX2lkIjoiNjNjNjYzMTQwOTk4OTQ0MmU4ZWEyYjc4In0sInNpZ25hdHVyZSI6IiIsImFsbG93X2Zvcl9wcm9qZWN0cyI6dHJ1ZSwidXNlcl9sYW5ndWFnZXMiOlsiNjIxNzY0ZGJlYjJhNmFmNTBmZDM0NGEwIl0sInNob3dfaWRfY2FyZF9vbl9xcmNvZGVfc2NhbiI6dHJ1ZSwiY29tcGxpYW5jZV9vZmZpY2VyIjpmYWxzZSwibG9naW5fZnJvbSI6IkFsbCIsInJvbGVfbmFtZSI6IkFkbWluIiwic3VwZXJ2aXNvcl9uYW1lIjoiIiwibWFuYWdlcl9uYW1lIjoiIiwibG9jYXRpb25fbmFtZSI6IiIsInVzZXJqb2JfdHlwZV9uYW1lIjoiTGFib3IiLCJ1c2Vyam9iX3RpdGxlX25hbWUiOiJFbXBsb3llZSIsImRlcGFydG1lbnRfbmFtZSI6IkFjY291bnRpbmcgRGVwYXJ0bWVudCIsInVzZXJfcGF5cm9sbF9ncm91cF9uYW1lIjoiQWRtaW5pc3RyYXRpdmUiLCJjYXJkX3R5cGVfbmFtZSI6IkRpc2NvdmVyLTYxMTUxNiJ9LCJpYXQiOjE2ODI1MDg5MzZ9.rneo2IRVm5l5NF71OVvJeCH_XROwbx_gg-1PAtwk7eQ";
    const language = 'en';
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', language);

    // var url = configdata.apiurl;
    return this.http.get(apiRoute, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public httpPostCall(apiRoute: string, userdata: any): Observable<any> {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJEQl9IT1NUIjoibG9jYWxob3N0IiwiREJfTkFNRSI6InJvdnVrXzk4ODUxNCIsIkRCX1BPUlQiOjI3MDE3LCJEQl9VU0VSTkFNRSI6IiIsIkRCX1BBU1NXT1JEIjoiIiwiY29tcGFueWNvZGUiOiJSLTk4ODUxNCIsInRva2VuIjoiIiwiVXNlckRhdGEiOnsiX2lkIjoiNjNjNjYzMTQwOTk4OTQ0MmU4ZWEyYjc5IiwidXNlcnJvbGVJZCI6IjYwZjgwMjE4MTVhYWUzZGRhN2JjODdkZiIsInVzZXJlbWFpbCI6ImNpc2FnYXJwQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU2FnYXIiLCJwYXNzd29yZCI6IiQyYSQxMCRKbXdMQS41YnNmMldUQjNqbnBNaXpPeTA2Q3lyZFBDOUIwTFAyUUkuT3Jzc0JsSzQubFc2NiIsInVzZXJtaWRkbGVuYW1lIjoiIiwidXNlcmxhc3RuYW1lIjoiUGF0ZWwiLCJ1c2VyZnVsbG5hbWUiOiJTYWdhciAgUGF0ZWwiLCJ1c2Vyc3NuIjoiIiwidXNlcmRldmljZV9waW4iOiIiLCJ1c2VycGhvbmUiOiIiLCJ1c2Vyc2Vjb25kYXJ5X2VtYWlsIjoiIiwidXNlcmdlbmRlciI6Ik1hbGUiLCJ1c2VyZG9iIjoiIiwidXNlcnN0YXR1cyI6MSwidXNlcnBpY3R1cmUiOiJodHRwczovL3MzLndhc2FiaXN5cy5jb20vci05ODg1MTQvcm92dWtfaW52b2ljZS9lbXBsb3llZS82M2M2NjMxNDA5OTg5NDQyZThlYTJiNzkvcHJvZmlsZV9waWN0dXJlL3VzZXJfcGljdHVyZS5qcGciLCJ1c2VybW9iaWxlX3BpY3R1cmUiOiJodHRwczovL3MzLnVzLXdlc3QtMS53YXNhYmlzeXMuY29tL3JvdnVrZGF0YS9tYWxlLXBsYWNlaG9sZGVyLnBuZyIsInVzZXJmdWxsYWRkcmVzcyI6IiwsLC0iLCJ1c2Vyc3RyZWV0MSI6IiIsInVzZXJzdHJlZXQyIjoiIiwidXNlcmNpdHkiOiIiLCJ1c2VyX3N0YXRlIjoiIiwidXNlcnppcGNvZGUiOiIiLCJ1c2VyY291bnRyeSI6IiIsInVzZXJzdGFydGRhdGUiOiIiLCJ1c2Vyc2FsYXJ5IjowLCJ1c2VybWFuYWdlcl9pZCI6IiIsInVzZXJzdXBlcnZpc29yX2lkIjoiIiwidXNlcmxvY2F0aW9uX2lkIjoiIiwidXNlcmpvYl90aXRsZV9pZCI6IjYwYmI2OGY2MGJhYzIzOTk0Zjk3ODhkYSIsInVzZXJkZXBhcnRtZW50X2lkIjoiNjBiYjQ2OGUwYmFjMjM5OTRmOTc3NzUzIiwidXNlcmpvYl90eXBlX2lkIjoiNjBiYjY5YjAwYmFjMjM5OTRmOTc4OTNkIiwidXNlcm5vbl9leGVtcHQiOiIiLCJ1c2VybWVkaWNhbEJlbmlmaXRzIjoiIiwidXNlcmFkZGl0aW9uYWxCZW5pZml0cyI6IiIsInVzZXJpc19wYXNzd29yZF90ZW1wIjpmYWxzZSwidXNlcnRlcm1fY29uZGl0aW9ucyI6dHJ1ZSwidXNlcndlYl9zZWN1cml0eV9jb2RlIjoiIiwidXNlcl9wYXlyb2xsX3J1bGVzIjoxLCJ1c2VyX2lkX3BheXJvbGxfZ3JvdXAiOiI2MGJmM2M5NDBiYWMyMzk5NGY5N2FiYjciLCJ1c2VyY29zdGNvZGUiOiI2M2M2NjMxMzA5OTg5NDQyZThlYTJiNzYiLCJ1c2VycXJjb2RlIjoiIiwidXNlcmZpcmViYXNlX2lkIjoiIiwiY2FyZF90eXBlIjoiNjExMTZjNjdjZmZlOTkzZjAwYWRhOWU4IiwiYXBpX3NldHRpbmciOnsibG9jYXRpb24iOmZhbHNlLCJlbXBsb3llZSI6ZmFsc2UsImNvbG9yIjpmYWxzZSwib3duZXJzaGlwIjpmYWxzZSwibWFudWZhY3R1cmVyIjpmYWxzZSwiZnJlcXVlbmN5c2V0dGluZyI6ZmFsc2UsInN0YXR1c3NldHRpbmciOmZhbHNlLCJlcXVpcG1lbnRfdHlwZSI6ZmFsc2UsImNvc3Rjb2RlIjpmYWxzZSwicGFja2FnaW5nIjpmYWxzZSwid2VpZ2h0IjpmYWxzZSwicHJvamVjdCI6ZmFsc2UsImV4cGVuc2VzdHlwZXMiOmZhbHNlLCJpdGVtIjpmYWxzZSwiZXF1aXBtZW50IjpmYWxzZSwidmVuZG9yIjpmYWxzZSwiX2lkIjoiNjNjNjYzMTQwOTk4OTQ0MmU4ZWEyYjc4In0sInNpZ25hdHVyZSI6IiIsImFsbG93X2Zvcl9wcm9qZWN0cyI6dHJ1ZSwidXNlcl9sYW5ndWFnZXMiOlsiNjIxNzY0ZGJlYjJhNmFmNTBmZDM0NGEwIl0sInNob3dfaWRfY2FyZF9vbl9xcmNvZGVfc2NhbiI6dHJ1ZSwiY29tcGxpYW5jZV9vZmZpY2VyIjpmYWxzZSwibG9naW5fZnJvbSI6IkFsbCIsInJvbGVfbmFtZSI6IkFkbWluIiwic3VwZXJ2aXNvcl9uYW1lIjoiIiwibWFuYWdlcl9uYW1lIjoiIiwibG9jYXRpb25fbmFtZSI6IiIsInVzZXJqb2JfdHlwZV9uYW1lIjoiTGFib3IiLCJ1c2Vyam9iX3RpdGxlX25hbWUiOiJFbXBsb3llZSIsImRlcGFydG1lbnRfbmFtZSI6IkFjY291bnRpbmcgRGVwYXJ0bWVudCIsInVzZXJfcGF5cm9sbF9ncm91cF9uYW1lIjoiQWRtaW5pc3RyYXRpdmUiLCJjYXJkX3R5cGVfbmFtZSI6IkRpc2NvdmVyLTYxMTUxNiJ9LCJpYXQiOjE2ODI1MDg5MzZ9.rneo2IRVm5l5NF71OVvJeCH_XROwbx_gg-1PAtwk7eQ";
    const language = 'en';
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', language);

    // var url = configdata.apiurl;
    return this.http.post(apiRoute, userdata, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  handleError(error: any) {
    if (error.error instanceof Error) {
      const errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }
}
