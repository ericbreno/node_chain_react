enum Colors {
    Blank = "white",
    Blue = "light-blue",
    Yellow = "yellow",
    Red = "red",
    Green = "light-green"
}

interface Square {
    readonly width: number
    readonly height: number
    readonly x: number
    readonly y: number
    size: number
    color: Colors

    getSides(): [number, number][]
    mayExplode(): boolean
    getIcon(): string
};

class SquareImp implements Square {
    size: number

    constructor(public color: Colors,
        public x: number,
        public y: number,
        public width: number,
        public height: number) {
        this.size = 0;
    }

    private isCorner(): boolean {
        return this.x === 0 && this.y === 0
            || this.x === this.width && this.y === 0
            || this.x === 0 && this.y === this.height
            || this.x === this.width && this.y === this.height;
    }

    private isWall(): boolean {
        return !this.isCorner() &&
            (this.x === 0
                || this.y === 0
                || this.x === this.width
                || this.y === this.height)
    }

    mayExplode(): boolean {
        return this.isCorner() && this.size >= 2
            || this.isWall() && this.size >= 3
            || this.size >= 4;
    }

    getSides(): [number, number][] {
        const sides: [number, number][] = [
            [this.x + 1, this.y],
            [this.x, this.y + 1],
            [this.x - 1, this.y],
            [this.x, this.y - 1]
        ];

        return sides.filter(side => side[0] >= 0
            && side[1] >= 0
            && side[0] <= this.width
            && side[1] <= this.height
        );
    }
}

interface Board {
    readonly width: number
    readonly height: number

    update(x: number, y: number): boolean
    printBoard(): void
    hasWinner(): boolean
}

class BoardImp implements Board {
    matrix: Square[][]
    viewMatrix: Square[][]

    constructor(public width: number, public height: number) {
        this.initMatrix();
    }

    private initMatrix(): void {
        this.matrix = [];
        this.viewMatrix = [];
        for (let x: number = 0; x <= this.width; x++) {
            const row: Square[] = [];
            const viewRow: Square[] = [];
            for (let y: number = 0; y <= this.height; y++) {
                row.push(new SquareImp(Colors.Blank, x, y, this.width, this.height));
                viewRow.push(new SquareImp(Colors.Blank, x, y, this.width, this.height));
            }
            this.matrix.push(row);
            this.viewMatrix.push(viewRow);
        }
    }

    private evaluateBoard(initialSqr: Square): void {
        /**
         * Politica de atualização do tabuleiro:
         * 1. Verificar square atualizado
         * 2. Se explodir, verificar para todos vizinhos (rec)
         * 3. Se não explodir, fim
         */
        const toProccess: Square[] = [initialSqr];
        let its = 0;
        const delayUp: number = 150;

        while (toProccess.length > 0) {
            const sqrChanged: Square = toProccess.shift();
            if (its++ > this.width ** 6) { return; }
            setTimeout(() => { this.viewMatrix[sqrChanged.x][sqrChanged.y].size = sqrChanged.size; }, its * delayUp);
            if (!sqrChanged.mayExplode()) { continue; }

            sqrChanged.size = 0;
            setTimeout(() => { this.viewMatrix[sqrChanged.x][sqrChanged.y].size = 0; }, its * delayUp);

            const sides: Square[] = sqrChanged.getSides().map(side => this.matrix[side[0]][side[1]]);
            sides.forEach((sideSqr: Square) => {
                sideSqr.size++;
                setTimeout(() => { this.viewMatrix[sideSqr.x][sideSqr.y].size++; }, its * delayUp);
                if (sideSqr.mayExplode()) {
                    toProccess.unshift(sideSqr);
                } else {
                    toProccess.push(sideSqr);
                }
            });
        }
    }

    update(y: number, x: number): boolean {
        if (x > this.width || y > this.height) {
            return false;
        }
        const sqr: Square = this.matrix[x][y];
        sqr.size++;
        this.evaluateBoard(sqr);
        return true;
    }

    printBoard(): void {
        this.matrix.forEach((row: Square[], i: number) => {
            const strRow: string = row.map((sqr: Square) => sqr.size).join(" - ");
            console.log(i % 2 ? "#" : "$", strRow);
        });
        console.log("==============");
    }

    hasWinner(): boolean {
        return false;
    }
}

// http://www.typescriptlang.org/play/