const WebSocketServer = require('websocket').server,
    http = require('http'),
    fs = require('fs');

const port = process.env.port || 1337;

const readFile = (path = '/index.html') => fs.readFileSync(`web${path}`);
const httpServer = http.createServer((request, response) => {
    if (request.url === '/') {
        response.writeHead(200, { 'content-type': 'text/html' });
        response.write(readFile());
    } else if (request.url.endsWith('.js')) {
        response.writeHead(200, { 'content-type': 'text/javascript' });
        response.write(readFile(request.url));
    } else if (request.url.match(/(\/src\/assets\/.*)/g)) {
        response.writeHead(200, {'content-type': 'image/svg+xml'});
        response.write(readFile(request.url));
    }
    response.end();
});
httpServer.listen(port, () => { console.log('Server running on', port) });

wsServer = new WebSocketServer({ httpServer });

module.exports.wsServer = wsServer;