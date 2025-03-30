import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpensearchComponent } from './opensearch.component';

describe('OpensearchComponent', () => {
  let component: OpensearchComponent;
  let fixture: ComponentFixture<OpensearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpensearchComponent]
    });
    fixture = TestBed.createComponent(OpensearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
