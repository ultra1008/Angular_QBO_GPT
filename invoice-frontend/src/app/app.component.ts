import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from './consts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Rovuk Invoicing';
  constructor(public translate: TranslateService, private metaService: Meta, private titleService: Title
  ) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;

    localStorage.setItem(localstorageconstants.LANGUAGE, locallanguage);
    this.translate.use(locallanguage);
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.metaService.addTags([
      { name: 'Rovuk Invoicing', content: 'Rovuk Invoicing' },
      { name: 'a construction application', content: 'Rovuk Invoicing' },
    ]);

  }
}
