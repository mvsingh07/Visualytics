import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IocComponent } from './ioc.component';

describe('IocComponent', () => {
  let component: IocComponent;
  let fixture: ComponentFixture<IocComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IocComponent]
    });
    fixture = TestBed.createComponent(IocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
