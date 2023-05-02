import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  hideRequiredControl = new UntypedFormControl(false);
  breadscrums = [
    {
      title: 'Chat',
      items: ['Apps'],
      active: 'Chat',
    },
  ];
  constructor() {
    //constructor
  }
}
