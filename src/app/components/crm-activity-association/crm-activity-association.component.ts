import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityAssociation } from './models/activity-association.model';
import { AssociationConfig } from "./models/association-config.model"
import { AssociationData } from "./models/associtation-data.model"
import { CrmActivityAssociationService } from './services/crm-activity-association.service'
@Component({
  selector: 'crm-activity-association[associationConfig]',
  templateUrl: './crm-activity-association.component.html',
  styleUrls: ['./crm-activity-association.component.scss']
})
export class CrmActivityAssociationComponent implements OnInit, OnChanges {

  // Inputs: 
  @Input() associationConfig!: AssociationConfig;

  // mode: Component's operation mode; Accepted Values= 'view' | 'edit'; Default = 'view'
  @Input() mode: 'view' | 'edit' = 'view';
  // activity Association: currently associated items to this activity
  activityAssociation!: ActivityAssociation
  //  Available association
  assocData!: AssociationData;

  // Output: Updated activity association
  @Output() update = new EventEmitter<ActivityAssociation>()
  // Flags
  isLoading: boolean = false
  isErr: boolean = false
  isOpenClicked: boolean = (this.mode == 'view');

  // var
  assocNav = 'accounts'

  // getters
  get leadsLength() {
    return Object.keys(this.assocData.associatedLeads).length
  }

  get accountsLength() {
    return Object.keys(this.assocData.associatedAccounts).length
  }
  get contactsLength() {
    return Object.keys(this.assocData.associatedContacts).length
  }
  get opportunitiesLength() {
    return Object.keys(this.assocData.associatedOpportunities).length
  }

  get defaultAssociation() {
    return this.associationConfig.activityAssociation.default
  }

  get totalAssociations() {
    return this.associationConfig.activityAssociation.opportunities.length +
      this.associationConfig.activityAssociation.leads.length +
      this.associationConfig.activityAssociation.accounts.length +
      this.associationConfig.activityAssociation.contacts.length;
  }

  // Utility functions
  isAccountChecked(id: number) {
    return this.associationConfig.activityAssociation.accounts.includes(id)
    // return true;
  }

  isContactChecked(id: number) {
    return this.associationConfig.activityAssociation.contacts.includes(id)
  }

  isLeadChecked(id: number) {
    return this.associationConfig.activityAssociation.leads.includes(id)
  }

  isOpportunityChecked(id: number) {
    return this.associationConfig.activityAssociation.opportunities.includes(id)
  }

  updateAssociatedAccounts(push: any, id: any) {

    if (push) {
      this.associationConfig.activityAssociation.accounts.push(id);
    }
    else {
      this.associationConfig.activityAssociation.accounts = this.associationConfig.activityAssociation.accounts.filter(item => item !== id)
    }
  }

  updateAssociatedContacts(push: any, id: any) {

    if (push) {
      this.associationConfig.activityAssociation.contacts.push(id);
    }
    else {
      this.associationConfig.activityAssociation.contacts = this.associationConfig.activityAssociation.contacts.filter(item => item !== id)
    }
  }

  updateAssociatedLeads(push: any, id: any) {

    if (push) {
      this.associationConfig.activityAssociation.leads.push(id);
    }
    else {
      this.associationConfig.activityAssociation.leads = this.associationConfig.activityAssociation.leads.filter(item => item !== id)
    }
  }

  updateAssociatedOpportunities(push: any, id: any) {

    if (push) {
      this.associationConfig.activityAssociation.opportunities.push(id);
    }
    else {
      this.associationConfig.activityAssociation.opportunities = this.associationConfig.activityAssociation.opportunities.filter(item => item !== id)
    }
  }


  constructor(private activityAssocService: CrmActivityAssociationService, private _snackbar: MatSnackBar) { }

  ngOnChanges(changes: SimpleChanges){
    this.ngOnInit();
  }



  ngOnInit(): void {
    try {
      this.activityAssociation = this.associationConfig.activityAssociation
      this.assocData = this.associationConfig.assocData as AssociationData;
      if (this.mode == 'edit' && (this.assocData == null || this.assocData == undefined)) {
        this.fetchAssocData();
      }
      else {
        for (let accountId in this.assocData.associatedAccounts) {
          if (!this.isAccountChecked(parseInt(accountId)))
            this.updateAssociatedAccounts(true, parseInt(accountId))
        }
      }

    }
    catch (err) {
      this.isErr = true;
    }
  }

  fetchAssocData() {
    this.isLoading = true
    this.isErr = false
    this.activityAssocService.getAssociations(this.associationConfig.appId, this.associationConfig.elementId).subscribe(
      (res: any) => {
        this.assocData = res
        this.isLoading = false;
        this.isErr = false;
        this.isOpenClicked = false;
        for (let accountId in this.assocData.associatedAccounts) {
          if (!this.isAccountChecked(parseInt(accountId)))
            this.updateAssociatedAccounts(true, parseInt(accountId))
        }
      },
      (err) => {
        this.isErr = true;
        this.isLoading = false;
        let errSBRef = this._snackbar.open('Error retrieving associations!', 'Retry', { duration: 3000 })
        errSBRef.onAction().subscribe(() => { this.fetchAssocData() })
      }
    )
  }

  emitUpdate() {
    this.update.emit(this.activityAssociation);
  }

  openMenu() {
    if (this.assocData == null)
      this.fetchAssocData();
  }
}
