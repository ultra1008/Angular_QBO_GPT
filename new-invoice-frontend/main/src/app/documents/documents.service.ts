import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import { DocumentTable } from './documents.model';

@Injectable()
export class DocumentsService extends UnsubscribeOnDestroyAdapter {
  dialogData!: any;
  isTblLoading = true;
  dataChange: BehaviorSubject<DocumentTable[]> = new BehaviorSubject<
    DocumentTable[]
  >([]);
  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): DocumentTable[] {
    return this.dataChange.value;
  }
  async getDocumentTable(is_delete: number, tab_Array: string): Promise<void> {


    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.DOCUMENTS_DATATABLE, {
        is_delete: is_delete,
        document_type: tab_Array


      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
    console.log("data", data);
  }


}
