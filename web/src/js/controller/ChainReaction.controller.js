app.controller('ChainReactionController', ['$timeout', function ($timeout) {

    const colors = ['', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'light-green'];

    let ws;

    this.initWs = () => {
        ws && ws.close();
        ws = new WebSocket(`ws://${window.location.hostname}:1337/`);
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
            if (json.player) {
                this.player = json.player;
            }

            $timeout(() => {
                this.matrix = json.viewMatrix;
                this.nextPlayer = json.nextPlayer;
            });
        };
    };

    this.click = (x, y) => {
        ws && ws.send(JSON.stringify({ jogada: { x, y } }));
    };

    this.getColor = (number) => colors[number];

    this.updateBoard = (xs, ys) => {
        ws && ws.send(JSON.stringify({ boardSetting: { x: xs, y: ys } }))
    }
}]);