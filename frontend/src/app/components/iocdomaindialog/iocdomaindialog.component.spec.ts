import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocdomaindialogComponent } from './iocdomaindialog.component';

describe('IocdomaindialogComponent', () => {
  let component: IocdomaindialogComponent;
  let fixture: ComponentFixture<IocdomaindialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocdomaindialogComponent]
    });
    fixture = TestBed.createComponent(IocdomaindialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
