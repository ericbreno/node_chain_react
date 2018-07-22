const { wsServer } = require('./src/Server'),
    { nextPlayer, resetBoard } = require('./src/ChainReactionController'),
    { PubSub } = require('./src/PubSub');

const send = (conn, p) => conn.sendUTF(JSON.stringify(p));

wsServer.on('request', (request) => {
    const conn = request.accept(null, request.origin);
    const player = nextPlayer();
    
    PubSub.registerConnection(conn, player);
    // sends player identification only to this connection
    send(conn, { player });

    resetBoard();
});