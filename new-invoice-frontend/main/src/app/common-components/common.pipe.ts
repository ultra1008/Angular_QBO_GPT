import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'historyDateTimePipe'
})
export class HistoryDateTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
