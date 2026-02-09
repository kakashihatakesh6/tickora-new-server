const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/movies',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode === 200) {
                const movies = JSON.parse(data);
                console.log(`Movies count: ${movies.length}`);
                if (movies.length > 0) {
                    console.log('First movie:', JSON.stringify(movies[0], null, 2));
                }
            } else {
                console.log('Response:', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.end();
