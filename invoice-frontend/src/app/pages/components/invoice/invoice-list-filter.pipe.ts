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

    transform(items: any[], searchTerm: string[]): any {
        console.log("searchTerm", searchTerm);
        if (searchTerm) {
            var found = searchTerm.includes('All');
            if (found) {
                return items;
            } else {
                var allArray = ['All'];
                if (!items || !searchTerm) {
                    return items;
                }
                if (JSON.stringify(searchTerm) === JSON.stringify(allArray)) {
                    return items;
                }
                console.log("er4eredfhre", items.filter(item => searchTerm.includes(item.status)));

                return items.filter(item => searchTerm.includes(item.status));
            }
        } else {
            return items;
        }
    }
}

