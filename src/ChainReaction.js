
const BLANK = 0;

function SquareImp(x, y, width, height) {
    this.player = BLANK;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.size = 0;
}

SquareImp.prototype.isCorner = function () {
    return this.x === 0 && this.y === 0
        || this.x === (this.width - 1) && this.y === 0
        || this.x === 0 && this.y === (this.height - 1)
        || this.x === (this.width - 1) && this.y === (this.height - 1);
};

SquareImp.prototype.isWall = function () {
    return !this.isCorner() &&
        (this.x === 0
            || this.y === 0
            || this.x === (this.width - 1)
            || this.y === (this.height - 1));
};

SquareImp.prototype.getIcon = function () {
    return this.size > 2 ? "triple.png" : this.size > 1 ? "double.png" : this.size > 0 ? "single.png" : "blank.png";
};

SquareImp.prototype.mayExplode = function () {
    return this.isCorner() && this.size >= 2
        || this.isWall() && this.size >= 3
        || this.size >= 4;
};

SquareImp.prototype.getSides = function () {
    const sides = [
        [this.x + 1, this.y],
        [this.x, this.y + 1],
        [this.x - 1, this.y],
        [this.x, this.y - 1]
    ];
    return sides.filter((side) =>
        side[0] >= 0
        && side[1] >= 0
        && side[0] < this.width
        && side[1] < this.height
    );
};

function BoardImp(width, height, players = 2) {
    this.width = width;
    this.height = height;
    this.players = players + 1;
    this.nextPlayer = 1;
    this.initMatrix();
    this.onChange = () => {};
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
        const sqrChanged = toProccess.shift();
        const limiteIteracoesAtingido = iteracao++ > Math.pow(this.width, 6);
        if (limiteIteracoesAtingido) { break; }

        const N_SIZE_BASE = sqrChanged.size;
        const N_COLOR_BASE = sqrChanged.player;
        setTimeout(() => {
            this.viewMatrix[sqrChanged.x][sqrChanged.y].size = N_SIZE_BASE;
            this.viewMatrix[sqrChanged.x][sqrChanged.y].player = N_COLOR_BASE;
            this.onChange();
        }, iteracao * delayUp);

        if (!sqrChanged.mayExplode()) { continue; }

        // explodiu
        sqrChanged.size = 0;
        sqrChanged.player = BLANK;

        setTimeout(() => {
            this.viewMatrix[sqrChanged.x][sqrChanged.y].size = 0;
            this.viewMatrix[sqrChanged.x][sqrChanged.y].player = BLANK;
            this.onChange();
        }, iteracao * delayUp);

        const posicoesLaterais = sqrChanged
            .getSides()
            .map(side => this.matrix[side[0]][side[1]]);

        posicoesLaterais.forEach(sideSqr => {
            sideSqr.size++;
            sideSqr.player = PLAYER_ACTIVE;

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
    this.evaluateBoard(sqr);
    return true;
};

BoardImp.prototype.hasWinner = function () {
    return false;
};

module.exports = { BoardImp };
