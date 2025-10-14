import { Component, OnInit, Input, OnChanges, Inject, ViewChild, HostListener } from '@angular/core';
import * as _ from 'underscore'
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
// import { UdrfActivityService } from '../../../display-activities/services/udrf-activity.service';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
@Component({
  selector: 'app-tabbed-component',
  templateUrl: './tabbed-component.component.html',
  styleUrls: ['./tabbed-component.component.scss']
})


export class TabbedComponentComponent implements OnInit, OnChanges {

  @HostListener('window:keyup.esc') onKeyUp() {
    this.closeTabbed()
  }
  tabbed_content_type: any = 1;
  activity_id: any;
  mode: any;
  application_reference_id: any;
  customer_id: any;
  application_id: any;
  formData: any;
  createdDate: any;
  goverance_id: any;
  application_name!: string;
  masterData: any;

  display_dropdown: boolean = false;
  uniq_id = 0;

  tabbed_list: { id: any; tab_id: any; selectable: any; removable: any; name: any; is_active: any; color: any; mode: any; selected?: boolean }[] = [];


  contactList: any;
  logs = [{
    "id": 2,
    "name": "Log Call",
    "default_name": "Call",
    "type": "call",
    "count": 0
  },
  {
    "id": 3,
    "name": "Log Mail",
    "default_name": "Mail",
    "type": "mail",
    "count": 0
  },
  {
    "id": 1,
    "name": "Log Meet",
    "default_name": "Meet",
    "type": "meet",
    "count": 0
  },
  {
    "id": 4,
    "name": "Create Task",
    "default_name": "Task",
    "type": "task",
    "count": 0
  },
  // {
  //   "id":5,
  //   "name":"Create Checklist",
  //   "default_name":"Checklist",
  //   "type":"checklist",
  //   "count":0
  // },
  {
    "id": 8,
    "name": "Create Notes",
    "default_name": "Notes",
    "type": "notes",
    "count": 0
  }
  ]

  constructor(public dialogRef: MatDialogRef<TabbedComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,

    public dialog: MatDialog,
    private activitiesPlanningReportService: ActivitiesPlanningReportService)
  //private udrfServices: UdrfActivityService) 
  {
    dialogRef.disableClose = true;

    dialogRef.backdropClick().subscribe(() => {
      // Close the dialog
      this.closeTabbed()
    })
  }


  async ngOnInit() {
    await this.activitiesPlanningReportService.getActivitiesType().then((res: any) => {
      let data = res as any[];
      let isDemoPresent = data.filter(item => item.id === 9);
      if (isDemoPresent.length > 0) {
        let demo = {
          "id": 9,
          "name": "Log Demo",
          "default_name": "Demo",
          "type": "demo",
          "count": 0
        }
        this.logs.splice(3, 0, demo)
      }
    });
    this.tabbed_content_type = this.data.tabbed_content_type
    this.mode = this.data.mode
    this.application_reference_id = this.data.application_reference_id
    this.customer_id = this.data.customer_id
    this.application_id = this.data.application_id
    this.formData = this.data.formData;
    this.createdDate = this.data.createdDate;
    this.masterData = this.data.masterData;
    if (this.data.mode != 'Create') {
      this.activity_id = this.formData.id
    }
    this.addTab(this.tabbed_content_type, this.mode)

    await this.activitiesPlanningReportService.getContactListForAccount(this.customer_id).then((res: any) => {
      this.contactList = res
    })

  }


  ngOnChanges() {

  }

  addTab(log_id: any, mode: any) {
    let content = _.where(this.logs, { id: log_id })

    if (content.length > 0) {
      let log_index = _.indexOf(this.logs, content[0])

      this.logs[log_index]["count"] += 1
      this.tabbed_list.push({
        "id": this.uniq_id,
        "tab_id": content[0]['id'],
        "selectable": true,
        "removable": true,
        "name": content[0]['default_name'] + " " + (this.logs[log_index]["count"]),
        "is_active": true,
        "color": "default",
        "mode": mode
      })

    }

    this.checkDropdownNeeded()
    this.displayComponent(this.uniq_id)
    this.uniq_id += 1;

  }

  removeTab(id: any) {

    this.tabbed_list = _.reject(this.tabbed_list, function (val: any) { return val.id == id; })
    this.checkDropdownNeeded()
    this.displayComponent(this.tabbed_list.length == 0 ? 0 : this.tabbed_list[this.tabbed_list.length - 1]['id'])

  }

  checkDropdownNeeded() {

    let count = 0
    for (let tab of this.tabbed_list) {
      if (tab['is_active']) {
        count += 1

      }
    }

    if (count > 4) {
      this.display_dropdown = true;

    }
    else {
      this.display_dropdown = false;
    }
  }


  displayComponent(id: any) {
    if (this.tabbed_list.length == 0) {
      this.dialogRef.close("Refresh")
    }
    for (let i = 0; i < this.tabbed_list.length; i++) {
      if (this.tabbed_list[i]['id'] == id) {
        this.tabbed_list[i]['selected'] = true;
      }
      else {
        this.tabbed_list[i]['selected'] = false;
      }
    }



  }

  trackTabId(index: any, tab: any) {
    return tab.id
  }

  closeTabbed() {
    if (this.tabbed_list.length == 0) {
      this.dialogRef.close("Nope")
    }
    else {
      if (this.tabbed_list[0]['mode'] == "View" && this.tabbed_list.length == 1) {
        this.dialogRef.close("Nope")
      }
      else {
        this.activitiesPlanningReportService.openConfirmationSweetAlertWithCustom("Unsaved items will be deleted!", "Are you sure of closing the Tabs?")
          .then((res: any) => {
            if (res) {
              this.dialogRef.close("Refresh")
            }
          })
      }
    }
  }

  addCustomer(contact_list: any) {
    this.contactList = contact_list
  }



  editedOrCreated(event: any, id: any) {
    this.tabbed_list = _.reject(this.tabbed_list, function (val: any) { return val.id == id; })
    this.checkDropdownNeeded()
    this.displayComponent(this.tabbed_list.length - 1)
  }

  editTab(id: any) {
    this.tabbed_list[id]['mode'] = "Edit"
  }






}

export interface DialogData {
  tabbed_content_type: any;
  activity_id: any;
  mode: any;
  application_reference_id: any;
  customer_id: any;
  application_id: any;
  formData?: any,
  createdDate?: any,
  masterData?: any
}
