import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailProviderComponent } from './email-provider.component';

describe('EmailProviderComponent', () => {
  let component: EmailProviderComponent;
  let fixture: ComponentFixture<EmailProviderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailProviderComponent]
    });
    fixture = TestBed.createComponent(EmailProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
