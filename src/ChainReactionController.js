const { BoardImp } = require('./BoardImp'),
    {
        PubSub
        , LEAVING_CHANNEL
        , BOARD_CHANNEL
        , PLAY_CHANNEL
        , SETTING_CHANNEL
        , UPDATE_PLAY_CHANNEL
    } = require('./PubSub');

let qttPlayers = 0;
let board;
let confirmBoardState = () => {
    PubSub.pub(BOARD_CHANNEL, board);
};

const makeBoard = (x, y) => {
    board = new BoardImp(x, y, qttPlayers);
};

const used = [];
const nextPlayer = () => {
    let temp = 1;
    console.log(used);
    while (used.includes(temp)) {
        temp++;
    }
    used.push(temp);
    qttPlayers++;

    console.log('new player connected, getting color', temp);
    return temp;
};

const releasePlayer = player => {
    used.splice(used.indexOf(player), 1);
    qttPlayers--;
    resetBoard();

    console.log('releasing player', player);
};

const resetBoard = (x = 5, y = 5) => {
    makeBoard(x, y);
    confirmBoardState();

    console.log('resetting board');
};

PubSub.sub(PLAY_CHANNEL, jogada => {
    const success = board.update(jogada.x, jogada.y, jogada._player);
    if (success) {
        PubSub.pub(UPDATE_PLAY_CHANNEL, Object.assign({}, jogada, { player: jogada._player }))
    }
});

PubSub.sub(SETTING_CHANNEL, setting => {
    resetBoard(setting.x, setting.y);
});

PubSub.sub(LEAVING_CHANNEL, ({ player }) => {
    releasePlayer(player);
});

module.exports = {
    nextPlayer,
    resetBoard
};
