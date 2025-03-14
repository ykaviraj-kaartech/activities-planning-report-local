import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmActivityAssociationComponent } from './crm-activity-association.component';
 
describe('CrmActivityAssociationComponent', () => {
  let component: CrmActivityAssociationComponent;
  let fixture: ComponentFixture<CrmActivityAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmActivityAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmActivityAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
