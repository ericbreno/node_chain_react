const { BoardImp } = require('./ChainReaction');

const players = 2;
let onChange = () => {};

const boardX = 5, boardY = 5;
let board;
const makeBoard = () => {
    board = new BoardImp(boardX, boardY, players);
    board.onChange = () => onChange();
    onChange();
}

makeBoard();

const used = {};
const nextPlayer = () => {
    let temp = players;
    while (temp && used[temp]) {
        temp--;
    }
    console.log('new player connected, getting color', temp);
    used[temp] = true;
    if (temp > 0) {
        makeBoard();
    }
    return temp && (players - temp + 1);
};

const releasePlayer = player => {
    used[player] = false;
};

const makeSomething = (thisPlayer, conn) => message => {
    console.log('parsing', message);
    const json = JSON.parse(message.utf8Data);
    board.update(json.x, json.y, thisPlayer);
};

const playerLeaving = (thisPlayer) => () => {
    releasePlayer(thisPlayer);
    console.log('old player', thisPlayer, 'disconnected');
};

const registerOnChange = cb => {
    const old = onChange;
    onChange = () => {
        old();
        cb(board);
    };
    cb(board);
};

module.exports = {
    nextPlayer,
    releasePlayer,
    makeSomething,
    playerLeaving,
    registerOnChange
};
