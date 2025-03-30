import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from '../default/default.component';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { DataComponent } from 'src/app/modules/data/data.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AreaModule } from 'src/app/shared/widget/area/area.module';
import { RangeModule } from 'src/app/range/range.module';
import { RangeService } from 'src/app/range.service';
import { AdminComponent } from './admin.component';
@NgModule({
  declarations: [
    DashboardComponent,
    DataComponent,
    AdminComponent
    
  ],
  imports: [
    
    CommonModule,
    RouterModule,
    SharedModule,
    MatSidenavModule,
    MatDividerModule,
    FlexLayoutModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    RangeModule,
    AreaModule,
    MatSidenavModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule
  ],

  providers:[
    RangeService
  ]
})
export class AdminModule { }
