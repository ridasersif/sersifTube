# SersifTube

A professional, premium-designed YouTube downloader application.

## Prerequisites

*   **Node.js**: [Download & Install](https://nodejs.org/) (Version 16+ recommended).
*   **FFmpeg**: (Optional but Recommended) Required for merging video+audio and non-standard formats.
    *   Download from [ffmpeg.org](https://ffmpeg.org/download.html).
    *   Extract and add the `bin` folder to your system PATH.
    *   Or place `ffmpeg.exe` inside a `bin` folder in the project root: `sersifTube/bin/ffmpeg.exe`.

## Installation

1.  **Server Setup**:
    Open a terminal in the `server` folder:
    ```powershell
    cd server
    npm install
    ```

2.  **Client Setup**:
    Open a separate terminal in the `client` folder:
    ```powershell
    cd client
    npm install
    ```

## Running the Application

You need to run **both** the server and the client simultaneously.

**1. Start the Server (Backend)**
In the `server` terminal:
```powershell
npm start
```
*The server will run on `http://localhost:5000`.*

**2. Start the Client (Frontend)**
In the `client` terminal:
```powershell
npm run dev
```
*The client will run on `http://localhost:3000`.*

## Download Location

Files will be downloaded to your standard Downloads folder:
*   `C:\Users\YourUser\Downloads\sersifTube\videos`
*   `C:\Users\YourUser\Downloads\sersifTube\audios`
*   `C:\Users\YourUser\Downloads\sersifTube\playlists`

## Troubleshooting

*   **Connection Refused**: Ensure the server is running on port 5000.
*   **Download Failed**: Check the server console logs. If it says "ffmpeg not found", please install FFmpeg.
