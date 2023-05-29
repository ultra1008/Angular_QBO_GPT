import { formatDate } from '@angular/common';

export class Settings {
  _id: string;
  userfullname: string;
  useremail: string;
  role_name: string;
  userphone: string;
  userjob_title_name: string;
  department_name: string;
  userstatus: number;
  constructor (response: Settings) {
    {
      this._id = response._id;
      this.userfullname = response.userfullname;
      this.useremail = response.useremail;
      this.role_name = response.role_name;
      this.userphone = response.userphone;
      this.userjob_title_name = response.userjob_title_name;
      this.department_name = response.department_name;
      this.userstatus = response.userstatus;
    }
  }
}
export class CostCodeTable {
  _id: string;
  description: string;
  value: string;
  division: string;

  constructor (costcodeTable: CostCodeTable) {
    {
      this._id = costcodeTable._id;
      this.description = costcodeTable.description;
      this.value = costcodeTable.value;
      this.division = costcodeTable.division;
    }
  }
}

export class MailboxTable {
  _id: string;
  email: string;
  imap: string;
  port: number;
  time: string;

  constructor (mailboxTable: MailboxTable) {
    {
      this._id = mailboxTable._id;
      this.email = mailboxTable.email;
      this.imap = mailboxTable.imap;
      this.port = mailboxTable.port;
      this.time = mailboxTable.time;
    }
  }
}

export class UsageTable {
  _id: string;
  year!: number;
  month!: number;
  month_name!: string;
  po_expense!: number;
  po_forms!: number;
  packing_slip_expense!: number;
  packing_slip_forms!: number;
  receiving_slip_expense!: number;
  receiving_slip_forms!: number;
  quote_expense!: number;
  quote_forms!: number;
  invoice_expense!: number;
  invoice_forms!: number;
  unknown_expense!: number;
  unknown_forms!: number;

  constructor (usageTable: UsageTable) {
    {
      this._id = usageTable._id;
      this.year = usageTable.year;
      this.month = usageTable.month;
      this.month_name = usageTable.month_name;
      this.po_expense = usageTable.po_expense;
      this.po_forms = usageTable.po_forms;
      this.packing_slip_expense = usageTable.packing_slip_expense;
      this.packing_slip_forms = usageTable.packing_slip_forms;
      this.receiving_slip_expense = usageTable.receiving_slip_expense;
      this.receiving_slip_forms = usageTable.receiving_slip_forms;
      this.quote_expense = usageTable.quote_expense;
      this.quote_forms = usageTable.quote_forms;
      this.invoice_expense = usageTable.invoice_expense;
      this.invoice_forms = usageTable.invoice_forms;
      this.unknown_expense = usageTable.unknown_expense;
      this.unknown_forms = usageTable.unknown_forms;
    }
  }
}

export class usageTable {
  _id: string;
  email: string;
  imap: string;
  port: number;
  time: string;

  constructor (usageTable: usageTable) {
    {
      this._id = usageTable._id;
      this.email = usageTable.email;
      this.imap = usageTable.imap;
      this.port = usageTable.port;
      this.time = usageTable.time;
    }
  }
}

export class Element {
  name!: string;
  position!: number;
  weight!: number;
  symbol!: string;
  constructor (Element: Element) {
    {
      this.name = Element.name;
      this.position = Element.position;
      this.weight = Element.weight;
      this.symbol = Element.symbol;
    }
  }
}

export class DocumentTypeTable {
  _id: string;
  is_expiration!: boolean;
  document_type_name!: string;

  constructor (DocumentTable: DocumentTypeTable) {
    {
      this._id = DocumentTable._id;
      this.is_expiration = DocumentTable.is_expiration;
      this.document_type_name = DocumentTable.document_type_name;
    }
  }
}

export class DepartmentTable {
  _id: string;
  department_name!: string;

  constructor (DepartmentTable: DepartmentTable) {
    {
      this._id = DepartmentTable._id;
      this.department_name = DepartmentTable.department_name;
    }
  }
}

export class JobTitleTable {
  _id: string;
  job_title_name!: string;

  constructor (JobTitleTable: JobTitleTable) {
    {
      this._id = JobTitleTable._id;
      this.job_title_name = JobTitleTable.job_title_name;
    }
  }
}

export class JobTypeTable {
  _id: string;
  job_type_name!: string;

  constructor (JobTypeTable: JobTypeTable) {
    {
      this._id = JobTypeTable._id;
      this.job_type_name = JobTypeTable.job_type_name;
    }
  }
}

export class RelationshipTable {
  _id: string;
  relationship_name!: string;

  constructor (RelationshipTable: RelationshipTable) {
    {
      this._id = RelationshipTable._id;
      this.relationship_name = RelationshipTable.relationship_name;
    }
  }
}

export class LanguageTable {
  _id: string;
  name!: string;

  constructor (LanguageTable: LanguageTable) {
    {
      this._id = LanguageTable._id;
      this.name = LanguageTable.name;
    }
  }
}

export class TermsTable {
  _id: string;
  name!: string;
  due_days!: number;
  is_discount!: boolean;
  discount!: number;
  is_quickbooks: string;

  constructor (TermsTable: TermsTable) {
    {
      this._id = TermsTable._id;
      this.name = TermsTable.name;
      this.due_days = TermsTable.due_days;
      this.is_discount = TermsTable.is_discount;
      this.discount = TermsTable.discount;
      this.is_quickbooks = TermsTable.is_quickbooks;
    }
  }
}

export class TaxrateTable {
  _id: string;
  name!: string;

  constructor (TaxrateTable: TaxrateTable) {
    {
      this._id = TaxrateTable._id;
      this.name = TaxrateTable.name;
    }
  }
}

export class DocumentsTable {
  _id: string;
  is_expiration!: boolean;
  name!: string;

  constructor (DocumentsTable: DocumentsTable) {
    {
      this._id = DocumentsTable._id;
      this.name = DocumentsTable.name;
      this.is_expiration = DocumentsTable.is_expiration;
    }
  }
}

export class VendorTypeTable {
  _id: string;
  name!: string;

  constructor (VendorTypeTable: VendorTypeTable) {
    {
      this._id = VendorTypeTable._id;
      this.name = VendorTypeTable.name;
    }
  }
}

export class JobNameTable {
  _id: string;
  name!: string;
  email_contact!: string;

  constructor (JobNameTable: JobNameTable) {
    {
      this._id = JobNameTable._id;
      this.name = JobNameTable.name;
      this.email_contact = JobNameTable.email_contact;
    }
  }
}

export class ClassNameTable {
  _id: string;
  name!: string;
  number!: string;
  description!: string;
  is_quickbooks!: string;
  status!: number;

  constructor (ClassNameTable: ClassNameTable) {
    {
      this._id = ClassNameTable._id;
      this.name = ClassNameTable.name;
      this.number = ClassNameTable.number;
      this.description = ClassNameTable.description;
      this.is_quickbooks = ClassNameTable.is_quickbooks;
      this.status = ClassNameTable.status;
    }
  }
}
