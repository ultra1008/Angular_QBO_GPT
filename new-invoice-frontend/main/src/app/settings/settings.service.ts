import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import {
  ClassNameTable,
  CostCodeTable,
  DepartmentTable,
  DocumentTable,
  DocumentsTable,
  JobNameTable,
  JobTitleTable,
  JobTypeTable,
  LanguageTable,
  MailboxTable,
  RelationshipTable,
  Settings,
  TaxrateTable,
  TermsTable,
  UsageTable,
  VendorTypeTable,
  usageTable,
} from './settings.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class SettingsService extends UnsubscribeOnDestroyAdapter {
  // private readonly API_URL = 'assets/data/advanceTable.json';
  // dataChange: BehaviorSubject<Settings[]> = new BehaviorSubject<Settings[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: any;
  isTblLoading = true;
  dataChange: BehaviorSubject<MailboxTable[]> = new BehaviorSubject<
    MailboxTable[]
  >([]);

  dataCostCodeChange: BehaviorSubject<CostCodeTable[]> = new BehaviorSubject<
    CostCodeTable[]
  >([]);

  dataUsageChange: BehaviorSubject<UsageTable[]> = new BehaviorSubject<
    UsageTable[]
  >([]);

  dataDocumentTypeChange: BehaviorSubject<DocumentTable[]> =
    new BehaviorSubject<DocumentTable[]>([]);

  dataDepartmentChange: BehaviorSubject<DepartmentTable[]> =
    new BehaviorSubject<DepartmentTable[]>([]);

  dataJobTitleChange: BehaviorSubject<JobTitleTable[]> = new BehaviorSubject<
    JobTitleTable[]
  >([]);

  dataJobTypeChange: BehaviorSubject<JobTypeTable[]> = new BehaviorSubject<
    JobTypeTable[]
  >([]);

  dataRelationShipChange: BehaviorSubject<RelationshipTable[]> =
    new BehaviorSubject<RelationshipTable[]>([]);

  dataLanguageChange: BehaviorSubject<LanguageTable[]> = new BehaviorSubject<
    LanguageTable[]
  >([]);

  dataTermsChange: BehaviorSubject<TermsTable[]> = new BehaviorSubject<
    TermsTable[]
  >([]);

  dataTaxrateChange: BehaviorSubject<TaxrateTable[]> = new BehaviorSubject<
    TaxrateTable[]
  >([]);

  dataDocumentsChange: BehaviorSubject<DocumentsTable[]> = new BehaviorSubject<
    DocumentsTable[]
  >([]);

  dataVendortypeChange: BehaviorSubject<VendorTypeTable[]> =
    new BehaviorSubject<VendorTypeTable[]>([]);

  dataJobnameChange: BehaviorSubject<JobNameTable[]> = new BehaviorSubject<
    JobNameTable[]
  >([]);

  dataclassnameChange: BehaviorSubject<ClassNameTable[]> = new BehaviorSubject<
    ClassNameTable[]
  >([]);

  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): MailboxTable[] {
    return this.dataChange.value;
  }

  get datacostcode(): CostCodeTable[] {
    return this.dataCostCodeChange.value;
  }

  get datausage(): UsageTable[] {
    return this.dataUsageChange.value;
  }

  get datadocumenttype(): DocumentTable[] {
    return this.dataDocumentTypeChange.value;
  }

  get datadepartment(): DepartmentTable[] {
    return this.dataDepartmentChange.value;
  }

  get datajobtitle(): JobTitleTable[] {
    return this.dataJobTitleChange.value;
  }

  get datajobtype(): JobTypeTable[] {
    return this.dataJobTypeChange.value;
  }

  get dataRelationship(): RelationshipTable[] {
    return this.dataRelationShipChange.value;
  }

  get dataLanguage(): LanguageTable[] {
    return this.dataLanguageChange.value;
  }

  get dataTerms(): TermsTable[] {
    return this.dataTermsChange.value;
  }

  get dataTaxrate(): TaxrateTable[] {
    return this.dataTaxrateChange.value;
  }

  get dataDocuments(): DocumentsTable[] {
    return this.dataDocumentsChange.value;
  }

  get dataVendortype(): VendorTypeTable[] {
    return this.dataVendortypeChange.value;
  }

  get dataJobname(): JobNameTable[] {
    return this.dataJobnameChange.value;
  }

  get dataClassname(): ClassNameTable[] {
    return this.dataclassnameChange.value;
  }
  async getCompanyType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  // Datatable API
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */

  async getAllMailboxTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.MAILBOX_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getAllDocumentTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataDocumentTypeChange.next(data);
  }

  async getAllDepartmentTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataDepartmentChange.next(data);
  }

  async getAlljobtitleTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobTitleChange.next(data);
  }

  async getAlljobtypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobTypeChange.next(data);
  }

  async getAllRelationshipTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataRelationShipChange.next(data);
  }

  async getAllLanguageTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataLanguageChange.next(data);
  }

  async getAllTermsTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.TERMS_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataTermsChange.next(data);
  }

  async getAllTaxrateTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.TEXT_RATE_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataTaxrateChange.next(data);
  }

  async getAllDocumentsTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.DOCUMENTS_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataDocumentsChange.next(data);
  }

  async getAllVendorTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.VENDOR_TYPE_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataVendortypeChange.next(data);
  }

  async getAllJobNameTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.JOB_NAME_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobnameChange.next(data);
  }

  async getAllClassNameTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.CLASS_NAME_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataclassnameChange.next(data);
  }

  async getAllCostCodeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.COSTCODE_DATA_TABLE, {
        is_delete: is_delete,
        module: 'Invoice',
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataCostCodeChange.next(data);
  }

  async getAllUsageTable(): Promise<void> {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USAGE_DATA_TABLE)
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataUsageChange.next(data);
  }

  async getCompanyNigp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_NIGP)
      .toPromise();
    return data;
  }

  async getCompanySize() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_SIZE)
      .toPromise();
    return data;
  }

  async getCompanyInfo() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_INFO)
      .toPromise();
    return data;
  }

  async getCompanysmtp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP)
      .toPromise();
    return data;
  }

  async VerifySmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.VERIFY_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async SaveSmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.SAVE_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async saveCompanyInfo(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.V1 + httproutes.SAVE_COMPNAY_INFO,
        requestObject
      )
      .toPromise();
    return data;
  }

  async AddMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getOneMailBox(id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_ONE_MAILBOX, {
        _id: id,
      })
      .toPromise();
    return data;
  }

  async deleteMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.DELETE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }

  async deleteCostCode(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.DELETE_COST_CODE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getDocumentType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_GET)
      .toPromise();
    return data;
  }

  async getDepartment() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_GET)
      .toPromise();
    return data;
  }

  async getJobTitle() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_ALL)
      .toPromise();
    return data;
  }

  async getJobType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_ALL)
      .toPromise();
    return data;
  }

  async getRelationship() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_ALL)
      .toPromise();
    return data;
  }

  async getLanguage() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_GET)
      .toPromise();
    return data;
  }

  async getTerms() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_TERMS)
      .toPromise();
    return data;
  }

  async getTaxRate() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_TEXT_RATE
      )
      .toPromise();
    return data;
  }

  async getDocuments() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_DOCUMENT
      )
      .toPromise();
    return data;
  }

  async getVendorType() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_VENDOR_TYPE
      )
      .toPromise();
    return data;
  }

  async getJobName() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_JOB_NAME
      )
      .toPromise();
    return data;
  }

  async updateSetting(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.INVOICE_OTHER_SETTING_UPDATE_ALERTS,
        requestObject
      )
      .toPromise();
    return data;
  }

  async DeleteDocumentType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteDepartments(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobTitle(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteRelationship(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteLanguage(_id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_DELETE, {
        _id: _id,
      })
      .toPromise();
    return data;
  }

  async DeleteTerms(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_TERMS,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteTaxrate(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_TEXT_RATE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteDocuments(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_DOCUMENT,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteVendorType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_DELETE_VENDOR_TYPE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobName(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_JOB_NAME,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteClassName(_id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.DELETE_CLASS_NAME, {
        _id: _id,
      })
      .toPromise();
    return data;
  }

  addAdvanceTable(Document: Settings): void {
    this.dialogData = Document;
  }

  async saveDocumentType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveDepartment(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobTitle(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveRelatioship(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveLanguage(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveTerms(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_TERMS,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveTaxrate(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_TEXT_RATE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobName(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_JOB_NAME,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveClassName(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_CLASS_NAME,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveDocument(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_DOCUMENT,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveVendorType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_SAVE_VENDOR_TYPE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveCostCode(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.COST_CODE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getusage() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USAGE_DATA_TABLE)
      .toPromise();
    return data;
  }
}
