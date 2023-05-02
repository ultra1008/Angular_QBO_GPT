import { Component } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss'],
})
export class ComposeComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public Editor: any = ClassicEditor;

  breadscrums = [
    {
      title: 'Compose',
      items: ['Email'],
      active: 'Compose',
    },
  ];
  constructor() {
    //constructor
  }
}
