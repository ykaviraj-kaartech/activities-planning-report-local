import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { BryntumGanttModule } from '@bryntum/gantt-angular';
import { PlanningLandingPageComponent } from './pages/planning-landing-page/planning-landing-page.component';
import { GanttChartComponent } from './components/gantt-chart/gantt-chart.component';
import { FormsModule } from '@angular/forms';
import { UserImageComponent } from './components/user-image/user-image.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SlicerOppComponent } from './components/slicer-opp/slicer-opp.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';
import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { MoreActionsComponent } from './components/more-actions/more-actions.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { TabbedComponentComponent } from './components/tabbed-component/tabbed-component.component';
import { InputSearchComponent } from './components/input-search/input-search.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CrmActivityAssociationComponent } from './components/crm-activity-association/crm-activity-association.component'
import { ValueArrayPipe } from './pipes/value-array/value-array.pipe'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatInputModule } from '@angular/material/input';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { EditorComponent } from './components/editor/editor.component';
import { SatPopoverModule } from "@ncstate/sat-popover";
import { SearchUserComponent } from './components/search-user/search-user.component'
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { DevExtremeModule } from 'devextreme-angular';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  declarations: [
    AppComponent,
    PlanningLandingPageComponent,
    GanttChartComponent,
    UserImageComponent,
    UserProfileComponent,
    MoreActionsComponent,
    CreateTaskComponent,
    TabbedComponentComponent,
    InputSearchComponent,
    CrmActivityAssociationComponent,
    ValueArrayPipe,
    ColorPaletteComponent,
    EditorComponent,
    SearchUserComponent,
    SlicerOppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BryntumGanttModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    BrowserAnimationsModule,
    OverlayModule,
    ScrollingModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatButtonToggleModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    NgxMatSelectSearchModule,
    CommonModule,
    MatInputModule,
    SatPopoverModule,
    MatAutocompleteModule,
    DevExtremeModule,
    NgxEditorModule
  ],
  providers: [provideHttpClient(),
    provideMomentDateAdapter(),
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useFactory: (sso: ScrollStrategyOptions) => ({
        scrollStrategy: sso.reposition() // Keeps menu correctly positioned on scroll
      }),
      deps: [ScrollStrategyOptions]
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
