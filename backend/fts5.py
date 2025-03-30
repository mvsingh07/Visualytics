from concurrent.futures import ThreadPoolExecutor
import datetime
import json
from urllib.parse import unquote
from pymongo import MongoClient
import pymongo
# Add at the top of the script

libre_pod = ['.odt', '.doc', '.docm', '.docx', '.rtf', '.dot', '.dotx', '.odp', '.ods', '.xls', '.xlsx', '.ppt', '.pptx', '.xlt', '.xlsm', '.dotm', '.pps', '.ppsx', '.pptm', '.ppsm', '.xlsb', '.xla', '.xlb', '.xlk', '.xlc', '.xlm', '.pict', '.dxf', '.wmf', '.mdi', '.fh11', '.fh10', '.emz', '.emf', '.cmx', '.djvu', '.xlam', '.ppam', '.dwg', '.pdf']

python_image_pod = ['.ppm', '.jpg', '.jpeg', '.png', '.xbm', '.bmp', '.tiff', '.tif', '.psd', '.gif', '.jp2', '.pcx', '.pgm', '.ppm', '.tga', '.ico', '.icns', '.webp', '.jpf', '.rw2', '.raw', '.srf', '.svg', '.eml']
import os
import argparse
import zipfile
import requests
import re
import time
import time 
import platform
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging


client = MongoClient('192.168.1.131', 27017)
db = client['finalDb']
ZIP_LOGS = "ziplogs"
file_collection = db['manuallyuploadeds']
user_operations = db['operations']
all_operations = db['appoperations']
file_collection2 = db['manuallytransformeds']
zip_logs_collection = db[ZIP_LOGS]
# Configure loggers for different modules
loggers = {}


if platform.system() == 'Windows':
    base_dir = os.environ["USERPROFILE"]  # Windows equivalent for home directory
else:
    base_dir = os.path.expanduser("~")  # Linux home directory
source_folder = os.path.join(base_dir, "Desktop")
log_directory = os.path.join(base_dir, "Desktop", "TransformationResults", "logs")

# create log directory if it does not exist
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

def setup_logger(name, log_file, level=logging.INFO):
    """Create separate loggers for different purposes"""
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(file_handler)

    return logger


# Create separate loggers
loggers['uploadedFiles'] = setup_logger('uploadedFiles', os.path.join(log_directory, 'uploadedFiles.log'))
loggers['failedAttempts'] = setup_logger('failedAttempts', os.path.join(log_directory, 'failedAttempts.log'))
loggers['outOfScope'] = setup_logger('outOfScope', os.path.join(log_directory, 'outOfScope.log'))
loggers['retriedFiles'] = setup_logger('retriedFiles', os.path.join(log_directory, 'retriedFiles.log'))
loggers['badRequests'] = setup_logger('badRequests', os.path.join(log_directory, 'badRequests.log'))
loggers['errors'] = setup_logger('errors', os.path.join(log_directory, 'errors.log'), logging.ERROR)

#app = Flask(__name__)

haproxyUrl = 'http://192.168.1.125:2222/api/v1/upload_file'  # NIFI - Replace with your API endpoint URL

nifi2Url= 'http://192.168.1.128:8002/api/v1/upload_file'
oosurl = 'http://192.168.1.131:5004/move_out_of_scope_files' 

def upload_document_file_to_nifi2(file_path, filename, destination_folder, loggedInUserId, transformedEntity):
    """ Uploads a document file to NiFi and logs the response in MongoDB collections. """
    
    os.makedirs(destination_folder, exist_ok=True)
    
    try:
        original_file_path = file_path
        sanitized_filename = re.sub(r'[^a-zA-Z0-9._]', '_', filename)
        sanitized_file_path = re.sub(r'[^a-zA-Z0-9._:\\/]', '_', file_path)
        
        original_file_size = os.path.getsize(original_file_path)
        if original_file_size == 0:
            print(f"Warning: Source file {original_file_path} is empty!")
            return False

        with open(original_file_path, 'rb') as file:
            files = {'file': file}
            headers = {
                'file_path': sanitized_file_path,
                'folderStructure': destination_folder,
                'transformedEntity': transformedEntity,
                'contentlength': str(original_file_size),
                'filename': sanitized_filename
            }
            
            retry_attempts = 10
            response = None
            
            for attempt in range(retry_attempts):
                try:
                    with requests.Session() as session:
                        response = session.post(nifi2Url, files=files, headers=headers, timeout=300)

                    if response.status_code in [503, 504, 422]:
                        print(f"Retrying due to {response.status_code} error (Attempt {attempt+1}/{retry_attempts})")
                        time.sleep(min(2 ** attempt, 5))
                    else:
                        break

                except (requests.ConnectionError, requests.Timeout) as e:
                    print(f"Network error: {str(e)}. Retrying...")
                    time.sleep(1)
                except Exception as e:
                    print(f"Unexpected error: {str(e)} at line {e.__traceback__.tb_lineno}")
                    return
        
        if response is None:
            print("No response received from server")
            return

        response_file_name = filename
        if 'Content-Disposition' in response.headers:
            content_disposition = response.headers['Content-Disposition']
            extracted_filename = re.findall("filename=(.+)", content_disposition)
            if extracted_filename:
                response_file_name = unquote(extracted_filename[0]).strip('"')

        output_file_path = os.path.join(destination_folder, response_file_name)
        # Determine notificationCount based on status
        notification_count = 1 if response.status_code in [200, 201] else 0
        
        # MongoDB Document Entry
        current_time = datetime.datetime.now()
        document = {
            'description': f"{os.path.basename(file_path)} has been processed",
            'STATUS': str(response.status_code),
            'timestamp': current_time,
            'userEmail': loggedInUserId,
            'notificationCount': notification_count
        }

        # Insert the document into MongoDB
        try:
            all_operations.insert_one(document)  # ✅ Only inserting once
            print("Document inserted successfully!")
        except pymongo.errors.DuplicateKeyError as e:
            print(f"Duplicate document detected: {e}")
        except Exception as e:
            print(f"Error inserting document: {e}")

        if response.status_code in [200, 201]:
            document['STATUS'] = "Success"
            message = f"File {sanitized_filename} uploaded successfully."

            with open(output_file_path, "wb") as output_file:
                output_file.write(response.content)

        elif response.status_code in [400, 408]:
            document['STATUS'] = "Bad Request"
            message = f"File {sanitized_filename} encountered a bad request error."

        elif response.status_code == 401:
            document['STATUS'] = "Unauthorized"
            message = f"Unauthorized request for file {sanitized_filename}."

        elif response.status_code == 500:
            document['STATUS'] = "Internal Server Error"
            message = f"Server error encountered for file {sanitized_filename}."

        elif response.status_code in [422, 503, 504]:
            document['STATUS'] = "Temporary Failure"
            message = f"File {sanitized_filename} failed due to {response.status_code} error."

        else:
            document['STATUS'] = "Unknown Error"
            message = f"Unexpected error {response.status_code} for file {sanitized_filename}."

        # ✅ Insert only once in additional collections
        file_collection2.insert_one({'FILE_NAME': response_file_name, 'FILE_PATH': output_file_path, 'STATUS': document['STATUS']})
        user_operations.insert_one(document)

        print(json.dumps({'status': response.status_code, 'message': message}))

    except Exception as e:
        print(f"Critical error: {str(e)} at line {e.__traceback__.tb_lineno}")


def find_directories_recursive(source_folder):
    directories = []
    files = []
    
    print(f"Checking files in: {source_folder}")  # Debug print
    if not os.path.exists(source_folder):
        print(f"Error: Directory {source_folder} does not exist.")
        return []

    for root, dirs, filenames in os.walk(source_folder):
        print(f"Scanning: {root}")  # Debug print
        
        for filename in filenames:
            if filename.endswith('.zip'):
                continue  # Skip ZIPs

            full_path = os.path.join(root, filename)
            print(f"Found file: {full_path}")  # Debug print
            
            files.append({'name': filename, 'path': full_path})
        
        for dir in dirs:
            directories.append(os.path.join(root, dir))
    
    if not files:
        print("No valid files found.")  # Debug print
    return files


def log_to_mongo(zip_path, status_code, status_response, extracted_files_count, total_status_codes_count, status):
    """Insert or update log details in MongoDB."""
    zip_logs_collection.delete_one({"_id": zip_path})  # Remove old entry
    zip_logs_collection.insert_one({
        "_id": zip_path,
        "status_code": status_code,
        "status_response": status_response,
        "extractedFilesCount": extracted_files_count,
        "totalStatusCodesCount": total_status_codes_count,
        "status": status
    })

def count_extracted_files(folder):
    """Recursively count all files inside the extracted folder."""
    total_files = 0
    for _, _, files in os.walk(folder):
        total_files += len(files)
    return total_files

def find_zip_content_files(source_folder):
    """Extract ZIP files and log status to MongoDB."""
    for root, dirs, files in os.walk(source_folder):
        for file in files:
            if file.endswith('.zip'):
                zip_path = os.path.join(root, file)

                # Check if already processed
                existing_log = zip_logs_collection.find_one({"_id": zip_path})
                if existing_log and existing_log.get("status") in ["processed", "unprocessed"]:
                    print(f"Skipping {zip_path}, already {existing_log.get('status')}.")
                    continue

                extract_to = os.path.join(root, "unzipped_" + file[:-4])  
                os.makedirs(extract_to, exist_ok=True)

                print(f"Extracting {zip_path} to {extract_to}")
                try:
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_to)

                    # Count extracted files
                    extracted_files_count = count_extracted_files(extract_to)

                    # Total status code count = total number of files extracted
                    total_status_codes_count = extracted_files_count  

                    # Determine status code based on extracted files
                    if extracted_files_count > 0:
                        status_code, status_response = 200, "success"
                    else:
                        status_code, status_response = 204, "no content"

                    # Determine "processed" or "unprocessed" status
                    if extracted_files_count == total_status_codes_count and extracted_files_count > 0:
                        status = "processed"
                    else:
                        status = "unprocessed"

                    log_to_mongo(zip_path, status_code, status_response, extracted_files_count, total_status_codes_count, status)

                    # Recursively extract nested ZIPs
                    find_zip_content_files(extract_to)

                except zipfile.BadZipFile:
                    log_to_mongo(zip_path, 400, "bad request", 0, 0, "unprocessed")
                    print(f"Error: {zip_path} is a bad zip file.")

                except FileNotFoundError:
                    log_to_mongo(zip_path, 404, "file not found", 0, 0, "unprocessed")
                    print(f"Error: {zip_path} not found.")

                except Exception as e:
                    log_to_mongo(zip_path, 500, "server error", 0, 0, "unprocessed")
                    print(f"Error extracting {zip_path}: {str(e)}")

# System Configuration Variables
HTTP_MAX_THREADS = 200
HTTP_MAX_QUEUE = 100
LIBRE_MAX_THREADS = 20
PYTHON_MAX_THREADS = 20
def get_file_type(file_path):
    if file_path.endswith(tuple(libre_pod)):
        return "document"
    elif file_path.endswith(tuple(python_image_pod)):
        return "image"
    return None


def process_files_threading(source_folder, destination_folder, loggedInUserId):
    try:
        # Extract ZIP files first
        print(f"Extracting ZIP files in : {source_folder}")
        find_zip_content_files(source_folder)
        
        # Re-scan source_folder after extracting ZIPs (to include extracted content)
        files = find_directories_recursive(source_folder)        
        # 🔥 Check if extraction added files
        if not files:
            print(f"Warning: No files found in {source_folder} after ZIP extraction.")
            return
        
        print(f"Total files found: {len(files)}")

        # 🔥 Add recursive handling for folders like `read_files()`
        for file in files:
            file_path = file['path']
            if os.path.isdir(file_path):
                print(f"Found directory: {file_path} - Recursively processing...")
                process_files_threading(file_path, destination_folder, loggedInUserId)  # Recursive call
                continue  # Skip further processing

        thread_pool_size = 50
        check_threshold = 20
        progress_threshold = 100
        task_counter = 0
        processed_files = 0

        # Divide files into two equal parts
        half_index = len(files) // 2
        first_half = files[:half_index]
        second_half = files[half_index:]

        print(f"Files assigned to nifi2: {len(first_half)}")
        print(f"Files assigned to nifi2: {len(second_half)}")

        with ThreadPoolExecutor(max_workers=thread_pool_size) as executor:
            futures = []

            for i in range(max(len(first_half), len(second_half))):
                # Submit first half
                if i < len(first_half):
                    file = first_half[i]
                    file_path = file['path']
                    filename = file['name']
                    transformedEntity = get_file_type(file_path)
                    if not transformedEntity:
                        continue

                    if transformedEntity:
                        file_document = {'FILE_NAME': filename, 'FILE_PATH': file_path, 'STATUS': 'processed'}
                        file_collection.insert_one(file_document)
                        future = executor.submit(upload_document_file_to_nifi2, file_path, filename, destination_folder, loggedInUserId, transformedEntity)
                        futures.append(future)
                        task_counter += 1

                # Submit second half
                if i < len(second_half):
                    file = second_half[i]
                    file_path = file['path']
                    filename = file['name']
                    transformedEntity = get_file_type(file_path)

                    if transformedEntity:
                        file_document = {'FILE_NAME': filename, 'FILE_PATH': file_path, 'STATUS': 'processed'}
                        file_collection.insert_one(file_document)
                        future = executor.submit(upload_document_file_to_nifi2, file_path, filename, destination_folder, loggedInUserId, transformedEntity)
                        futures.append(future)
                        task_counter += 1

            for future in as_completed(futures):
                try:
                    future.result()
                    processed_files += 1
                    if processed_files % progress_threshold == 0 or processed_files == len(files):
                        print(f"Processed {processed_files}/{len(files)} files "
                              f"({(processed_files/len(files)*100):.1f}%)")
                except Exception as e:
                    print(f"Error processing file: {e}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print("Line number: ", e.__traceback__.tb_lineno)

#create log for zip files that are extracted or not
zip_file_path = os.path.join(log_directory, "zip_file.log")
if not os.path.exists(zip_file_path):
    with open(zip_file_path, 'w') as log_file:
        log_file.write("")
        
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Copy files from one folder to another.")
    parser.add_argument("source_folder", help="Path to the source folder")
    parser.add_argument("destination_folder", help="Path to the destination folder")
    parser.add_argument("loggedInUserId", help="Email id of logged in user")

    args = parser.parse_args()

    source_folder = args.source_folder
    destination_folder = args.destination_folder
    loggedInUserId = args.loggedInUserId


    if source_folder is not None and len(source_folder) > 0:
        source_folder.strip()
    if destination_folder is not None and len(destination_folder) > 0:
        destination_folder.strip()

    # Check if the last character is "/"
    if not source_folder.endswith(os.sep):
        source_folder += os.sep

    # Ensure destination_folder ends with the correct OS-specific separator
    if not destination_folder.endswith(os.sep):
        destination_folder += os.sep
    process_files_threading(source_folder, destination_folder, loggedInUserId)



