import { Component, OnInit } from '@angular/core';
import { icon } from 'src/app/consts';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  constructor() { }

  ngOnInit(): void {
  }

}
