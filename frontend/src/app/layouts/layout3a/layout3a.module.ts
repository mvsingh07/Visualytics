import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
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
import { RangeModule } from 'src/app/range/range.module';
import { AreaModule } from 'src/app/shared/widget/area/area.module';
import { RangeService } from 'src/app/range.service';
import { Layout3aComponent } from './layout3a.component';


@NgModule({
  declarations: [Layout3aComponent],
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
export class Layout3aModule { }
