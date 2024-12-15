import requests
import os

# Set your backend URL here
backend_url = 'http://localhost:5000/api/images/upload'

# Folder containing your images (make sure the images are inside the folder)
image_folder = 'RSSCN7-master/aGrass'

# Category to which you want to upload the images
category = 'Grass'

# Prepare the list of images to upload (we'll grab all files from the folder)
images = [f for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg', '.jpeg'))]

# Check if there are more than 400 images (if you want to limit the upload to 400)
images = images[:400]  # Limit to 400 images

# Create a dictionary for the category
data = {'category': category}

# Prepare the files to be uploaded
files = [('images', (image, open(os.path.join(image_folder, image), 'rb'))) for image in images]

# Send the POST request to upload the images
response = requests.post(backend_url, data=data, files=files)

# Close file handles after upload
for _, file in files:
    file[1].close()

# Check if the upload was successful
if response.status_code == 200:
    print(f"Successfully uploaded {len(images)} images to category {category}.")
else:
    print(f"Failed to upload images. Status Code: {response.status_code}")
    print(response.text)