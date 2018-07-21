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

module.exports.SquareImp = SquareImp;