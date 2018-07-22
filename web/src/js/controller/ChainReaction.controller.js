app.controller('ChainReactionController', ['$timeout', 'BoardImp', function ($timeout, BoardImp) {

    const colors = ['light-green', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'light-green'];
    const $$ = fn => (data) => $timeout(() => fn(data));

    this.board;

    let ws;

    PubSub.sub(BOARD_CHANNEL, $$(boardJson => {
        this.board = new BoardImp(boardJson);
    }));

    PubSub.sub(UPDATE_PLAY_CHANNEL, $$(play => {
        this.board.update(play.x, play.y, play.player);
    }));

    PubSub.sub('player', $$(player => {
        this.player = player;
    }));

    this.initWs = () => {
        ws && ws.close();
        ws = new WebSocket(`ws://${window.location.hostname}:1337/`);
        PubSub.registerConnection(ws);
    };

    this.click = (x, y) => {
        PubSub.pub(PLAY_CHANNEL, { x, y })
    };

    this.getColor = (number) => colors[number];

    this.updateBoard = (x, y) => {
        PubSub.pub(SETTING_CHANNEL, { x, y });
    };
}]);