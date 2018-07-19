const { BoardImp } = require('./ChainReaction');

let players = 2;
let onChange = () => { };

let board;
const makeBoard = (x = 5, y = 5, p = players) => {
    players = p;
    board = new BoardImp(x, y, p);
    board.onChange = () => onChange();
    onChange();
}

makeBoard();

const used = [];
const nextPlayer = () => {
    let temp = 1;
    console.log(used);
    while (temp <= players && used.includes(temp)) {
        temp++;
    }
    console.log('new player connected, getting color', temp);
    used.push(temp);
    if (temp <= players) {
        makeBoard();
    }
    return temp;
};

const releasePlayer = player => {
    used.splice(used.indexOf(player), 1);
};

const makeSomething = (thisPlayer, conn) => message => {
    console.log('parsing', message);
    const json = JSON.parse(message.utf8Data);
    if (json.jogada) {
        const jogada = json.jogada;
        board.update(jogada.x, jogada.y, thisPlayer);
    } else if (json.boardSetting) {
        const setting = json.boardSetting;
        makeBoard(setting.x, setting.y, setting.p);
    }
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
