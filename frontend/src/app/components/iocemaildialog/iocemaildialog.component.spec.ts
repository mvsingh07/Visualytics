import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocemaildialogComponent } from './iocemaildialog.component';

describe('IocemaildialogComponent', () => {
  let component: IocemaildialogComponent;
  let fixture: ComponentFixture<IocemaildialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocemaildialogComponent]
    });
    fixture = TestBed.createComponent(IocemaildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
