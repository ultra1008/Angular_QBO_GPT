import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsitepluginComponent } from './websiteplugin.component';

describe('WebsitepluginComponent', () => {
  let component: WebsitepluginComponent;
  let fixture: ComponentFixture<WebsitepluginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebsitepluginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsitepluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
