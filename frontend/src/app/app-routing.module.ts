import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { HomepageComponent } from './layouts/homepage/homepage.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PostsComponent } from './modules/posts/posts.component';
import { DataComponent } from './modules/data/data.component';
import { filestatsComponent } from './modules/filestats/filestats.component';
import { PieComponent } from './shared/widget/pie/pie.component';
import { StandaloneComponent } from './standalone/standalone.component';
import { CountsComponent } from './modules/counts/counts.component';
import { AreaComponent } from './shared/widget/area/area.component';
import { ChartComponent } from './shared/widget/chart/chart.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EmailProviderComponent } from './email-provider/email-provider.component';
import { AuthGuard } from './auth.guard';
import { Exp2Component } from './exp2/exp2.component';
import { RecordsComponent } from './modules/records/records.component';
import { AdminComponent } from './layouts/admin/admin.component';
import { AdminSignUpComponent } from './admin-sign-up/admin-sign-up.component';
import { AdminGuard } from './admin.guard';
import { SecurityComponent } from './layouts/security/security.component';
import { DashComponent } from './dash/dash.component';
import { FileUploadComponent } from 'tasks/file-upload/file-upload.component';
import { RegularComponent } from './layouts/regular/regular.component';
import { FileDownloadComponent } from 'tasks/file-download/file-download.component';
import { FileReportComponent } from 'tasks/file-report/file-report.component';
import { RegularadminComponent } from './layouts/regularadmin/regularadmin.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { Layout3Component } from './layouts/layout3/layout3.component';
import { Layout3aComponent } from './layouts/layout3a/layout3a.component';
import { MytasksComponent } from './modules/mytasks/mytasks.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { MainProfileComponent } from './modules/main-profile/main-profile.component';
import { HelpComponent } from './modules/help/help.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IocurldialogComponent } from './components/iocurldialog/iocurldialog.component';
import { FixedRangeComponent } from './fixed-range/fixed-range.component';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { OperationsComponent } from './modules/operations/operations.component';
import { OpensearchComponent } from './components/opensearch/opensearch.component';
import { KubernetesComponent } from './components/kubernetes/kubernetes.component';
import { ApiComponent } from './modules/api/api.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'user-login', // Redirect to UserLoginComponent
    pathMatch: 'full',
  },

  {
    path: 'user',
    component: DefaultComponent,
    canActivate: [AuthGuard],
    children: [
      // <-------------------Dashboard Components------------------------->

      { path: 'dd', canActivate: [AuthGuard], component: DashboardComponent },

      { path: 'records', component: RecordsComponent },

      { path: 'uploadFile', component: FileUploadComponent },

      { path: 'download', component: FileDownloadComponent },

      { path: 'report', component: FileReportComponent },

      { path: 'dash', component: DashComponent },

      { path: 'area', component: AreaComponent },

      { path: 'chart', component: ChartComponent },

      { path: 'counts', component: CountsComponent },

      { path: 'posts', component: PostsComponent },

      { path: 'data', component: DataComponent },

      { path: 'filestats', component: filestatsComponent },

      { path: 'pie', component: PieComponent },

      { path: 'exp', component: Exp2Component },

      { path: 'standalone', component: StandaloneComponent },

      { path: 'mytasks', component: MytasksComponent },

      { path: 'profile', component: ProfileComponent },

      { path: 'settings', component: SettingsComponent },

      { path: 'help', component: HelpComponent },

      { path: 'mainProfile', component: MainProfileComponent },

      { path: 'iocurl', component: IocurldialogComponent },

      { path: 'fixedRange', component: FixedRangeComponent },

      { path: 'userOperations', component: NotificationsComponent },

      { path: 'appOperations', component: OperationsComponent },

      { path: 'opensearch', component: OpensearchComponent },

      { path: 'kubernetes', component: KubernetesComponent },

      { path: 'api', component: ApiComponent },

      // <-------------------Dashboard Components------------------------->
    ],
  },
  {
    path: '',
    component: HomepageComponent,

    children: [
      { path: '', component: UserLoginComponent },

      { path: 'user-login', component: UserLoginComponent },

      { path: 'reset-password', component: ResetPasswordComponent },

      { path: 'email-provider', component: EmailProviderComponent },

      { path: 'verify/:verificationToken', component: ConfirmationComponent },

      { path: 'help', component: HelpComponent },
    ],
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard, AuthGuard],
    children: [
      // <-------------------Dashboard Components------------------------->

      { path: 'admindd', component: DashboardComponent },

      { path: 'area', component: AreaComponent },

      { path: 'chart', component: ChartComponent },

      { path: 'counts', component: CountsComponent },

      { path: 'posts', component: PostsComponent },

      { path: 'data', component: DataComponent },

      { path: 'filestats', component: filestatsComponent },

      { path: 'pie', component: PieComponent },

      { path: 'standalone', component: StandaloneComponent },

      { path: 'records', component: RecordsComponent },

      { path: 'uploadFile', component: FileUploadComponent },

      { path: 'download', component: FileDownloadComponent },

      { path: 'report', component: FileReportComponent },

      { path: 'profile', component: ProfileComponent },

      { path: 'mytasks', component: MytasksComponent },

      { path: 'mainProfile', component: MainProfileComponent },

      { path: 'help', component: HelpComponent },

      { path: 'settings', component: SettingsComponent },

      { path: 'fixedRange', component: FixedRangeComponent },

      { path: 'userOperations', component: NotificationsComponent },

      { path: 'appOperations', component: OperationsComponent },

      { path: 'opensearch', component: OpensearchComponent },

      { path: 'kubernetes', component: KubernetesComponent },

      { path: 'api', component: ApiComponent },
    ],
  },

  {
    path: 'admin',
    component: SecurityComponent,
    canActivate: [AdminGuard],
    children: [
      // <-------------------Dashboard Components------------------------->

      { path: 'sign-up', component: SignUpComponent },

      { path: 'create-admin', component: AdminSignUpComponent },

      { path: 'mainProfile', component: MainProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
