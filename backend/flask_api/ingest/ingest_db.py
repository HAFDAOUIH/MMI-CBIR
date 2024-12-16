import requests
import os

# Set your backend URL here
backend_url = 'http://localhost:5000/api/images/upload'

# Folder containing your images
image_folder = '/home/hafdaoui/Downloads/RSSCN7-master/aGrass'

# Category to which you want to upload the images
category = 'Grass'

# Fetch all images in the folder with proper extensions
images = [f for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg', '.jpeg'))]

# Error handling: check if the folder has images
if not images:
    print("Error: No images found in the folder!")
    exit()

# Limit the images to one for testing
images = images[:1]  # Upload only one image for testing

# Test with one image
def upload_single_image():
    """Upload a single image to test the endpoint."""
    image = images[0]
    image_path = os.path.join(image_folder, image)

    # Validate the file exists
    if not os.path.exists(image_path):
        print(f"Error: Image file {image_path} does not exist.")
        return

    print(f"Attempting to upload image: {image_path}")

    # Prepare data and file
    data = {'category': category}
    files = {'images': (image, open(image_path, 'rb'))}

    try:
        response = requests.post(backend_url, data=data, files=files)
        # Close the file after uploading
        files['images'][1].close()

        # Check response
        if response.status_code == 200:
            print(f"Successfully uploaded image: {image}")
        else:
            print(f"Failed to upload image: {image}")
            print(f"Status Code: {response.status_code}")
            print("Response Error:", response.text)



    except requests.exceptions.RequestException as e:
        print(f"Request failed for image {image}: {e}")
    except Exception as e:
        print(f"Unexpected error occurred: {e}")

# Run the test
upload_single_image()
