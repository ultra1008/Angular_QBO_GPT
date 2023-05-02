import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  tabs = ['First', 'Second', 'Third'];
  selected = new UntypedFormControl(0);

  breadscrums = [
    {
      title: 'Tabs',
      items: ['UI'],
      active: 'Tabs',
    },
  ];

  addTab(selectAfterAdding: boolean) {
    this.tabs.push('New');
    if (selectAfterAdding) {
      this.selected.setValue(this.tabs.length - 1);
    }
  }
  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}
