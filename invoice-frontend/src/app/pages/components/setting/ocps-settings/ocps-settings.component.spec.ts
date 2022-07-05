import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcpsSettingsComponent } from './ocps-settings.component';

describe('OcpsSettingsComponent', () => {
  let component: OcpsSettingsComponent;
  let fixture: ComponentFixture<OcpsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OcpsSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcpsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
