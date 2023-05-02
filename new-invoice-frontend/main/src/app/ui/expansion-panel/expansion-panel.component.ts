import { Component } from '@angular/core';
@Component({
  selector: 'app-expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelComponent {
  breadscrums = [
    {
      title: 'Expansion',
      items: ['UI'],
      active: 'Expansion',
    },
  ];

  panelOpenState = false;
  step = 0;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  constructor() {
    //constructor
  }
}
