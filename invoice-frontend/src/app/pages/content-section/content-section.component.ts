import { Component, OnInit, Input, HostListener } from '@angular/core';
import { LayoutService } from '../../shared/services/layout.service';

@Component({
  selector: 'app-content-section',
  templateUrl: './content-section.component.html',
  styleUrls: ['./content-section.component.scss']
})

export class ContentSectionComponent implements OnInit {
  screenTitle = 'Page Title';
  contentHeight: any;
  @Input() navLayout: any;
  @Input() defaultNavbar: any;
  @Input() toggleNavbar: any;
  @Input() toggleStatus: any;
  @Input() navbarEffect: any;
  @Input() deviceType: any;
  @Input() headerColorTheme: any;
  @Input() navbarColorTheme: any;
  @Input() activeNavColorTheme: any;

  selectlanguage: any;
  constructor(private layoutService: LayoutService) { }

  ngOnInit() {
    this.layoutService.contentHeightCast.subscribe(setCtHeight => this.contentHeight = setCtHeight);
  }

  @HostListener('window:resize', ['$event'])
  onResizeHeight(event: any) {
    this.contentHeight = window.innerHeight - this.layoutService.headerHeight;
  }
}
