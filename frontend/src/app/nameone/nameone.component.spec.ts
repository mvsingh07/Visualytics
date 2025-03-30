import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameoneComponent } from './nameone.component';

describe('NameoneComponent', () => {
  let component: NameoneComponent;
  let fixture: ComponentFixture<NameoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NameoneComponent]
    });
    fixture = TestBed.createComponent(NameoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
