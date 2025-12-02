// import fetch from 'node-fetch'; // Using native fetch

const checkMusic = async () => {
    // Try new URL formats
    const urls = [
        'http://localhost:5173/music_1.mpeg',
        'http://localhost:5173/music_2.mpeg',
    ];

    for (const url of urls) {
        try {
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            console.log(`Status: ${response.status}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);

            if (response.ok && response.headers.get('content-type') !== 'text/html') {
                console.log('SUCCESS: File is accessible and likely audio.');
            } else {
                console.log('FAILURE: File not found or served as HTML.');
            }
        } catch (error) {
            console.error('Error fetching:', error.message);
        }
        console.log('---');
    }
};

checkMusic();
