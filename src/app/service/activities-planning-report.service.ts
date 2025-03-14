import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable, Observer } from 'rxjs';
import { from, map } from 'rxjs';
import Swal from 'sweetalert2';
import jwt_decode from 'jwt-decode';
import * as _ from 'underscore'
import { PublicClientApplication } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesPlanningReportService {
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  availableQuotes: any = [
    'Either run the day or the day runs you.',
    'High expectations are the key to everything.',
    'Innovation distinguishes between a Leader and Follower',
    'If you are not taking care of your customer, your competitor will',
    'Make a Customer, not a Sale',
    'I have never worked a day in my life without selling. If I believe in something, I sell it, and I sell it hard',
    'A satisfied customer is the best business strategy of all',
    'Selling == Helping',
    "If opportunity doesn't knock, build a door",
    'You are never too old to set another goal or to dream a new dream',
    "Don't watch the clock; do what it does. Keep going",
    'The way to get started is to quit talking and begin doing.',
    'What you lack in talent can be made up with desire, hustle, and giving 110% all the time',
    "If you're going through hell, keep going.",
    'Become the person who would attract the results you seek',
    'What we dwell on is who we become',
    'Either run the day or the day runs you',
    "Don't be afraid to give up the good to go for the great.",
    'Trying is winning in the moment.',
    'Sometimes later becomes never. Do it now.',
    'Great things never come from comfort zones.',
    'Dream it. Wish it. Do it.',
    'Well done is better than well said.',
    'The road to Easy Street goes through the sewer.',
    'Fortune favors the bold.',
    'Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.',
    'Success doesn’t just find you. You have to go out and get it.',
    'Dream it. Believe it. Build it.',
    'Fall down seven times and stand up eight.',
    'Leadership belongs to those who take it.',
    'Outstanding people have one thing in common: An absolute sense of mission.',
    'You miss 100% of the shots you don’t take',
    'The way to get started is to quit talking and begin doing',
    "Beware of monotony; it's the mother of all deadly sins.",
    'The key to success is to focus on goals, not obstacles.',
    "Learn from the mistakes of others. You can't live long enough to make them yourself.",
    'Sometimes we’re tested not to show our weaknesses, but to discover our strengths.',
    'Don’t wait for opportunity. Create it.',
    'In the middle of every difficulty lies opportunity.',
    'It’s not about having the right opportunities. It’s about handling the opportunities right.',
    'Always do your best. What you plant now, you will harvest later',
    'It’s going to be hard, but hard does not mean impossible.',
    'Little things make big days.',
    "Beware of monotony; it's the mother of all deadly sins.",
  ];
  userSuggestions: any = [];

  token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFyYWtlc2hyYWpAa2FhcnRlY2guY29tIiwidWFkIjoia3RnbG9iYWwiLCJ0aWQiOiJhMTU3Y2VlYS01MGViLTQyMGMtaWVhOS1kNDMxMGVjNTBlZjkiLCJ1cG4iOiJhcmFrZXNocmFqQGthYXJ0ZWNoLmNvbSIsIm9pZCI6IjE4MTM5MTllLWNlM2UtNGY2Zi04MjBjLTYyN2FhYzFkYTBiYiIsImFpZCI6MTc3NiwibmFtZSI6IlJha2VzaHJhaiBBIiwiaXNPMzY1IjpmYWxzZSwiaXNHc2lnbiI6ZmFsc2UsImlhdCI6MTc0MDM4OTQyNiwiZXhwIjoyNjQwMzg5NDI2fQ.Wzf_4f3yJ-ng7X2KN2QeOyUXrS36srKDQ4h23y8Pmy8';

  constructor(private http: HttpClient) { }

  getActivitiesDataForGanttForId(tab: any, applicationId: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    let apiUrl = 'http://localhost:3011/api/opportunitiesV2/getActivitiesDataForGanttForId';
    return this.http.post<{ messData: any[], messText: any, messType: any }>(apiUrl, {
      tab: tab,
      applicationId: applicationId
    },
    { headers })
  }

  getActivitiesDataForGantt(tab: any, opportunityId: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    let apiUrl = 'http://localhost:3011/api/opportunitiesV2/getActivitiesDataForGantt';
    return this.http.post<{ messData: any[], messText: any, messType: any }>(apiUrl, {
      tab: tab,
      opportunity_id: opportunityId
    },
    { headers })
  }

  updateActivityDates(activityId: any, start_date: any, end_date: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    let apiUrl = 'http://localhost:3011/api/opportunitiesV2/updateActivityDatesFromGantt';
    return this.http.post<{ messData: any[], messText: any, messType: any }>(apiUrl, {
      activity_id: activityId,
      start_date: start_date,
      end_date: end_date
    },
    { headers })
  }

  async getUserProfileFromDB(oid: any) {
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        });
    try {
      return await firstValueFrom(
        this.http.post("http://localhost:3001/api/project/getUserProfileFromDB", { oid },
          { headers }
        )
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err; // Properly rethrow the error
    }
  }

  async getUserProfileImage(oid: any){
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        });
    try {
      return await firstValueFrom(
        this.http.post("http://localhost:3001/api/auth/authenticate/getUserProfileImage", { oid },
          { headers }
        )
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err; // Properly rethrow the error
    }
  };

  async taskFormDetails(activity_id: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    try {
      return await firstValueFrom(
        this.http.post("http://localhost:3011/api/opportunitiesV2/taskFormDetailsForOpportunity", { activity_id },
          { headers }
        )
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err; // Properly rethrow the error
    }
  }

  async getContactListForAccount(customer_id: any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    try {
      return await firstValueFrom(
        this.http.post("http://localhost:3011/api/contacts/getContactForAccount", {accountId: customer_id},
          { headers }
        )
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err; // Properly rethrow the error
    }
  }

  async getActivitiesType() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    try {
      return await firstValueFrom(
        this.http.post("http://localhost:3011/api/activity/getActivitiesType",{},
          { headers }
        )
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err; // Properly rethrow the error
    }
  }

  public openConfirmationSweetAlertWithCustom(title: any, text: any) {

    return new Promise((resolve, reject) => {

      Swal.fire({

        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go ahead',
        cancelButtonText: 'No, let me think'

      }).then((result: any) => {

        resolve(result.value);

      });

    });

  }

  getProfile() {
    let token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      var decoded = jwt_decode(token) as any;
      return {
        profile: {
          email: decoded['email'],
          name: decoded['name'],
          oid: decoded['oid'],
          aid: decoded['aid'],
          tid: decoded['tid'],
          upn: decoded['upn'],
          uad: decoded['uad'],
        },
      };
    }
    else return;

  }

  getLabelForOpportunity = (application_id: any, id: any) =>{
    return this.getUserLabel().pipe(
      map((res: any) => {
        const label = res['data'];
        const val = _.where(label, { application_id, id });
        return val.length > 0 ? val[0]['label_name'] : "";
      })
    );
  }

  getUserLabel() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    try {
      return this.http.post("http://localhost:3011/api/contacts/getContactForAccount", {}, { headers });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err;
    }
  }

  randomQuote$ = new Observable((observer: Observer<any>) => {
    observer.next(
      this.availableQuotes[
        Math.floor(Math.random() * this.availableQuotes.length)
      ]
    );
  });

  getGovernanceType=(applicationId: any)=>{
    return this.http.post('http://localhost:3011/api/activity/getGovernanceActivityType', {
      applicationId:applicationId
    })
  }

  getActivityPhase = (oppId: any) => {
    return this.http.post("http://localhost:3011/api/upload/getPhaseMasterForCreation", {
      opportunityId: oppId,
      application_id: 36
    })
  }

  editCRMActivities(activity_id: any, crmFormDetails: any, application_id: any, associations: any, type_id: any) {
    return this.http.post("http://localhost:3011/api/activity/editCRMActivities", { 
      activity_id, 
      crmFormDetails, 
      application_id,
      associations, 
      type_id 
    });
  }

  createCRMActivities(crmFormDetails: any, application_id: any, associations: any, type_id: any) {
    return this.http.post('http://localhost:3011/api/activity/createCRMActivities', {
      crmFormDetails: crmFormDetails,
      application_id: application_id,
      associations: associations,
      type_id: type_id
    })
  }

  // getActivitiesDataForGanttForId(applicationId: any){
  //   let promise = new Promise((resolve, reject) => {
  //     let result = {"messType":"S","messText":"Activities Data Retrived Successfully!","messData":[{"id":271,"name":"ERP Implementation","startDate":"2025-02-26T02:22:41.000Z","endDate":"2025-03-05T02:22:41.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy271","name":"Loading...","isDummy":true}]},{"id":547,"name":"SAP BO Dashboards","startDate":"2021-02-02T06:38:05.000Z","endDate":"2022-02-23T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy547","name":"Loading...","isDummy":true}]},{"id":1864,"name":"SAP S4 HANA Implementation","startDate":"2020-10-27T22:16:09.000Z","endDate":"2026-02-17T15:30:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy1864","name":"Loading...","isDummy":true}]},{"id":2000,"name":"SAP Greenfield","startDate":"2012-06-18T18:30:00.000Z","endDate":"2022-12-22T01:27:37.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy2000","name":"Loading...","isDummy":true}]},{"id":2219,"name":"SAP Landscape Technical Assessment","startDate":"2020-10-27T11:49:06.000Z","endDate":"2020-11-16T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy2219","name":"Loading...","isDummy":true}]},{"id":2298,"name":"IS Retail Implementation","startDate":"2020-09-01T23:14:38.000Z","endDate":"2020-09-26T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy2298","name":"Loading...","isDummy":true}]},{"id":3000,"name":"T & M - ABAP","startDate":"2025-02-10T00:57:00.000Z","endDate":"2025-02-10T00:57:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3000","name":"Loading...","isDummy":true}]},{"id":3168,"name":"SAP FRP Implementation","startDate":"2020-06-06T23:36:34.000Z","endDate":"2020-06-11T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3168","name":"Loading...","isDummy":true}]},{"id":3420,"name":"OCC - S4HANA + SF Implementation","startDate":"2020-12-17T03:40:02.000Z","endDate":"2021-01-12T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3420","name":"Loading...","isDummy":true}]},{"id":3458,"name":"AMS  - 60 Months","startDate":"2021-11-29T18:30:00.000Z","endDate":"2021-11-30T00:42:36.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3458","name":"Loading...","isDummy":true}]},{"id":3835,"name":"SF Recruitment","startDate":"2020-10-20T22:21:47.000Z","endDate":"2020-10-27T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3835","name":"Loading...","isDummy":true}]},{"id":3874,"name":"G36 & 5.56 S/4 HANA Implementation","startDate":"2021-07-31T18:30:00.000Z","endDate":"2021-08-09T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy3874","name":"Loading...","isDummy":true}]},{"id":4038,"name":"Offshore AMS Support","startDate":"2021-01-31T20:54:19.000Z","endDate":"2021-03-24T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4038","name":"Loading...","isDummy":true}]},{"id":4041,"name":"ARA Tanzania Rollout","startDate":"2020-07-16T01:02:23.000Z","endDate":"2020-06-07T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4041","name":"Loading...","isDummy":true}]},{"id":4060,"name":"Qatar Rollout","startDate":"2022-12-03T13:00:00.000Z","endDate":"2022-12-05T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4060","name":"Loading...","isDummy":true}]},{"id":4090,"name":"Rise with SAP","startDate":"2021-02-10T22:46:49.000Z","endDate":"2022-03-30T18:30:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4090","name":"Loading...","isDummy":true}]},{"id":4122,"name":"RISE W/ SAP, Implementation","startDate":"2018-09-26T18:30:00.000Z","endDate":"2021-12-29T18:30:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4122","name":"Loading...","isDummy":true}]},{"id":4317,"name":"S4 HANA Conversion ","startDate":"2022-03-24T04:20:27.000Z","endDate":"2023-11-08T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4317","name":"Loading...","isDummy":true}]},{"id":4344,"name":"S4HANA (FICO,MM,WM), SF -  Implementation","startDate":"2020-08-25T00:31:46.000Z","endDate":"2021-01-17T13:00:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4344","name":"Loading...","isDummy":true}]},{"id":4472,"name":"DMS","startDate":"2021-11-23T18:30:00.000Z","endDate":"2021-12-04T18:30:00.000Z","hasChildren":true,"expanded":false,"children":[{"id":"dummy4472","name":"Loading...","isDummy":true}]}]};
  //     resolve(result);

  //   })
  //   return from(promise);
  // }

  // getActivitiesDataForGantt(opportunityId: any){
  //   let promise = new Promise((resolve, reject) => {
  //     let result = {"messType":"S","messText":"Activities Data Retrived Successfully!","messData":[{"id":64966,"application_id":36,"application_reference_id":10749,"name":"Identify OEM Stakeholders","sales_activity_id":7,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64967,"application_id":36,"application_reference_id":10749,"name":"Analyze Past Engagement History with Customer","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"1813919e-ce3e-4f6f-820c-627aac1da0bb","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64968,"application_id":36,"application_reference_id":10749,"name":"Understand Current Landscape of Customer","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64969,"application_id":36,"application_reference_id":10749,"name":"Analyze Similar Project Experience","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":1,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64970,"application_id":36,"application_reference_id":10749,"name":"Find Incumbent Vendor Details","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64971,"application_id":36,"application_reference_id":10749,"name":"Customer Credit Worthiness","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-09-16T18:30:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64972,"application_id":36,"application_reference_id":10749,"name":"Kick-Off","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-09-29T18:30:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64973,"application_id":36,"application_reference_id":10749,"name":"Check OEM Alignment with Customer","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64974,"application_id":36,"application_reference_id":10749,"name":"Identify Customer Stakeholders","sales_activity_id":7,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64975,"application_id":36,"application_reference_id":10749,"name":"P&L Head Approval","sales_activity_id":6,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-09-19T18:30:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":3,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64976,"application_id":36,"application_reference_id":10749,"name":"Analyze Similar Industry Experience","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":2,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64977,"application_id":36,"application_reference_id":10749,"name":"Identify OEM","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":7,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":64978,"application_id":36,"application_reference_id":10749,"name":"Check Evaluation Criteria","sales_activity_id":4,"activity_sub_type_id":null,"startDate":"2024-08-10T18:30:00.000Z","endDate":"2024-08-10T13:00:00.000Z","assigned_to":"ee451ab9-8a83-47d8-9cbc-72e119e892f8","activity_status_id":5,"created_by":null,"changed_by":null,"is_active":1,"expanded":0},{"id":75332,"application_id":36,"application_reference_id":10749,"name":"Meet by Rakeshraj A on 21-Jan-2025, 2:02 pm","sales_activity_id":1,"activity_sub_type_id":2,"startDate":"2025-01-21T03:02:42.000Z","endDate":"2025-01-21T03:02:42.000Z","assigned_to":"86cf3024-e641-4628-aaf0-335b6498093c","activity_status_id":1,"created_by":"1813919e-ce3e-4f6f-820c-627aac1da0bb","changed_by":null,"is_active":1,"expanded":0},{"id":75333,"application_id":36,"application_reference_id":10749,"name":"Test","sales_activity_id":6,"activity_sub_type_id":null,"startDate":"2025-01-21T04:32:58.000Z","endDate":"2025-01-23T13:00:00.000Z","assigned_to":"86cf3024-e641-4628-aaf0-335b6498093c","activity_status_id":1,"created_by":"1813919e-ce3e-4f6f-820c-627aac1da0bb","changed_by":null,"is_active":1,"expanded":0}]};
  //     resolve(result);
  //   })
  //   return from(promise);
  // }

}
