import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LanguageComponent } from './language/language.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatBadgeModule,
    NgScrollbarModule,
    TranslateModule
  ],
  declarations: [
    LanguageComponent
  ],
  exports: [
    LanguageComponent,
    TranslateModule,
    MatTooltipModule
  ]
})
export class LayoutModule { }
