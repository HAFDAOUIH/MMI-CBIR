
# MMI-CBIR: Content-Based Image Retrieval System

This project implements a Content-Based Image Retrieval (CBIR) system with and without relevance feedback. The CBIR system supports image upload, categorization, transformation, and descriptor-based similarity search, with a focus on visual content analysis.

## Features

- **Image Upload and Management**:
  - Upload single or multiple images with category assignment.
  - Delete or download uploaded images.
  - Organize images by predefined categories (`Grass`, `Field`, `Industry`, `RiverLake`, `Forest`, `Resident`, `Parking`).

- **Visual Content Descriptors**:
  - RGB color histograms.
  - Dominant colors using K-Means clustering.
  - Texture descriptors with Gabor filters.
  - Shape analysis with Hu Moments.
  - Advanced descriptors:
    - GLCM (Gray-Level Co-Occurrence Matrix) features.
    - Edge histogram features.

- **Relevance Feedback**:
  - Perform simple search or enhanced search with user feedback.
  - Utilize feedback to refine query results iteratively.

- **Image Transformation**:
  - Crop and scale images directly within the application.

- **Visualization**:
  - Display descriptor data with interactive charts (e.g., histograms, radar charts).
  - Highlight texture and contour regions visually.

## Technologies

- **Frontend**:
  - Angular: Dynamic user interface.
  - Chart.js: Descriptor visualization.
  - Bootstrap: Styling.

- **Backend**:
  - Node.js with Express: REST API for image management.
  - Flask: Descriptor computation services using OpenCV and scikit-image.
  - MongoDB: Image metadata and descriptor storage.

- **Image Processing**:
  - OpenCV: Image feature extraction.
  - scikit-image: Texture and edge analysis.

- **Stack**: MEAN (MongoDB, Express, Angular, Node.js)

## Installation

### Prerequisites
- Node.js and npm
- Python (3.8+)
- MongoDB
- Required Python libraries: `opencv-python`, `numpy`, `scikit-image`, `flask`, `scikit-learn`

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/HAFDAOUIH/MMI-CBIR.git
   cd MMI-CBIR
   ```

2. **Backend Setup**:
   - Install dependencies:
     ```bash
     cd backend
     npm install
     ```
   - Configure MongoDB:
     - Update `MONGO_URI` in `backend/src/config/db.js` if needed.
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Flask API Setup**:
   - Install dependencies:
     ```bash
     cd flask-api
     pip install -r requirements.txt
     ```
   - Start the Flask server:
     ```bash
     python app.py
     ```

4. **Frontend Setup**:
   - Install Angular CLI globally (if not already installed):
     ```bash
     npm install -g @angular/cli
     ```
   - Navigate to the `frontend` folder and install dependencies:
     ```bash
     cd frontend
     npm install
     ```
   - Start the frontend server:
     ```bash
     ng serve
     ```

5. **Access the Application**:
   - Open [http://localhost:4200](http://localhost:4200) in your browser.

## Usage

1. Upload images to specific categories.
2. View uploaded images in the gallery.
3. Analyze descriptors of an image by clicking it.
4. Perform similarity search using visual descriptors.
5. Use the relevance feedback loop for refined searches.

## Project Structure

- **Frontend**:
  - `src/app/components`: UI components like `UploadModal`, `ImageCard`, and `CategoryMenu`.
  - `src/app/pages/dashboard`: Main page for gallery and search.
  - `src/app/services`: Angular services for API integration.

- **Backend**:
  - `src/models/Image.js`: Mongoose schema for images.
  - `src/controllers/imageController.js`: Image upload, retrieval, and descriptor management.
  - `src/routes/images.js`: API routes for image operations.
  - `src/config/db.js`: MongoDB connection configuration.

- **Flask API**:
  - `app.py`: Computes image descriptors using OpenCV and scikit-image.

## Future Improvements

- Extend relevance feedback to include semi-supervised learning.
- Support large-scale datasets with optimized storage and retrieval.
- Add additional transformations like rotation and filtering.
