import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import { DocumentTable } from './documents.model';

@Injectable()
export class DocumentsService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  dataChange: BehaviorSubject<DocumentTable[]> = new BehaviorSubject<DocumentTable[]>([]);

  constructor (private httpCall: HttpCall) {
    super();
  }

  get data(): DocumentTable[] {
    return this.dataChange.value;
  }

  async getDocumentTable(apiUrl: string): Promise<void> {
    const data = await this.httpCall.httpGetCall(apiUrl).toPromise();
    this.isTblLoading = false;
    this.dataChange.next(data);
  }
}
