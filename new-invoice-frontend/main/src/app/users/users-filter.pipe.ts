import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'empListFilter' })
export class EmpListFilterPipe implements PipeTransform {

     transform(items: any[], searchTerm: string): any {
          if (!items || !searchTerm) {
               return items;
          }

          return items.filter(item => item.userfullname.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || item.useremail.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
     }
}
