import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocurldialogComponent } from './iocurldialog.component';

describe('IocurldialogComponent', () => {
  let component: IocurldialogComponent;
  let fixture: ComponentFixture<IocurldialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocurldialogComponent]
    });
    fixture = TestBed.createComponent(IocurldialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
