import { NgModule } from '@angular/core';
import { DatePipe, NgFor, NgIf} from '@angular/common'
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrModule } from 'ngx-toastr';

//<--------------------------DATA---------------------------------->

import { filestatsComponent } from './modules/filestats/filestats.component';

//<------------------------------------------------------------>

import { HomepageModule } from './layouts/homepage/homepage.module';
import { DefaultModule } from './layouts/default/default.module';
import { FlexLayoutModule } from '@angular/flex-layout';


//<------------------------MAT COMPONENTS------------------------------------>
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input'; 
import { MatDateRangePicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatNativeDateModule } from '@angular/material/core';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatCardModule } from '@angular/material/card';
import { PieModule } from './shared/widget/pie/pie.module';
import { StandaloneComponent } from './standalone/standalone.component';
import { RangeComponent } from './range/range.component';
import { RangeModule } from './range/range.module';
import { AreaModule } from './shared/widget/area/area.module';


// <------------------------PROVIDERS------------------------------------------>
import { RangeService } from './range.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { Exp2Module } from './exp2/exp2.module';
import { RecordsComponent } from './modules/records/records.component';
import { FilestatsModule } from './modules/filestats/filestats.module';
import { AdminSignUpComponent } from './admin-sign-up/admin-sign-up.component';
import { ExtensionadminComponent } from './components/extensionadmin/extensionadmin.component';
import { DashComponent } from './dash/dash.component';
import { SettingsComponent } from './components/settings/settings.component';
import { FileUploadComponent } from 'tasks/file-upload/file-upload.component';
import { RegularComponent } from './layouts/regular/regular.component';
import { RegularModule } from './layouts/regular/regular.module';
import { FileDownloadComponent } from 'tasks/file-download/file-download.component';
import { FileReportComponent } from 'tasks/file-report/file-report.component';
import { RegularadminModule } from './layouts/regularadmin/regularadmin.module';
import { NameoneComponent } from './nameone/nameone.component';
import { FileReportModule } from 'tasks/file-report/file-report.module';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { Layout3Module } from './layouts/layout3/layout3.module';
import { Layout3aModule } from './layouts/layout3a/layout3a.module';
import { TimeRangeComponent } from './time-range/time-range.component';
import { TimeRangeModule } from './time-range/time-range.module';
import { ProfileComponent } from './modules/profile/profile.component';
import { MytasksComponent } from './modules/mytasks/mytasks.component';
import { SecurityModule } from './layouts/security/security.module';
import { MainProfileComponent } from './modules/main-profile/main-profile.component';
import { HelpComponent } from './modules/help/help.component';
import { IocurldialogComponent } from './components/iocurldialog/iocurldialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from './services/notification.service';
import { OperationsComponent } from './modules/operations/operations.component';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { OpensearchComponent } from './components/opensearch/opensearch.component';
import { KubernetesComponent } from './components/kubernetes/kubernetes.component';
import { IocipdialogComponent } from './components/iocipdialog/iocipdialog.component';
import { IocemaildialogComponent } from './components/iocemaildialog/iocemaildialog.component';
import { IocdomaindialogComponent } from './components/iocdomaindialog/iocdomaindialog.component';
import { MacroresultsComponent } from './components/macroresults/macroresults.component';
import { IocDialogComponent } from './components/ioc-dialog/ioc-dialog.component';
import { PicComponent } from './modules/pic/pic.component';
import { ApiComponent } from './modules/api/api.component';
import { YaraComponent } from './components/yara/yara.component';



@NgModule({
  declarations: [
    AppComponent,
    filestatsComponent,
    StandaloneComponent,
    AdminSignUpComponent,
    DashComponent,
    SettingsComponent,
    FileUploadComponent,
    FileDownloadComponent,
    ConfirmationComponent,
    ProfileComponent,
    MytasksComponent,
    MainProfileComponent,
    HelpComponent,
    IocurldialogComponent,
    OperationsComponent,
    NotificationsComponent,
    OpensearchComponent,
    KubernetesComponent,
    IocipdialogComponent,
    IocemaildialogComponent,
    IocdomaindialogComponent,
    MacroresultsComponent,
    IocDialogComponent,
    ApiComponent,
    YaraComponent,
   


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(), 
    DefaultModule,
    HomepageModule,
    RegularModule,
    RegularadminModule,
    Layout3Module,
    Layout3aModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTableModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    HighchartsChartModule,
    NgFor,
    NgIf,
    AreaModule,
    Exp2Module,
    RangeModule,
    PieModule,
    MatCardModule,
    FlexLayoutModule,
    MatSelectModule,
    MatOptionModule,
    MatSidenavModule,
    MatIconModule,
    MatSelectModule,
    FileReportModule,
    MatSlideToggleModule,
    TimeRangeModule,
    SecurityModule,
    MatDialogModule,   
  ],
  providers: [DatePipe, RangeService,AuthService ,AuthGuard,NotificationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
