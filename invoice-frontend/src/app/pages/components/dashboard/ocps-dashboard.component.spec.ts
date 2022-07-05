import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcpsDashboardComponent } from './ocps-dashboard.component';

describe('OcpsDashboardComponent', () => {
  let component: OcpsDashboardComponent;
  let fixture: ComponentFixture<OcpsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OcpsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcpsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
