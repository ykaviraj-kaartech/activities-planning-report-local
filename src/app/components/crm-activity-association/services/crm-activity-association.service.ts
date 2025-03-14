import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrmActivityAssociationService {
  
  private appData: { [key: number]: { getAssoc: string; id: string } } = {
    '33':{getAssoc:'api/crmNotes/getAssociationsForAccounts',id:'accountId'},
    '34':{getAssoc:'api/crmNotes/getAssociationsForContacts',id:'contactId'},
    '35':{getAssoc:'api/crmNotes/getAssociationsForLeads',id:'leadId'},
    '36':{getAssoc:'api/crmNotes/getAssociationsForOpportunities',id:'opportunityId'}
  } 


  getAssociations(appId:number,elementId:number){
    let app=this.appData[appId]
    return this.http.post(app.getAssoc,{
      [app.id] : elementId
    })
  }

  constructor(private http : HttpClient) { }
}
