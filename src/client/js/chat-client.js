var global = require('./global');

class ChatClient {
    constructor(params) {
        this.canvas = global.canvas;
        this.socket = global.socket;
        this.mobile = global.mobile;
        this.player = global.player;
        var self = this;
        this.commands = {};
        var input = document.getElementById('chatInput');
        input.addEventListener('keypress', this.sendChat.bind(this));
        input.addEventListener('keyup', function(key) {
            input = document.getElementById('chatInput');
            key = key.which || key.keyCode;
            if (key === global.KEY_ESC) {
                input.value = '';
                self.canvas.cv.focus();
            }
        });
        global.chatClient = this;
    }



    registerFunctions() {
        var self = this;
        this.registerCommand('ping', 'Controlla il PING.', function () {
            self.checkLatency();
        });

        this.registerCommand('dark', 'Passa in modalità dark.', function () {
            self.toggleDarkMode();
        });

        this.registerCommand('mass', 'Rendi visibile la massa.', function () {
            self.toggleMass();
        });

        this.registerCommand('help', 'Informazione sui comandi della chat.', function () {
            self.printHelp();
        });

        global.chatClient = this;
    }

    // Chat box per gli utenti
    addChatLine(name, message, me) {
       
        var newline = document.createElement('li');


        newline.className = (me) ? 'io' : 'amico';
        newline.innerHTML = '<b>' + ((name.length < 1) ? 'cellulina qualunque' : name) + '</b>: ' + message;

        this.appendMessage(newline);
    }

    // Chat box per il sistema
    addSystemLine(message) {
        if (this.mobile) {
            return;
        }
        var newline = document.createElement('li');

 
        newline.className = 'system';
        newline.innerHTML = message;


        this.appendMessage(newline);
    }


    appendMessage(node) {

        var chatList = document.getElementById('chatList');
        if (chatList.childNodes.length > 10) {
            chatList.removeChild(chatList.childNodes[0]);
        }
        chatList.appendChild(node);
    }


    sendChat(key) {
        var commands = this.commands,
            input = document.getElementById('chatInput');

        key = key.which || key.keyCode;

        if (key === global.KEY_ENTER) {
            var text = input.value.replace(/(<([^>]+)>)/ig,'');
            if (text !== '') {

                // Chat command.
                if (text.indexOf('-') === 0) {
                    var args = text.substring(1).split(' ');
                    if (commands[args[0]]) {
                        commands[args[0]].callback(args.slice(1));
                    } else {
                        this.addSystemLine('comando sconosciuto: ' + text + ', per info, -help.');
                    }


                } else {
                    this.socket.emit('playerChat', { sender: this.player.name, message: text });
                    this.addChatLine(this.player.name, text, true);
                }

                // Resets input.
                input.value = '';
                this.canvas.cv.focus();
            }
        }
    }

    // Allows for addition of commands.
    registerCommand(name, description, callback) {
        this.commands[name] = {
            description: description,
            callback: callback
        };
    }

    // Allows help to print the list of all the commands and their descriptions.
    printHelp() {
        var commands = this.commands;
        for (var cmd in commands) {
            if (commands.hasOwnProperty(cmd)) {
                this.addSystemLine('-' + cmd + ': ' + commands[cmd].description);
            }
        }
    }

    checkLatency() {
        // Ping.
        global.startPingTime = Date.now();
        this.socket.emit('pingcheck');
    }

    toggleDarkMode() {
        var LIGHT = '#f2fbff',
            DARK = '#181818';
        var LINELIGHT = '#000000',
            LINEDARK = '#ffffff';

        if (global.backgroundColor === LIGHT) {
            global.backgroundColor = DARK;
            global.lineColor = LINEDARK;
            this.addSystemLine('Dark mode');
        } else {
            global.backgroundColor = LIGHT;
            global.lineColor = LINELIGHT;
            this.addSystemLine('No Dark mode ');
        }
    }

    

    toggleMass() {
        if (global.toggleMassState === 0) {
            global.toggleMassState = 1;
            this.addSystemLine('massa');
        } else {
            global.toggleMassState = 0;
            this.addSystemLine('no massa');
        }
    }

}

module.exports = ChatClient;
