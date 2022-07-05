import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsOtherComponent } from './settings-other.component';

describe('SettingsOtherComponent', () => {
  let component: SettingsOtherComponent;
  let fixture: ComponentFixture<SettingsOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsOtherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
