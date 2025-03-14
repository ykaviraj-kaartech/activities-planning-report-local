import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabbedComponentComponent } from './tabbed-component.component';
 
describe('TabbedComponentComponent', () => {
  let component: TabbedComponentComponent;
  let fixture: ComponentFixture<TabbedComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabbedComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbedComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
