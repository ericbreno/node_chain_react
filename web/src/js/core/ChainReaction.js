
app.factory('BoardImp', ['$timeout', function ($timeout) {
    var Colors;
    (function (Colors) {
        Colors["Blank"] = "white";
        Colors["Blue"] = "light-blue";
        Colors["Yellow"] = "yellow";
        Colors["Red"] = "red";
        Colors["Green"] = "light-green";
    })(Colors || (Colors = {}));

    function SquareImp(color, x, y, width, height) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.size = 0;
    }

    SquareImp.prototype.isCorner = function () {
        return this.x === 0 && this.y === 0
            || this.x === this.width && this.y === 0
            || this.x === 0 && this.y === this.height
            || this.x === this.width && this.y === this.height;
    };

    SquareImp.prototype.isWall = function () {
        return !this.isCorner() &&
            (this.x === 0
                || this.y === 0
                || this.x === this.width
                || this.y === this.height);
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
            && side[0] <= this.width
            && side[1] <= this.height
        );
    };

    function BoardImp(width, height) {
        this.width = width;
        this.height = height;
        this.initMatrix();
    }

    BoardImp.prototype.initMatrix = function () {
        this.matrix = [];
        this.viewMatrix = [];
        for (let x = 0; x <= this.width; x++) {
            const row = [];
            const viewRow = [];
            for (let y = 0; y <= this.height; y++) {
                row.push(new SquareImp(Colors.Blank, x, y, this.width, this.height));
                viewRow.push(new SquareImp(Colors.Blank, x, y, this.width, this.height));
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
        while (toProccess.length > 0) {
            const sqrChanged = toProccess.shift();
            const limiteIteracoesAtingido = iteracao++ > Math.pow(this.width, 6);
            if (limiteIteracoesAtingido) { break; }

            $timeout(() => (this.viewMatrix[sqrChanged.x][sqrChanged.y].size = sqrChanged.size), iteracao * delayUp);

            if (!sqrChanged.mayExplode()) { continue; }

            sqrChanged.size = 0;

            $timeout(() => (this.viewMatrix[sqrChanged.x][sqrChanged.y].size = 0), iteracao * delayUp);

            const posicoesLaterais = sqrChanged
                .getSides()
                .map(side => this.matrix[side[0]][side[1]]);

            posicoesLaterais.forEach(sideSqr => {
                sideSqr.size++;
                $timeout(() => this.viewMatrix[sideSqr.x][sideSqr.y].size++, iteracao * delayUp);

                if (sideSqr.mayExplode()) {
                    toProccess.unshift(sideSqr);
                } else {
                    toProccess.push(sideSqr);
                }
            });
        };
    };

    BoardImp.prototype.update = function (y, x) {
        if (x > this.width || y > this.height) {
            return false;
        }
        const sqr = this.matrix[x][y];
        sqr.size++;
        this.evaluateBoard(sqr);
        return true;
    };

    BoardImp.prototype.printBoard = function () {
        this.matrix.forEach((linha, index) => {
            const strRow = linha.map((sqr) => sqr.size).join(" - ");
            console.log(index % 2 ? "#" : "$", strRow);
        });
        console.log("==============");
    };

    BoardImp.prototype.hasWinner = function () {
        return false;
    };

    return BoardImp;
}]);
