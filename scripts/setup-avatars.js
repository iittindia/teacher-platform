const fs = require('fs');
const path = require('path');
const https = require('https');

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Sample avatar URLs from a placeholder service
const avatarUrls = [
  'https://i.pravatar.cc/150?img=1',  // teacher1.jpg
  'https://i.pravatar.cc/150?img=32',  // principal1.jpg
  'https://i.pravatar.cc/150?img=45',  // teacher2.jpg
  'https://i.pravatar.cc/150?img=60',  // coordinator1.jpg
  'https://i.pravatar.cc/150?img=22'   // teacher3.jpg
];

// Download function
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
};

// Download all avatars
async function downloadAvatars() {
  try {
    const filenames = ['teacher1.jpg', 'principal1.jpg', 'teacher2.jpg', 'coordinator1.jpg', 'teacher3.jpg'];
    
    for (let i = 0; i < avatarUrls.length; i++) {
      const url = avatarUrls[i];
      const filename = path.join(avatarsDir, filenames[i]);
      console.log(`Downloading ${filename}...`);
      await downloadImage(url, filename);
    }
    
    console.log('All avatars downloaded successfully!');
  } catch (error) {
    console.error('Error downloading avatars:', error);
  }
}

downloadAvatars();
