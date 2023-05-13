export class DocumentTable {
     document_type: string;
     po_no: string;
     invoice_no: string;
     vendor_name: number;
     updated_by: string;

     constructor(DocumentTable: DocumentTable) {
          {
               this.document_type = DocumentTable.document_type;
               this.po_no = DocumentTable.po_no;
               this.invoice_no = DocumentTable.invoice_no;
               this.vendor_name = DocumentTable.vendor_name;
               this.updated_by = DocumentTable.updated_by;

          }
     }
}
