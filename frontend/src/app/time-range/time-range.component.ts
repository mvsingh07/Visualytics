import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RangeService } from '../range.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-time-range',
  templateUrl: './time-range.component.html',
  styleUrls: ['./time-range.component.scss']
})
export class TimeRangeComponent {

  rangeForm: FormGroup;
  selectedStartDate: string = '';
  selectedEndDate: string = '';

  constructor(private datePipe: DatePipe,private fb: FormBuilder, private rangeService: RangeService) {
    this.rangeForm = this.fb.group({
      start: [''],
      end: ['']
    });
  }

  ngOnInit() {
    this.rangeService.selectedTimeRange$.subscribe(({ startDate, endDate }) => {
      this.selectedStartDate = startDate;
      this.selectedEndDate = endDate;
    });

    // Listen to changes in the form controls
    this.rangeForm.valueChanges.subscribe(() => {
      const startDate = this.datePipe.transform(this.rangeForm.value.start, 'yyyy-MM-ddTHH:mm:ss')!;
      const endDate = this.datePipe.transform(this.rangeForm.value.end, 'yyyy-MM-ddTHH:mm:ss')!;
      this.rangeService.updateSelectedTimeRange(startDate, endDate);
    });
  }

  // onInputFocus(event: any, inputName: string) {
  //   if (event.target.type === 'text') {
  //     event.target.type = 'datetime-local';
  //   }
  //   this.addWhiteTextClass(inputName);
  // }

  // onInputBlur(event: any, inputName: string) {
  //   if (event.target.value === '') {
  //     event.target.type = 'text';
  //   }
  //   this.removeWhiteTextClass(inputName);
  // }

  // addWhiteTextClass(inputName: string) {
  //   const inputElement = document.querySelector(`[formControlName="${inputName}"]`);
  //   if (inputElement) {
  //     inputElement.classList.add('white-text');
  //   }
  // }

  // removeWhiteTextClass(inputName: string) {
  //   const inputElement = document.querySelector(`[formControlName="${inputName}"]`);
  //   if (inputElement) {
  //     inputElement.classList.remove('white-text');
  //   }
  // }

  // onRangeSelected() {
  //   const startDate = this.datePipe.transform(this.rangeForm.value.start, 'yyyy-MM-ddTHH:mm:ss')!;
  //   const endDate = this.datePipe.transform(this.rangeForm.value.end, 'yyyy-MM-ddTHH:mm:ss')!;
  //   this.rangeService.updateSelectedTimeRange(startDate, endDate);
  // }

  onFormReset() {
    this.rangeForm.reset();
  }

  onDashboardReload(){
    window.location.reload();
  }

}
