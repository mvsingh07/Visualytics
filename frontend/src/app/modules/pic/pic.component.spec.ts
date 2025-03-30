import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicComponent } from './pic.component';

describe('PicComponent', () => {
  let component: PicComponent;
  let fixture: ComponentFixture<PicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PicComponent]
    });
    fixture = TestBed.createComponent(PicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
