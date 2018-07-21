const { SquareImp } = require('./SquareImp');
const BLANK = 0;

const makeArr = (count, arr = []) => count-- && makeArr(count, arr.concat([0])) || arr;

function BoardImp(width, height, players = 2) {
    this.width = width;
    this.height = height;
    this.players = players + 1;
    this.playersCounts = makeArr(this.players);
    console.log('making board for', this.players);
    this.nextPlayer = 1;
    this.initMatrix();
    this.onChange = () => { };
}

BoardImp.prototype.initMatrix = function () {
    this.matrix = [];
    this.viewMatrix = [];
    for (let x = 0; x < this.width; x++) {
        const row = [];
        const viewRow = [];
        for (let y = 0; y < this.height; y++) {
            row.push(new SquareImp(x, y, this.width, this.height));
            viewRow.push(new SquareImp(x, y, this.width, this.height));
        }
        this.matrix.push(row);
        this.viewMatrix.push(viewRow);
    }
};

BoardImp.prototype.evaluateBoard = function (initialSqr) {
    /**
     * Politica de atualização do tabuleiro:
     * 1. Verificar square atualizado
     * 2. Se explodir, verificar para todos vizinhos (rec)
     * 3. Se não explodir, fim
     */
    const toProccess = [initialSqr];
    const delayUp = 150;
    let iteracao = 0;
    const PLAYER_ACTIVE = initialSqr.player;
    while (toProccess.length > 0) {
        iteracao++;
        const sqrChanged = toProccess.shift();

        if (!sqrChanged.mayExplode()) {
            const N_SIZE_BASE = sqrChanged.size;
            const N_COLOR_BASE = sqrChanged.player;
            setTimeout(() => {
                this.viewMatrix[sqrChanged.x][sqrChanged.y].size = N_SIZE_BASE;
                this.viewMatrix[sqrChanged.x][sqrChanged.y].player = N_COLOR_BASE;
                this.onChange();
            }, iteracao * delayUp);
            continue;
        }

        // explodiu
        this.playersCounts[sqrChanged.player] -= sqrChanged.size;
        sqrChanged.size = 0;
        sqrChanged.player = BLANK;

        setTimeout(() => {
            this.viewMatrix[sqrChanged.x][sqrChanged.y].size = 0;
            this.viewMatrix[sqrChanged.x][sqrChanged.y].player = BLANK;
            this.onChange();
        }, iteracao * delayUp);

        if (this.hasWinner()) { continue; }

        const posicoesLaterais = sqrChanged
            .getSides()
            .map(side => this.matrix[side[0]][side[1]]);

        posicoesLaterais.forEach(sideSqr => {
            // jogador antigo perde a posição
            this.playersCounts[sideSqr.player] -= sideSqr.size;
            sideSqr.size++;
            sideSqr.player = PLAYER_ACTIVE;
            // jogador da vez ganha as peças
            this.playersCounts[sideSqr.player] += sideSqr.size;

            const N_SIZE = sideSqr.size;
            const N_COLOR = sideSqr.player;
            setTimeout(() => {
                this.viewMatrix[sideSqr.x][sideSqr.y].size = N_SIZE;
                this.viewMatrix[sideSqr.x][sideSqr.y].player = N_COLOR;
                this.onChange();
            }, iteracao * delayUp);

            if (sideSqr.mayExplode()) {
                toProccess.unshift(sideSqr);
            } else {
                toProccess.push(sideSqr);
            }
        });
    };
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

    this.nextPlayer = Math.max(((this.nextPlayer + 1) % this.players), 1);
    this.onChange();

    sqr.player = player;
    sqr.size++;
    this.playersCounts[player]++;
    this.evaluateBoard(sqr);
    return true;
};

BoardImp.prototype.hasWinner = function () {
    const playerThatHaveMoreThanOneBall = this.playersCounts.reduce((ac, it, index) => it > 1 && index || ac, 0);
    const onlyAbovePlayerHasBalls = this.playersCounts.every((it, index) => it === 0 || index === playerThatHaveMoreThanOneBall);
    const someonePlayed = playerThatHaveMoreThanOneBall != BLANK;
    return someonePlayed && onlyAbovePlayerHasBalls;
};

module.exports = { BoardImp };
