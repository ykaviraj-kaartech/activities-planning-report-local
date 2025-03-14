import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreActionsComponent } from './more-actions.component';

describe('MoreActionsComponent', () => {
  let component: MoreActionsComponent;
  let fixture: ComponentFixture<MoreActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoreActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
