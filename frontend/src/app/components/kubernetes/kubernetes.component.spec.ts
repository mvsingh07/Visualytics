import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesComponent } from './kubernetes.component';

describe('KubernetesComponent', () => {
  let component: KubernetesComponent;
  let fixture: ComponentFixture<KubernetesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KubernetesComponent]
    });
    fixture = TestBed.createComponent(KubernetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
