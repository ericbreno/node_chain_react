const { SquareImp } = require('./SquareImp');
const BLANK = 0;

const makeArr = (count, arr = []) => count-- && makeArr(count, arr.concat([0])) || arr;

function BoardImp(width, height, players = 2) {
    this.width = width;
    this.height = height;
    this.players = players + 1;
    this.playersCounts = makeArr(this.players);
    this.nextPlayer = 1;
    this.initMatrix();
}

BoardImp.prototype.initMatrix = function () {
    this.matrix = [];
    for (let x = 0; x < this.width; x++) {
        const row = [];
        const viewRow = [];
        for (let y = 0; y < this.height; y++) {
            row.push(new SquareImp(x, y, this.width, this.height));
            viewRow.push(new SquareImp(x, y, this.width, this.height));
        }
        this.matrix.push(row);
    }
};

BoardImp.prototype.evaluateBoard = function (sqrChanged, actualPlayer) {
    const oldPlayer = sqrChanged.player;
    // jogador antigo perde a posição
    this.playersCounts[oldPlayer] -= sqrChanged.size;

    sqrChanged.size++;
    sqrChanged.player = actualPlayer;
    // jogador da vez ganha as peças
    this.playersCounts[actualPlayer] += sqrChanged.size;

    if (!sqrChanged.mayExplode()) { return; }

    // explodiu
    this.playersCounts[actualPlayer] -= sqrChanged.size;
    sqrChanged.size = 0;
    sqrChanged.player = BLANK;

    if (this.hasWinner()) { return; }

    const posicoesLaterais = sqrChanged
        .getSides()
        .map(side => this.matrix[side[0]][side[1]]);

    posicoesLaterais.forEach(sideSqr => {
        this.evaluateBoard(sideSqr, actualPlayer);
    });
};

BoardImp.prototype.update = function (y, x, player) {
    if (player != this.nextPlayer) {
        console.log('invalid player', player, this.nextPlayer);
        return false;
    }

    const isInvalidIndex = x > this.width || y > this.height;
    if (isInvalidIndex) {
        console.log('invalid index');
        return false;
    }

    const sqr = this.matrix[x][y];
    const isInvalidPosition = sqr.player != BLANK && sqr.player != player;
    if (isInvalidPosition) {
        console.log('invalid position');
        return false;
    }

    if (this.hasWinner()) {
        console.log('game ended');
        return false;
    }

    this.evaluateBoard(sqr, player);
    if (!this.hasWinner())
        this.nextPlayer = Math.max(((this.nextPlayer + 1) % this.players), 1);
    return true;
};

BoardImp.prototype.hasWinner = function () {
    const playerThatHaveMoreThanOneBall = this.playersCounts.reduce((ac, it, index) => it > 1 && index || ac, 0);
    const onlyAbovePlayerHasBalls = this.playersCounts.every((it, index) => it === 0 || index === playerThatHaveMoreThanOneBall);
    const someonePlayed = playerThatHaveMoreThanOneBall != BLANK;
    return someonePlayed && onlyAbovePlayerHasBalls;
};

module.exports = { BoardImp };
