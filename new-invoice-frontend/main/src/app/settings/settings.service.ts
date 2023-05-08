import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import { Settings } from './settings.model';

@Injectable()
export class SettingsService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  dataChange: BehaviorSubject<Settings[]> = new BehaviorSubject<Settings[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Settings;
  constructor(private httpCall: HttpCall) {
    super();
  }

  async getCompanyType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  async getCompanyNigp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  async getCompanySize() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  async getCompanyActiveSince() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_ACTIVE_SINEC)
      .toPromise();
    return data;
  }
}
