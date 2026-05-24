const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://www.youtube.com/playlist?list=PLB36tGFyJB5F-8DeUd1aZKQKng02tg9Z8';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const match = data.match(/var ytInitialData = ({.*?});<\/script>/);
    if (match) {
      try {
        const json = JSON.parse(match[1]);
        const playlistVideoListRenderer = json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
        
        const videos = playlistVideoListRenderer.contents.map(item => {
          if (!item.playlistVideoRenderer) return null;
          const video = item.playlistVideoRenderer;
          return {
            videoId: video.videoId,
            title: video.title.runs[0].text,
            length: video.lengthText ? video.lengthText.simpleText : '',
            thumbnail: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`, // Use standardized high quality thumbnails
            index: video.index.simpleText
          };
        }).filter(Boolean);
        
        const dir = path.join(__dirname, 'src', 'data');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(dir, 'collaborations.json'), JSON.stringify(videos, null, 2));
        console.log(`Successfully scraped ${videos.length} videos and saved to src/data/collaborations.json`);
      } catch (e) {
        console.error('Error parsing JSON:', e.message);
      }
    } else {
      console.log('Could not find ytInitialData in response.');
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
