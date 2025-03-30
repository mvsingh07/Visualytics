import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {

  
 helpQuestions: string[] = [
    'How to upload a file?',
    'What formats are supported?',
    'How to download File Statistic Report?',
    'Is there a file size limit?',
    'How to contact support?'
  ];

  helpAnswers: string[] = [
    "To initiate the file upload process, navigate to the dedicated (Upload Files) section and designate the directory containing the files slated for transformation. Once the upload is completed, proceed to activate the transformation by clicking the (Start Processing) button. The system will swiftly execute the transformation, yielding a compressed folder encompassing all the modified files. This compressed folder will be promptly generated and made available in your system's designated ,(Downloads) directory for effortless accessibility.",
    'Our versatile system boasts an extensive array of supported file formats, encompassing the likes of DOC, PDF, DOCX, DOCM, DOCX, JPG, PNG, TIFF, EML, and BML. The breadth of compatibility ensures seamless handling of diverse document and image types. For any inquiries or nuanced guidance pertaining to specific file formats, we wholeheartedly encourage you to reach out to our dedicated support team. Their expertise is boundless, and they stand ready to assist you in navigating the intricacies of file types with unparalleled proficiency. Your satisfaction is our paramount concern, and we eagerly await the opportunity to provide you with tailored assistance.',
    'The File Statistic Report can be conveniently downloaded from the designated "Download Report" section. This feature enables users to access a comprehensive report encompassing data from all performed file transformations. Additionally, users have the flexibility to apply filters, such as specifying input and output file types, file transformation status, and a desired time range. This empowers users to retrieve details only from transformations carried out within the specified timeframe, enhancing the precision and relevance of the downloaded report.',
    'Yes, there is a file size limit of 10 MB per upload. Consider compressing larger files.',
    'For support, please reach out to support@example.com.'
  ];

  expandedRow: number | null = null;

  toggleAnswer(index: number): void {
    this.expandedRow = this.expandedRow === index ? null : index;
  }
}
