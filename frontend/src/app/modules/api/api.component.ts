import { Component, OnInit } from '@angular/core';
import { ApiStatusService } from 'src/app/services/api-status.service';
interface Api {
  name: string;
  url: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit{
  
  apis: Api[] = [
    {
      name: 'KubeMaster',
      url: 'http://192.168.1.230:8080/',
      description: 'The KubeMaster system organizes and schedules Pods on worker nodes, handling tasks like running Python scripts, LibreOffice, and other apps in containers.',
      status: 'Checking...'
    },

    {
      name: 'HaProxy',
      url: 'http://192.168.1.125:2222/',
      description: 'The system manages load balancing by employing a round-robin algorithm to distribute incoming files across two separate Apache NiFi servers.',
      status: 'Checking...'
    },
    {
      name: 'Nifi Service 1',
      url: 'http://192.168.1.127:8080/nifi/',
      description: 'The system manages data flow automation by receiving files from HAProxy using a round-robin algorithm. File processing, including transformation, IOC (Inversion of Control), and macros extraction, is handled through processors defined within NiFi.',
     status: 'Checking...'
    },
    {
      name: 'Nifi Service 2',
      url: 'http://192.168.1.128:8080/nifi/',
      description: 'The system manages data flow automation by receiving files from HAProxy using a round-robin algorithm. File processing, including transformation, IOC (Inversion of Control), and macros extraction, is handled through processors defined within NiFi.',
     status: 'Checking...'
    },
    {
      name: 'LIBRE API',
      url: 'http://192.168.1.230:32088/',
      description: 'The system converts document files smaller than 4 MB into PDFs using a three-step process: initially converting the files to PDF format, then to PostScript (PS), and finally back to PDF.This process effectively removes malicious content and ensures the file is safe for browsing.',
     status: 'Checking...'
    },
    {
      name: 'LIBRE API MAJOR',
      url: 'http://192.168.1.230:32435/',
      description: 'The system converts document files larger than 4 MB into PDFs using a three-step process: initially converting the files to PDF format, then to PostScript (PS), and finally back to PDF.This process effectively removes malicious content and ensures the file is safe for browsing.',
      status: 'Checking...'
    },
    {
      name: 'IMAGE API',
      url: 'http://192.168.1.230:30533/',
      description: 'The system converts various image file types to PNG format using Python libraries and the PNG files to JPG format. Additionally, for EML files, it provides a ZIP archive that includes a PDF of the email content and all attachments converted to PNG, ensuring all components are packaged together in a single ZIP file. This process effectively removes malicious content and ensures the file is safe for browsing.',
     status: 'Checking...'
    },
    {
      name: 'Yara and IOC API',
      url: 'http://192.168.1.230:30766/',
      description: 'The system extracts Indicators of Compromise (IOCs) from all file types within its scope. This includes IOC emails, domains, IPs, URLs, Yara scan results, macro analysis results, and macros.',
     status: 'Checking...'
    },
    {
      name: 'Automation Script',
      url: 'https://192.168.1.128:8002',
      description: 'The system automatically processes folders for transformation and sends individual files to HAProxy. It extracts ZIP files and sends the extracted files for further processing, including the file structure as response headers.',
     status: 'Checking...'
    },
    {
      name: 'NAS API',
      url: 'https://192.168.1.100:5000/',
      description: 'The system stores transformation results in a Network Attached Storage (NAS) while maintaining the original folder structure. The results are categorized into four buckets: TransformedFiles, UntransformedFiles, OutOfScopeFiles, and BadRequests, along with logs for all categories.',
     status: 'Checking...'
    },
    
    {
      name: 'Virtual Machine Transformation API',
      url: 'http://192.168.1.230:30766/',
      description: 'Transforms MDI and DWG File type to PDFs.This process effectively removes malicious content and ensures the file is safe for browsing.',
     status: 'Checking...'
    },
    
    
  ];

  constructor( private apiStatusService:ApiStatusService ) { }

  ngOnInit(): void {
    this.apis.forEach(api => {
      this.apiStatusService.checkApiStatus(api.url).subscribe(status => {
        api.status = status.status;
        // api.status = "Operational";        
        console.log("Status:",api.status)
      });
    });
  }
}
