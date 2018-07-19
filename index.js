const { wsServer } = require('./src/Server'),
    { nextPlayer, makeSomething, playerLeaving, registerOnChange } = require('./src/ChainReactionController');

const send = (conn, p) => conn.sendUTF(JSON.stringify(p));

wsServer.on('request', (request) => {
    const conn = request.accept(null, request.origin);
    const thisPlayer = nextPlayer();
    send(conn, { player: thisPlayer });

    registerOnChange(m => send(conn, m));
    conn.on('message', makeSomething(thisPlayer, conn));
    conn.on('close', playerLeaving(thisPlayer));
    conn.on('disconnect', playerLeaving(thisPlayer));
});