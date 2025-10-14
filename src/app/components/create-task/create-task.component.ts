import { Component, OnInit, Output, EventEmitter, Input, OnChanges, Inject, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router'
import * as _ from 'underscore'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { AssociationConfig } from '../crm-activity-association/models/association-config.model';
import { ActivityAssociation } from '../crm-activity-association/models/activity-association.model';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit, OnChanges {
  quote: any
  @Input() mode: any;
  @Input() activityId: any;
  @Input() application_reference_id: any;
  @Input() application_id: any;
  @Input() application_name: any;
  @Input() goverance_id: any;
  @Input() data: any;
  @Input() selected: boolean = false;
  @Input() contactList: any;
  @Input() createdDate: any;
  @Input() masterData: any;

  @Output() edited_or_submitted = new EventEmitter();
  contactGovernanceTypes: any;
  phase: any;
  taskForm: any;
  currentUser: any;
  todaysOrTommorow = [{
    startDate: null,
    endDate: null
  }]
  displayPhase: any;
  activityAssociation!: ActivityAssociation
  buttonClicked: boolean = false;

  accountInfo: any;
  updatedActivityCount: number | undefined;
  assocConfig: any;
  // masterOpportunitiesList: any;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<CreateTaskComponent>,
    private activitiesPlanningReportService: ActivitiesPlanningReportService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: ['', Validators.required],
      // createdBy: ['', Validators.required],
      startDate: [null as string | Date | null, Validators.required],
      endDate: [null as string | Date | null, Validators.required],
      remindMe: [''],
      applicationName: [''],
      application_reference_id: [''],
      applicationId: [''],
      governanceType: [null as string | number | null],
      phase: [null as string | number | null],
    });
  }

  ngOnChanges() {

  }

  updateFormWithTaskDetails() {
    if (this.mode == 'Edit' || this.mode == 'Duplicate') {
      let res = this.data ? this.data : null;
      if (res) {
        this.activityId = res.id
        this.activityAssociation = res.associations != null && res.associations != undefined ? res.associations : {
          accounts: this.application_id == 33 ? [this.application_reference_id] : [],
          contacts: this.application_id == 34 ? [this.application_reference_id] : [],
          leads: this.application_id == 35 ? [this.application_reference_id] : [],
          opportunities: this.application_id == 36 ? [this.application_reference_id] : [],
          default: {
            account: this.application_id == 33 ? this.application_reference_id : null,
            contact: this.application_id == 34 ? this.application_reference_id : null,
            lead: this.application_id == 35 ? this.application_reference_id : null,
            opportunity: this.application_id == 36 ? this.application_reference_id : null
          }
        }
        this.taskForm.patchValue({
          title: res['title'],
          description: res['description'],
          assignedTo: res['assigned_to'],
          // createdBy: res['created_by'],
          startDate: res['planned_start_date'] ? res['planned_start_date'] : res['start_date'],
          endDate: res['task_due_date'] ? res['task_due_date'] : res['end_date'],
          remindMe: res['reminder'],
          governanceType: res['governance_activity_id'],
          application_reference_id: this.application_reference_id,
          phase: res['phase_id'] ? parseInt(res['phase_id']) : null
        })

      }
      else
        console.log('waiting for data changes')
    }
    else {
      this.taskForm.reset()
    }
  }

  updateAssoc(assocData: ActivityAssociation) {
    this.activityAssociation = assocData
  }

  ngOnInit() {    

    this.currentUser = this.activitiesPlanningReportService.getProfile()?.profile;

    this.displayPhase = this.activitiesPlanningReportService.getLabelForOpportunity(36, 16).subscribe({
      next: (label) => {
        if (label == ""){
          return "Show Phases Activity";
        }
        else{
          return label;
        }
      },
      error: (error) => {
        return null;
      }
    });

    this.application_reference_id = parseInt(this.application_reference_id)
    if (this.mode == "Edit") {
      this.updateFormWithTaskDetails();
    }
    if (this.mode == "Create") {
      this.activityAssociation = {
        accounts: this.application_id == 33 ? [this.application_reference_id] : [],
        contacts: this.application_id == 34 ? [this.application_reference_id] : [],
        leads: this.application_id == 35 ? [this.application_reference_id] : [],
        opportunities: this.application_id == 36 ? [this.application_reference_id] : [],
        default: {
          account: this.application_id == 33 ? this.application_reference_id : null,
          contact: this.application_id == 34 ? this.application_reference_id : null,
          lead: this.application_id == 35 ? this.application_reference_id : null,
          opportunity: this.application_id == 36 ? this.application_reference_id : null
        }
      }
      this.taskForm.patchValue({
        title: "Task added by " + this.currentUser.name + " on " + moment().format("DD-MMM-YYYY, h:mm a"),
        applicationName: this.application_name,
        application_reference_id: this.application_reference_id,
        applicationId: this.application_id,
        governanceType: 48,
        startDate: this.createdDate? this.createdDate : moment().format(),
        endDate: moment().add(1, 'week').format(),
        phase: 47,
        // createdBy: this.currentUser.oid
      })
    }
    if (this.mode == 'Duplicate') {
      this.updateFormWithTaskDetails();
    }

    this.assocConfig = {
      appId: this.application_id,
      elementId: this.application_reference_id,
      activityAssociation: this.activityAssociation
    }
    this.activitiesPlanningReportService.randomQuote$.subscribe((result: any) => {
      this.quote = result;
    });

    this.activitiesPlanningReportService.getGovernanceType(34).subscribe((res: any) => {
      this.contactGovernanceTypes = res;
    }, (err: any) => {
      console.log(err)
    })

    if (this.application_id == 36) {
      this.activitiesPlanningReportService.getActivityPhase(this.application_reference_id).subscribe((res: any) => {
        this.phase = res;
      }, (err: any) => {
        console.error(err);
        throw err;
      })
    }

    // this.activitiesPlanningReportService.getMasterOpportunitiesList().subscribe({
    //   next: (response) => {
    //     this.masterOpportunitiesList = response
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   }
    // });

  }




  setDate(fieldName: any, type: any) {
    this.taskForm.get(fieldName)?.patchValue(this.getDateFn(type))
    return;
  }
  resetButtons = () => {
    this.todaysOrTommorow[0].startDate =
      this.todaysOrTommorow[0].endDate = null
  }
  getDateFn(type: any) {
    const today = new Date()
    const alteredDate = new Date(today)
    type == 'tommorow' ? alteredDate.setDate(alteredDate.getDate() + 1) : type == 'yesterday' ? alteredDate.setDate(alteredDate.getDate() - 1) : {}

    return alteredDate
  }
  dayClicked = (dateCategory: any, day: any) => {
    if (dateCategory == 'startDate') {
      this.todaysOrTommorow[0].startDate = day;
      if (day == 'today') {
        this.taskForm.patchValue({
          startDate: new Date()
        })
      }
      else if (day == 'tommorow') {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        this.taskForm.patchValue({
          startDate: tomorrow
        })
      }
    }
    else if (dateCategory == 'endDate') {
      this.todaysOrTommorow[0].endDate = day;
      if (day == 'today') {
        this.taskForm.patchValue({
          endDate: new Date()
        })
      }
      else if (day == 'tommorow') {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        this.taskForm.patchValue({
          endDate: tomorrow
        })
      }
    }
  }

  editTask = () => {
    this.buttonClicked = true;
    if (this.taskForm.valid) {
      this.activitiesPlanningReportService.editCRMActivities(this.activityId, this.taskForm.value, this.application_id, this.activityAssociation, 4)
      .subscribe({
        next: (response) => {
          this.snackBar.open("Task updated Successfully!", "Dismiss", { duration: 2000 })

          this.edited_or_submitted.emit("Edited");
          this.dialogRef.close({
            text: 'update required',
            newData: this.taskForm.value
          });
        },
        error: (error) => {
          this.snackBar.open("Failed to edit task.", "Dismiss", { duration: 2000 })
          this.buttonClicked = false;
          console.error(error);
        }
      });
    } else {
      this.snackBar.open("Enter all Mandatory Fields!", "Dismiss", { duration: 2000 })
      this.buttonClicked = false;
    }
  }
  createTask = () => {
    this.buttonClicked = true;
    if (this.taskForm.valid) {
      if (this.application_id == 33){
        this.activitiesPlanningReportService.createCRMActivities(this.taskForm.value, this.application_id, this.activityAssociation, 4).subscribe({
          next: (response: any) => {
            this.snackBar.open("Task Created Successfully!", "Dismiss", { duration: 2000 })

            this.edited_or_submitted.emit("Created");
            this.dialogRef.close({
              text: 'update required',
              newData: this.taskForm.value
            });
          },
          error: (error: any) => {
            this.snackBar.open("Failed to create task.", "Dismiss", { duration: 2000 })
            this.buttonClicked = false;
            console.error(error);
          }
        })
      }
      else if (this.application_id == 36){
        this.activitiesPlanningReportService.createCRMActivities(this.taskForm.value, this.application_id, this.activityAssociation, 4).subscribe((res: any) => {
  
          this.snackBar.open("Task Created Successfully!", "Dismiss", { duration: 2000 })
          
          this.edited_or_submitted.emit("Created");
          this.dialogRef.close({
            text: 'update required',
            newData: this.taskForm.value
          });
        }, (err: any) => {
          this.snackBar.open("Failed to create task.", "Dismiss", { duration: 2000 })
          this.buttonClicked = false;
          console.error(err);
        })
      }
      else if (this.application_id == 34){
        this.activitiesPlanningReportService.createCRMActivities(this.taskForm.value, this.application_id, this.activityAssociation, 4).subscribe((res: any) => {
  
          this.snackBar.open("Task Created Successfully!", "Dismiss", { duration: 2000 })
          
          this.edited_or_submitted.emit("Created");
          this.dialogRef.close({
            text: 'update required',
            newData: this.taskForm.value
          });
        }, (err: any) => {
          this.snackBar.open("Failed to create task.", "Dismiss", { duration: 2000 })
          this.buttonClicked = false;
          console.error(err);
        })
      }
    } else {
      this.snackBar.open("Enter all Mandatory Fields!", "Dismiss", { duration: 2000 })
      this.buttonClicked = false;
    }
  }

  duplicateTask = () => {
    this.buttonClicked = true;
    if (this.taskForm.valid) {
      this.activitiesPlanningReportService.createCRMActivities(this.taskForm.value, this.application_id, this.activityAssociation, 4).subscribe((res: any) => {

        this.snackBar.open("Task Duplicated Successfully!", "Dismiss", { duration: 2000 })

        this.edited_or_submitted.emit("Created");
      }, (err: any) => {
        this.snackBar.open("Failed to duplicate task.", "Dismiss", { duration: 2000 })
        this.buttonClicked = false;
        console.error(err);
      })
    } else {
      this.snackBar.open("Enter all Mandatory Fields!", "Dismiss", { duration: 2000 })
      this.buttonClicked = false;
    }
  }

  updateDescription(value: string) {
    this.taskForm.get('description')?.patchValue(value);
  }



}

