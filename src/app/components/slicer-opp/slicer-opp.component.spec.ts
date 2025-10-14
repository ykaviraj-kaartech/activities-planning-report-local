import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlicerOppComponent } from './slicer-opp.component';

describe('SlicerOppComponent', () => {
  let component: SlicerOppComponent;
  let fixture: ComponentFixture<SlicerOppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlicerOppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlicerOppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
