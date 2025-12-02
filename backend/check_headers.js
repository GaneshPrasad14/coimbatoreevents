// import fetch from 'node-fetch'; // Using native fetch

const checkHeaders = async () => {
    // Use a known existing image or try to list one
    // For now, I'll try to hit the uploads directory or a specific file if I know one.
    // I'll use the filename from the user's error message: optimized_1762155021404_IMG_4483.JPG
    // And also the one from the upload response: optimized_1764592236914_IMG_3466.PNG

    const url = 'http://localhost:5001/uploads/optimized/optimized_1764592236914_IMG_3466.PNG';

    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url);

        console.log('Status:', response.status);
        console.log('Headers:');
        response.headers.forEach((value, name) => {
            console.log(`${name}: ${value}`);
        });

        if (response.headers.get('cross-origin-resource-policy') === 'cross-origin') {
            console.log('\nSUCCESS: CORP header is present and correct.');
        } else {
            console.log('\nFAILURE: CORP header is MISSING or INCORRECT.');
        }

    } catch (error) {
        console.error('Error fetching image:', error);
    }
};

checkHeaders();
