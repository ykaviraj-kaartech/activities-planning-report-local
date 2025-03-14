import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningLandingPageComponent } from '../app/pages/planning-landing-page/planning-landing-page.component'

const routes: Routes = [
  {
    path: '',
    component: PlanningLandingPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
