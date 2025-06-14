# DropVault - Secure File Sharing

DropVault is a modern, secure, and anonymous file sharing application designed for temporary and confidential data exchange. It allows users to upload files with advanced security features such as optional password protection, time-based expiration, and download limits, ensuring that shared content vanishes without a trace after its intended use.

## Features

*   **Secure Uploads**: Upload files with optional password protection.
*   **Password Protection**: Secure your shared files with an optional password.
*   **Self-Destruct Timers**: Files automatically delete after a specified time period (e.g., 1 hour, 1 day, 1 week).
*   **Download Limits**: Set a maximum number of downloads before a file is automatically deleted.
*   **Anonymous Sharing**: No accounts or personal information required for sharing.
*   **QR Code Sharing**: Easily share files via scannable QR codes for mobile access.
*   **Real-time Statistics**: View live statistics on total files uploaded, downloads, and daily activity.
*   **Responsive Design**: A clean, modern, and responsive user interface built with Tailwind CSS.

## Technologies Used

*   **Frontend**: React.js, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **State Management**: React Hooks
*   **QR Code Generation**: `qrcode` library
*   **Backend/Database/Storage**: Supabase (PostgreSQL, Storage)
*   **Deployment**: Netlify (for frontend hosting and redirects)

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd dropvault-secure-sharing
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Supabase**:
    *   Create a new Supabase project.
    *   Configure your `shared_files` table and RLS policies as per the provided schema.
    *   Create a storage bucket named `dropvault-files`.
    *   Add your Supabase URL and Anon Key to a `.env` file in the project root:
        ```
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application will be accessible at `http://localhost:5173`.

## Usage

1.  **Select Files**: Drag and drop files or browse to select them.
2.  **Set Security Options**: Optionally add a password, set an auto-destruct timer, or limit the number of downloads.
3.  **Upload**: Click the "Secure & Share" button to upload your files.
4.  **Share**: Once uploaded, you'll receive a shareable link and a QR code. Share these with your intended recipients.
5.  **Download**: Recipients can access the file via the link, entering a password if required, and download it. The file will automatically expire based on your settings.

---
