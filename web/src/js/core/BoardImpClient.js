app.factory('BoardImp', ['$timeout', function ($timeout) {
    const BLANK = 0;

    function SquareImp(sqrJson) {
        Object.assign(this, sqrJson);
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

    function BoardImp(jsonBoard) {
        Object.assign(this, jsonBoard);
        this.matrix = this.matrix.map(row => row.map(sqr => new SquareImp(sqr)));
    }

    BoardImp.prototype.evaluateBoard = function (sqrChanged, actualPlayer, delay = 150) {
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
            $timeout(
                () => this.evaluateBoard(sideSqr, actualPlayer, delay),
                delay
            );
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

        this.nextPlayer = Math.max(((this.nextPlayer + 1) % this.players), 1);
        this.evaluateBoard(sqr, player);
        return true;
    };

    BoardImp.prototype.hasWinner = function () {
        const playerThatHaveMoreThanOneBall = this.playersCounts.reduce((ac, it, index) => it > 1 && index || ac, 0);
        const onlyAbovePlayerHasBalls = this.playersCounts.every((it, index) => it === 0 || index === playerThatHaveMoreThanOneBall);
        const someonePlayed = playerThatHaveMoreThanOneBall != BLANK;
        return someonePlayed && onlyAbovePlayerHasBalls;
    };

    return BoardImp;
}]);