import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDocumentsComponent } from './view-documents.component';

describe('ViewDocumentsComponent', () => {
  let component: ViewDocumentsComponent;
  let fixture: ComponentFixture<ViewDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewDocumentsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ViewDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
