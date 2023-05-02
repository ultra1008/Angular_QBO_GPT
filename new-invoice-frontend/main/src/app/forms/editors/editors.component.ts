import { Component } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-editors',
  templateUrl: './editors.component.html',
  styleUrls: ['./editors.component.scss'],
})
export class EditorsComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public Editor: any = ClassicEditor;
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  breadscrums = [
    {
      title: 'Editors',
      items: ['Forms'],
      active: 'Editors',
    },
  ];

  constructor() {
    //constructor
  }
}
