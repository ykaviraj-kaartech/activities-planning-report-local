import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningLandingPageComponent } from './planning-landing-page.component';

describe('PlanningLandingPageComponent', () => {
  let component: PlanningLandingPageComponent;
  let fixture: ComponentFixture<PlanningLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanningLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
