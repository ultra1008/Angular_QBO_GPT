import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInformationComponent } from './employee-information.component';

describe('EmployeeInformationComponent', () => {
  let component: EmployeeInformationComponent;
  let fixture: ComponentFixture<EmployeeInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
