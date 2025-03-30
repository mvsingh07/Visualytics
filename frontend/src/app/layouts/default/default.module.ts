import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { DefaultComponent } from './default.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
// import { PostsComponent } from 'src/app/modules/posts/posts.component';
import { FlexLayoutModule } from '@angular/flex-layout';
// mat modules
import { MatSidenavModule}  from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatTableModule} from '@angular/material/table';

// <---------------------------Date Picker-------------------------------------------->
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DataComponent } from 'src/app/modules/data/data.component';


import { RangeService } from 'src/app/range.service';
import { RangeModule } from 'src/app/range/range.module';
import { AreaModule } from 'src/app/shared/widget/area/area.module';
import { AreaComponent } from 'src/app/shared/widget/area/area.component';
import { RangeComponent } from 'src/app/range/range.component';
import { RecordsComponent } from 'src/app/modules/records/records.component';
@NgModule({
  declarations: [
    DefaultComponent,
    // DashboardComponent,
    // DataComponent,
    RecordsComponent
   
     
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
    AreaModule


  ],
  providers:[
    RangeService
  ]
})
export class DefaultModule { }
