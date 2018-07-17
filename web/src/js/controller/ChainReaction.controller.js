app.controller('ChainReactionController', ['$timeout', 'BoardImp', function ($timeout, BoardImp) {
    const board = new BoardImp(5, 5);

    this.matrix = board.viewMatrix;

    this.click = (x, y) => board.update(x, y);

    this.getIcon = stack => {
        const asset = stack > 2 ? "triple.png"
            : stack > 1 ? "double.png"
            : stack > 0 ? "single.png" 
            : "blank.png";
        return `src/assets/${asset}`;
    };
}]);