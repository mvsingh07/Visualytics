import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocipdialogComponent } from './iocipdialog.component';

describe('IocipdialogComponent', () => {
  let component: IocipdialogComponent;
  let fixture: ComponentFixture<IocipdialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocipdialogComponent]
    });
    fixture = TestBed.createComponent(IocipdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
