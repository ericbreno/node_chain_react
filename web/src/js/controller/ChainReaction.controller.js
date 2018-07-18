app.controller('ChainReactionController', ['$timeout', 'BoardImp', function ($timeout, BoardImp) {
    let player = 1;
    let players = 2;
    let board;

    const colors = ['', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'light-green'];

    this.makeBoard = (sx = 5, sy = 5, ps = 2) => {
        players = ps;
        player = 1;
        board = new BoardImp(sx, sy, ps);
        this.matrix = board.viewMatrix;
    };

    this.click = (x, y) => {
        const sucesso = board.update(x, y, player);
        if (sucesso)
            player = Math.max(1, (player + 1) % (players + 1))
    };

    this.getColor = (number = player) => colors[number];

    this.makeBoard();
}]);