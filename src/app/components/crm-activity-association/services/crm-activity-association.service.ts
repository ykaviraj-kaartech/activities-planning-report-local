import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrmActivityAssociationService {
  token = localStorage.getItem('JWT_TOKEN');
  
  private appData: { [key: number]: { getAssoc: string; id: string } } = {
    '33':{getAssoc:'api/crmNotes/getAssociationsForAccounts',id:'accountId'},
    '34':{getAssoc:'api/crmNotes/getAssociationsForContacts',id:'contactId'},
    '35':{getAssoc:'api/crmNotes/getAssociationsForLeads',id:'leadId'},
    '36':{getAssoc:'api/crmNotes/getAssociationsForOpportunities',id:'opportunityId'}
  } 


  getAssociations(appId:number,elementId:number){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    let app=this.appData[appId]
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return this.http.post(`http://localhost:3011/${app.getAssoc}`,{
        [app.id] : elementId
      },{ headers })
    }
    else{
      return this.http.post(`https://${hostname}/${app.getAssoc}`,{
        [app.id] : elementId
      },{ headers })
    }
  }

  constructor(private http : HttpClient) { }
}
