# SafeLink - URL Threat Detection App

SafeLink is a mobile application built with React Native (Expo) and a Node.js/Express backend to help users scan and detect dangerous URLs like phishing and malware using AI.

---

## 1. What the System Does

- **User Authentication:** Users can create an account and log in securely using encrypted passwords and JWT tokens.
- **URL Scanning:** Users can paste any link to check if it is Safe, Suspicious, or Malicious. The scan uses OpenAI (with a fallback check) to give a risk score from 0 to 100 and an explanation.
- **Scan History:** Saves all previous scans so the user can review them or delete records.
- **Report Threats:** Users can select a scanned link from a dropdown list to report it, choose the threat reason, write comments, and attach a screenshot evidence.

---

## 2. Technologies Used

### Backend
- Node.js & Express (TypeScript)
- MongoDB & Mongoose (Database)
- JWT & bcrypt (Authentication)
- OpenAI API (URL Analysis)
- Multer & Cloudinary (Screenshot Uploads)

### Mobile (Frontend)
- React Native with Expo
- NativeWind (Tailwind CSS) for styling
- Expo Vector Icons (Ionicons)
- AsyncStorage for saving user login state
- Expo Image Picker for uploading screenshots

---

## 3. Main API Endpoints

### Auth:
- `POST /api/auth/register` - Create a new user
- `POST /api/auth/login` - Log in and get token

### Scans:
- `POST /api/scans` - Scan a URL with AI
- `GET /api/scans/history` - Get user's scan history
- `DELETE /api/scans/:id` - Delete a scan from history

### Reports:
- `POST /api/reports` - Send a threat report with screenshot
- `GET /api/reports` - View all submitted reports
- `PATCH /api/reports/:id/status` - Update report status

---

## 4. How to Run the Project

### Step 1: Run Backend
1. Open terminal and go to backend folder:
   ```bash
   cd safelink-backend
2. Install package:
   ```bash
   npm install
3.Create a `.env` file in the backend folder and add your keys (like in `.env.example`):
  ```env
   PORT=5000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  OPENAI_API_KEY=your_openai_api_key
```
4.Start the server:
  ```bash
    npm run dev
```
### Step 2: Run Mobile App
1. Open a new terminal and go to mobile folder:
  ```bash
   cd safelink-mobile
```
2. install package:
    ```bash
   npm install
    ```
3. Make sure the backend IP in src/config/api.ts matches your computer's local IP:
    ```bash
     export const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
    ```
4.Start the Expo app:
   ```bash
    npx expo start -c
```
