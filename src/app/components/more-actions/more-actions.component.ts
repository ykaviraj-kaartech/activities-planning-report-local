import { Component, Input, ViewChild, HostListener, ElementRef, TemplateRef, ViewContainerRef, EventEmitter, Output } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
import { TabbedComponentComponent } from '../tabbed-component/tabbed-component.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import sweetAlert from 'sweetalert2';

@Component({
  selector: 'app-more-actions',
  templateUrl: './more-actions.component.html',
  styleUrls: ['./more-actions.component.scss']
})
export class MoreActionsComponent {
  @ViewChild('menuTemplate', { static: false }) menuTemplate!: TemplateRef<any>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @Input() column: any | undefined;
  @Input() masterData: any;
  @Output() actionClickedForEdit: EventEmitter<any> = new EventEmitter();
  @Output() actionClickedForCreate: EventEmitter<any> = new EventEmitter();
  @Output() actionClickedForDelete: EventEmitter<any> = new EventEmitter();
  private overlayRef: OverlayRef | undefined;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef,
    private activitiesPlanningReportService: ActivitiesPlanningReportService,
    public dialog: MatDialog,
    private snackBar : MatSnackBar,
  ) {
  }

  openMenuDropdown(event: MouseEvent) {
    event.preventDefault(); // Prevent any default behavior
    event.stopPropagation(); // Prevent immediate closing

    // Close existing menu if open
    this.closeMenu();

    // Define position strategy for overlay
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
      .withPositions([
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
      ])
      .withViewportMargin(10);

    // Create overlay reference
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    // Close menu when clicking outside
    this.overlayRef.backdropClick().subscribe(() => this.closeMenu());

    // Attach menu template to overlay
    const portal = new TemplatePortal(this.menuTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  closeMenu() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = undefined;
    }
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event) {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.menuTrigger.closeMenu();
  //   }
  // }

  onAction() {
    this.menuTrigger.closeMenu();
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event) {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.closeMenu();
  //   }
  // }

  onEdit() {
    if (this.column.sales_activity_id == 4) {
        this.activitiesPlanningReportService.taskFormDetails(this.column.id).then((res: any) => {
          const dialogRef = this.dialog.open(TabbedComponentComponent, {
            height: '87%',
            width: '45rem',
            maxHeight: 'fit-content',
            data: {
              tabbed_content_type: 4,
              customer_id: this.column.application_reference_id,
              mode: "Edit",
              application_reference_id: this.column.application_reference_id,
              application_id: 36,
              formData: res[0],
              masterData: this.masterData
            }
          });
          dialogRef.afterClosed().subscribe(async result => {
            if (result?.text == "update required") {
              this.actionClickedForEdit.emit({ 
                activity: this.column,
                newData: result?.newData
               });  
            }
          })
        });
    }
  }

  onDelete() {
    if(this.column?.activity_status_id == 3){
      this.showSnackBar("Completed Activites cannot be deleted", 2000);
    }
    else{
      this.confirmSweetAlert('Do you want to delete the activity ?').then(
        (deleteConfirm) => {
          if (deleteConfirm.value) {
            this.activitiesPlanningReportService.deleteActivity(this.column?.id).subscribe((res: any) => {
              this.showSnackBar("Activity deleted", 2000);
              this.actionClickedForDelete.emit({ activity: this.column });
            });
          }
        }
      );
    }
    // this.closeMenu();
  }
  onCreate(){
    const dialogRef = this.dialog.open(TabbedComponentComponent, {
      height: '87%',
      width: '45rem',
      maxHeight: 'fit-content',
      data:{
        tabbed_content_type: 4,
        customer_id: this.column?.in_account,
        mode:"Create",
        application_reference_id: this.column?.id,
        application_id: 36,
        masterData: this.masterData
      }
    });
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result?.text == "update required") {
        this.actionClickedForCreate.emit({ 
          activity: this.column,
          newData: result?.newData
         });   
      }
    })
  }

  showSnackBar(message: any, duration: any){
    this.snackBar.open(message, "Dismiss", { duration: duration });
  }

  confirmSweetAlert(title: any) {
    return sweetAlert.fire({
      title: title,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, don't delete it",
    });
  }

}
