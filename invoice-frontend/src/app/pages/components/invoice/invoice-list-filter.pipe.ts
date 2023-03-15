import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'invoiceListFilter'
})
export class InvoiceListFilterPipe implements PipeTransform {

    transform(items: any[], searchTerm: string): any {
        if (!items || !searchTerm) {
            return items;
        }
        return items.filter(item =>
            item.invoice.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.p_o.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.vendor.vendor_name.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.packing_slip.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.receiving_slip.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.status.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
    }
}

@Pipe({
    name: 'invoiceListFilterStatus'
})
export class InvoiceListFilterStatus implements PipeTransform {

    transform(items: any[], searchTerm: string): any {
        if (!items || !searchTerm) {
            return items;
        }
        if (searchTerm === 'All') {
            return items;
        }
        return items.filter(item => item.status.toString().toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
    }
}

