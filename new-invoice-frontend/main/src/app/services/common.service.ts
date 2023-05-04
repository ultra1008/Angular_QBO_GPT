import { Injectable } from '@angular/core';
import { HttpCall } from './httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends UnsubscribeOnDestroyAdapter {

  constructor (private httpCall: HttpCall) {
    super();
  }

  async saveAttachment(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, requestObject).toPromise();
    return data;
  }
}
