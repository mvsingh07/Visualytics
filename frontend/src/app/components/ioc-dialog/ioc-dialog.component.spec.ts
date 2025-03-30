import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocDialogComponent } from './ioc-dialog.component';

describe('IocDialogComponent', () => {
  let component: IocDialogComponent;
  let fixture: ComponentFixture<IocDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocDialogComponent]
    });
    fixture = TestBed.createComponent(IocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
