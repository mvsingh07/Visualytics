import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit{

  selectedFiles: File[] = [];
  selectedInputFolderName: string = '';
  selectedInputFolderPath: string = '';
  selectedOutputFolderPath: string = '';
  selectedOutputFolderName: string = '';
  selectedFolderForManuallyUploadedFiles:string='';
  folderPath:string = '';
  loggedInUser:string='';


  constructor(private toastr: ToastrService,private http:HttpClient, private form:FormBuilder, private notificationService:NotificationService, private userService: UsersService){}
 

  ngOnInit():void{
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUser = userInfo?.email;
        // console.log("The user signed in:",this.loggedInUser);
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );

  }
  // Function to handle file selection
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = event.target.files;
      // Process each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file,file.name);
      }
      this.sendFiles(this.selectedFiles)
      // this.sendFilePaths(this.selectedFiles.map(file => file.name))
    }
  }

  // Function to send files to the listFiles endpoint
  sendFiles(selectedFiles:File[]) {
    if (this.selectedFiles.length === 0) {
      // No files to upload
      return;
    }
    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      // Append each file to formData with a unique key
      formData.append('file', file);
      formData.append('folderPath',file.name);
      // console.log("folderPath:",file.name)
    });

    this.http.post('http://192.168.1.131:8021/uploadFiles', formData)
      .subscribe((response: any) => {
        console.log('Response from server:', response);
        // Display toastr notification based on the server response status code
      if (response.message === "Files uploaded successfully") {
        this.toastr.success('Upload successful', 'Files are under Processing', {
          closeButton: true,
          positionClass: 'toast-top-center',
          timeOut: 3000,
        });
      } 
      else {
        this.toastr.error('Error uploading files', 'Error', {
          closeButton: true,
          positionClass: 'toast-top-center',
          timeOut: 3000,
        });
      }
    });

    this.sendFilePaths(this.selectedFiles);
    // Clear the selectedFiles array after uploading
    this.selectedFiles = [];
  }


  sendFilePaths(files: File[]) {
    if (!files || files.length === 0) {
      console.error('Files are undefined or empty');
      // Handle the error condition here
      this.toastr.error('Upload files before processing', 'Files Undefined', {
        closeButton: true, // Show a close button on the toast
        positionClass: 'toast-top-center', // Customize the position for this message
        timeOut: 2000, // Toast message will automatically disappear after 3 seconds             
      });
      return;
    }
  
    // Extract file names from the array of file objects
    const fileNames = files.map(file => file.name);
    // Set selected folder for manually uploaded files
    this.selectedFolderForManuallyUploadedFiles = fileNames.join('-'); // Join file names with a comma and space
    
    // Send folder paths to Node.js server
    this.http.post('http://192.168.1.131:8021/listFolders', {
      inputFolderName: 'Files',
      loggedInUserId:this.loggedInUser
    }).subscribe((data: any) => {
    console.log('Response from server:', data);
    if (data.status === 200) {
      // Display success notification only when a successful response is received
      this.toastr.success('Files processed successfully', 'Success', {
        closeButton: true,
        positionClass: 'toast-top-center',
        timeOut: 3000,
      });
      if (data.notificationCount > 0) {
        this.notificationService.sendNotification(data.notificationCount);
      }
    } else {
      // Display error notification if response is not successful
      this.toastr.error('Error processing files', 'Error', {
        closeButton: true,
        positionClass: 'toast-top-center',
        timeOut: 3000,
      });
    }
    });
  }



  
  // Handle input folder selection
  onInputFolderSelected(event: any) {
    // Get the selected folder path from the event
    console.log("in inputfolderselected function");
    const completefolder = event.target.files[0].webkitRelativePath;
    console.log("complete folder path:", completefolder);
    // Extract just the folder path (without the filename)
    const folderPathWithoutFilename = completefolder.replace(/\/[^/]*$/, '');
    console.log(folderPathWithoutFilename);
    // Set the selected input folder path
    this.selectedInputFolderPath = folderPathWithoutFilename;
    // Extract folder name from the folder path if needed
    const folderName = folderPathWithoutFilename.split('/').pop();
    console.log(folderName);
    this.selectedInputFolderName = folderName;

    // Clear the existing selectedFiles array and add the new files
    this.selectedFiles = [];
    // Loop through the selected files and add them to the array
    for (let i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push(event.target.files[i]);
    }

    console.log("files in input function", this.selectedFiles);
    // Upload the files to the server
    this.uploadFiles(this.selectedFiles, this.selectedInputFolderPath);
  }

  
  // Function to upload selected files to the server
  uploadFiles(selectedFiles: File[], selectedInputFolderPath: string) {
    console.log("in upload function of files");

    console.log('Selected  Folder Path:', this.selectedInputFolderPath);

    console.log(selectedFiles);
    if (this.selectedFiles.length === 0) {
      // No files to upload
      return;
    }

    console.log('Before folderPath assignment:', this.folderPath);
    this.folderPath= this.selectedInputFolderPath ?? '';
    console.log('After folderPath assignment:', this.folderPath);

    // Create a new FormData object to send files to the server
    const formData = new FormData();
    console.log("Before loop", formData);
   
    if (this.selectedInputFolderPath!== undefined) {
      formData.append('folderPath', selectedInputFolderPath);
      console.log(this.selectedInputFolderPath);
    }

    this.selectedFiles.forEach(file => {
      // Append each file to formData with a unique key
      formData.append('file', file);
    });
    console.log("After loop", formData);

    console.log("file appended in formData",formData);

    // Send the FormData containing the files to the server using an HTTP POST request
    this.http.post('http://192.168.1.131:8021/uploadFiles', formData)
      .subscribe((response: any) => {
        console.log('Response from server:', response);
        if (response.status === 200) {
          this.toastr.success('Upload successful', 'Files are under Processing', {
            closeButton: true,
            positionClass: 'toast-top-center',
            timeOut: 3000,
          });
        } 
        else {
          this.toastr.error('Error uploading files', 'Error', {
            closeButton: true,
            positionClass: 'toast-top-center',
            timeOut: 3000,
          });
        } 
        // Handle the server response as needed
      });
    // Clear the selectedFiles array after uploading
    this.selectedFiles = [];

  }


  sendFolderPaths(event: Event) {
    event.preventDefault(); 
    if (!this.selectedInputFolderPath ) {
      console.error('Input folder path is undefined');
      // Handle the error condition here
      this.toastr.error( 'Upload Folder before processing','Folder Undefined', {
              // toastClass: 'toast-custom',
              closeButton: true, // Show a close button on the toast
              positionClass: 'toast-top-center', // Customize the position for this message
              timeOut: 2000, // Toast message will automatically disappear after 3 seconds             
            });
      return;
    }
    // Send folder paths to Node.js server
    this.http.post('http://192.168.1.131:8021/listFolders', {
      inputFolderName: this.selectedInputFolderPath,
      loggedInUserId:this.loggedInUser
      
    }).subscribe((data: any) => {
      console.log('Response from server:', data);
      if (data && data.status === 'success') {
        // Display success notification only when a successful response is received
        this.toastr.success('Files processed successfully', 'Success', {
          closeButton: true,
          positionClass: 'toast-top-center',
          timeOut: 3000,
        });
      } else {
        // Display error notification if response is not successful
        this.toastr.error('Error processing files', 'Error', {
          closeButton: true,
          positionClass: 'toast-top-center',
          timeOut: 3000,
        });
      }
    
    });
    // this.selectedInputFolderName='';
    this.resetFunction();
  }

resetFunction(){
  this.selectedInputFolderName='';
}


  // Handle output folder selection
  // onOutputFolderSelected(event: any) {

  //   console.log("in outputfolderselected function");
  //   // Get the selected folder path from the event
  //   const completePath = event.target.files[0].webkitRelativePath;
  //   console.log(completePath);
  //   // Extract just the folder path (without the filename)
  //   const folderPathWithoutFilename = completePath.replace(/\/[^/]*$/, '');
  //   console.log(folderPathWithoutFilename);
  //   // Set the selected output folder path
  //   this.selectedOutputFolderPath = folderPathWithoutFilename;
  //   // Extract folder name from the folder path if needed
  //   const folderName = folderPathWithoutFilename.split('/').pop();
  //   console.log(folderName);
  //   this.selectedOutputFolderName = folderName ;
     
  //    // Loop through the selected files and add them to the array
  //   for (let i = 0; i < event.target.files.length; i++) {
  //     this.selectedFiles.push(event.target.files[i]);
  //   }
  //   console.log("files in input function", this.selectedFiles);
  //   // Upload the files to the server
  //   this.uploadFiles(this.selectedFiles, this.selectedOutputFolderPath);
  // }

  // sendFolderPaths(event: Event) {
  //   event.preventDefault(); 
  //   if (!this.selectedInputFolderPath || !this.selectedOutputFolderPath) {
  //     console.error('Input folder path or output folder path is undefined');
  //     // Handle the error condition here
  //     return;
  //   }
  
  //   // Send folder paths to Node.js server
  //   this.http.post('http://192.168.1.131:8021/listFolders', {
  //     inputFolderPath: this.selectedInputFolderPath,
  //     outputFolderPath: this.selectedOutputFolderPath
  //   }).subscribe((data: any) => {
  //     console.log('Response from server:', data);
  //     // Handle the server response as needed
  //   });
  // }


    
  }


