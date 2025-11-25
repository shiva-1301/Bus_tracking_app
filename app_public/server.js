// Import the Express framework
const express = require('express');
const path = require('path');
const app = express();

// Render sets the environment port, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// CRITICAL STEP: Set the static file directory to the Angular production output
// The path must point to where the 'ng build' command placed the files.
// Assuming your angular.json output is 'dist/app-public' inside the app_public folder:
const buildPath = path.join(__dirname, 'dist', 'app-public', 'browser'); 
// NOTE: Depending on your specific Angular version/config, 
// the path might just be path.join(__dirname, 'dist', 'app-public') or just path.join(__dirname, 'dist')

app.use(express.static(buildPath));

// CRITICAL STEP: Handle all client-side routing (SPA fallback)
// For any path not found in the static files, serve the main index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node server listening on port ${PORT}`);
});