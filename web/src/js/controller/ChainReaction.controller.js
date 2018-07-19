app.controller('ChainReactionController', ['$timeout', function ($timeout) {

    const colors = ['', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'light-green'];

    const ws = new WebSocket(`ws://${window.location.hostname}:1337/`);
    ws.onopen = () => {
        console.log('connection opened succesfully');
    };

    ws.onerror = function (error) { };

    ws.onmessage = (message) => {
        let json;
        try {
            json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        if (!this.player) {
            this.player = json.player;
        }

        $timeout(() => {
            this.matrix = json.viewMatrix;
            this.nextPlayer = json.nextPlayer;
        });
    };

    this.click = (x, y) => {
        ws.send(JSON.stringify({ jogada: { x, y } }));
    };

    this.getColor = (number) => colors[number];

    this.updateBoard = (xs, ys, ps) => {
        ws.send(JSON.stringify({ boardSetting: { x: xs, y: ys, p: ps } }))
    }
}]);