const fs = require('fs');
const https = require('https');

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
    // Extract ytInitialData
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
            thumbnail: video.thumbnail.thumbnails[0].url,
            index: video.index.simpleText
          };
        }).filter(Boolean);
        
        console.log(JSON.stringify(videos, null, 2));
      } catch (e) {
        console.error('Error parsing JSON:', e.message);
        // Fallback search in HTML
        fs.writeFileSync('youtube_response.html', data);
        console.log('Saved response to youtube_response.html for inspection.');
      }
    } else {
      console.log('Could not find ytInitialData in response.');
      fs.writeFileSync('youtube_response.html', data);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
