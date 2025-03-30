import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// <------------------Angular Material----------------------->
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

// <------------------------------------------------------->
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// <---------------------------------------------------------->
import { HighchartsChartModule } from 'highcharts-angular';
import { PieComponent } from './widget/pie/pie.component';
import { BarchartComponent } from './widget/barchart/barchart.component';
import { CombinationComponent } from './widget/combination/combination.component';
import { AreaComponent } from './widget/area/area.component';
import { ResultComponent } from './widget/result/result.component';
import { ChartComponent } from './widget/chart/chart.component';
import { StackedbarComponent } from './widget/stackedbar/stackedbar.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileSizePipe } from './widget/area/fileSize.pipe';
// import { PicComponent } from '../modules/pic/pic.component';
import { CountsComponent } from '../modules/counts/counts.component';
import { MatTableModule } from '@angular/material/table';
import { DataModule } from '../modules/data/data.module';
import { IocComponent } from '../modules/ioc/ioc.component';
import { RangeComponent } from '../range/range.component';

// <--------------------------------------LOGIN AND SIGNUP---------------------------------------------->
import { UserLoginComponent } from '../user-login/user-login.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { EmailProviderComponent } from '../email-provider/email-provider.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { Exp2Component } from '../exp2/exp2.component';
import { Card1Component } from '../cards/card1/card1.component';
import { ExtensionComponent } from '../components/extension/extension.component';
import { filestatsComponent } from '../modules/filestats/filestats.component';
import { AdminComponent } from '../layouts/admin/admin.component';
import { HeaderadminComponent } from './components/headeradmin/headeradmin.component';
import { AdminModule } from '../layouts/admin/admin.module';
import { AdminsidebarComponent } from './components/adminsidebar/adminsidebar.component';
import { ExtensionadminComponent } from '../components/extensionadmin/extensionadmin.component';
import { InitialHeaderComponent } from './components/initial-header/initial-header.component';
import { SecurityComponent } from '../layouts/security/security.component';
import { MatSelectModule } from '@angular/material/select';
import { LightModeHighchartsThemeComponent } from './themes/light-mode-highcharts-theme/light-mode-highcharts-theme.component';
import { NameoneComponent } from '../nameone/nameone.component';
import { FileReportComponent } from 'tasks/file-report/file-report.component';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TimeRangeComponent } from '../time-range/time-range.component';
import { DarkModeHighchartsComponent } from './themes/dark-mode-highcharts/dark-mode-highcharts.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FixedRangeComponent } from '../fixed-range/fixed-range.component';
import { MatBadgeModule } from '@angular/material/badge';
import { PicComponent } from '../modules/pic/pic.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    AreaComponent,
    BarchartComponent,
    CombinationComponent,
    ResultComponent,
    StackedbarComponent,
    FileSizePipe,
    CountsComponent,
    RangeComponent,
    ChartComponent,
    UserLoginComponent,
    SignUpComponent,
    EmailProviderComponent,
    ResetPasswordComponent,
    Exp2Component,
    Card1Component,
    ExtensionComponent,
    HeaderadminComponent,
    AdminsidebarComponent,
    ExtensionadminComponent,
    InitialHeaderComponent,
    PicComponent,
    LightModeHighchartsThemeComponent,
    NameoneComponent,
    FileReportComponent,
    TimeRangeComponent,
    DarkModeHighchartsComponent,
    FixedRangeComponent,
  ],
  imports: [
    CommonModule,
    MatDividerModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    MatMenuModule,
    MatListModule,
    RouterModule,
    HighchartsChartModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    PieComponent,
    ReactiveFormsModule,
    MatTableModule,
    DataModule,
    MatTooltipModule,
    IocComponent,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatBadgeModule,
    MatPaginatorModule,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BarchartComponent,
    CombinationComponent,
    AreaComponent,
    ResultComponent,
    StackedbarComponent,
    PieComponent,
    FileSizePipe,
    CountsComponent,
    IocComponent,
    RangeComponent,
    ChartComponent,
    UserLoginComponent,
    SignUpComponent,
    EmailProviderComponent,
    ResetPasswordComponent,
    Exp2Component,
    Card1Component,
    ExtensionComponent,
    HeaderadminComponent,
    AdminsidebarComponent,
    ExtensionadminComponent,
    InitialHeaderComponent,
    NameoneComponent,
    FileReportComponent,
    TimeRangeComponent,
    FixedRangeComponent,
    PicComponent,
  ],
})
export class SharedModule {}
