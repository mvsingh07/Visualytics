import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RangeService } from 'src/app/range.service';

@Component({
  selector: 'app-file-report',
  templateUrl: './file-report.component.html',
  styleUrls: ['./file-report.component.scss']
})
export class FileReportComponent implements OnInit{

  constructor(private fb: FormBuilder, private rangeService: RangeService,private http: HttpClient,private renderer: Renderer2) {

  }
 
  ngOnInit() {
  
  }
    // Combine all filter values into a single string to trigger filtering
  downloadPdf() {
    this.http.get('http://192.168.1.131:8021/download-pdf', { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
