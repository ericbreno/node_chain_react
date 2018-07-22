app.controller('ChainReactionController', ['$timeout', function ($timeout) {

    const BOARD_CHANNEL = 'board';
    const PLAY_CHANNEL = 'play';
    const SETTING_CHANNEL = 'boardSetting';

    const colors = ['', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'light-green'];
    const $$ = fn => (data) => $timeout(() => fn(data));

    let ws;

    PubSub.sub(BOARD_CHANNEL, $$(board => {
        this.matrix = board.viewMatrix;
        this.nextPlayer = board.nextPlayer;
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