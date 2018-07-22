const LEAVING_CHANNEL = 'leaving';
const SETTING_CHANNEL = 'boardSetting';
const BOARD_CHANNEL = 'board';
const PLAY_CHANNEL = 'play';
const UPDATE_PLAY_CHANNEL = 'updateplay'

const PubSub = Object.freeze({
    channels: {},
    connections: new Set(),

    sub(channel, sub) {
        this.channels[channel] = this.channels[channel] || new Set();
        this.channels[channel].add(sub);
    },

    pub(channel, data, autoTriggered = false) {
        const subs = this.channels[channel];
        if (subs) subs.forEach(sub => sub(data));

        !autoTriggered && this.connections.forEach(conn => {
            const payload = JSON.stringify({ [channel]: data });
            if (conn.sendUTF) conn.sendUTF(payload);
            else conn.send(payload);
        });
    },

    registerConnection(conn, _player) {
        this.connections.add(conn);
        
        if (conn.on) {
            const leavingCb = () => {
                PubSub.connections.delete(conn);
                PubSub.pub(LEAVING_CHANNEL, { player: _player })
            };
            conn.on('message', message => {
                const json = JSON.parse(message.utf8Data);
                Object.keys(json).forEach(k => {
                    this.pub(k, Object.assign({ _player }, json[k]), true);
                });
            });
            conn.on('close', leavingCb);
        } else {
            conn.onmessage = (message) => {
                if (typeof message == 'object') message = message.data;
                const json = JSON.parse(message);
                Object.keys(json).forEach(k => {
                    this.pub(k, json[k], true);
                });
            };
            conn.onclose = () => PubSub.connections.delete(conn);
        }
    }
});

(g => {
    g.PubSub = PubSub;
    g.BOARD_CHANNEL = BOARD_CHANNEL;
    g.PLAY_CHANNEL = PLAY_CHANNEL;
    g.SETTING_CHANNEL = SETTING_CHANNEL;
    g.LEAVING_CHANNEL = LEAVING_CHANNEL;
    g.UPDATE_PLAY_CHANNEL = UPDATE_PLAY_CHANNEL;
})((typeof module != 'undefined') && module.exports || window);