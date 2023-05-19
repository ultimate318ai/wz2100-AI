"use strict";
/*
 * This file is responsible for chat listening. It contains handler functions for different chat
 * messages; each such function takes message and player as a parameter and returns a reply string.
 * All chat talking (such as calling for help) is coded in other places, not here.
 *
 * Messages are marked as translatable when necessary.
 *
 */
var prefix = '!nb';
var beaconInfo = [];
// key: name in chat, value: function that will be executed
// function gets two params: sender and argument
var commandMap = {
    set: chatSet,
    res: chatRes,
    truck: chatTruck,
    power: chatMoney,
    money: chatMoney, // alias for "power"
    help: chatHelp,
    go: chatHelp, // alias for "help"
    tx: chatUnhelp,
};

var _chat = {

    noticeBeacon: function (x, y, from) {
        if (from instanceof Number) {
            beaconInfo[from] = {
                x: x,
                y: y,
                exists: 1,
            };
        }
    },
    unnoticeBeacon: function (from) {
        if (from instanceof Number) {
            beaconInfo[from].exists = 0;
        }
    },
    findBeaconPlayer: function (x, y) {
        for (let i = 0; i < beaconInfo.length; ++i)
            if (_math.defined(beaconInfo[i]) && beaconInfo[i].x === x && beaconInfo[i].y === y)
                return i;
        return null;
    },
    handleChatMessage: function (sender, receiver, message) {
        // don't reply on any other message coming sender enemies
        if (message === "!nb who") {
            chat(sender, this.chatWho(sender));
            return;
        }
        if (!isAlly(sender))
            return;
        if (message === "help me!!") { // Try to understand Nexus AI's way of calling for help
            this.chatHelp(sender);
            return;
        }
        var result = message.split(/ +/);
        if (result[0] !== prefix)
            return;
        var command = result[1];
        var argument = result[2];
        if (_math.defined(commandMap[command]))
            chat(sender, commandMap[command](sender, argument));
    },
    chatWho: function (sender, argument) {
        var str = "NullBot3 (" + scriptName + ") ";
        switch (difficulty) {
            case EASY: str += _("EASY"); break;
            case MEDIUM: str = str + _("MEDIUM"); break;
            case HARD: str = str + _("HARD"); break;
            case INSANE: str = str + _("INSANE"); break;
        }
        if (isAlly(sender))
            str += (" ~" + personality.chatalias + "~");
        return str;
    },
    chatSet: function (sender, argument) {
        var str = "";
        for (const i in subpersonalities) {
            if (subpersonalities[i].chatalias === argument) {
                personality = subpersonalities[i];
                return _("Personality change successful.");
            }
            str = str + " " + subpersonalities[i].chatalias;
        }
        return _("No such personality! Try one of these:") + str;
    },
    chatRes: function (sender, argument) {
        if (argument === "cl") {
            _research.setForcedResearch(); // clear
            return _("Forced research cleared, will research anything I want now.");
        }
        if (argument === "no") {
            _research.setForcedResearch(null); // clear
            return _("Research blocked, will research nothing now.");
        }
        if (argument === "fn") {
            _research.setForcedResearch(fundamentalResearch);
            return _("Researching fundamental technology.");
        }
        var str = " cl no fn";
        for (const i in weaponStats) {
            if (weaponStats[i].chatalias === argument) {
                _research.setForcedResearch(_stats.weaponStatsToResList(weaponStats[i]));
                return _("Researching ") + weaponStats[i].chatalias;
            }
            if (weaponStats[i].chatalias.indexOf("useless") < 0)
                str += " " + weaponStats[i].chatalias;
        }
        return _("No such research path! Try one of these:") + str;
    },
    chatTruck: function (sender, argument) {
        var droid = enumTrucks().random();
        if (!_math.defined(droid))
            return _("Sorry, I have no trucks.");
        if (donateObject(droid, sender)) {
            addBeacon(droid.x, droid.y, sender);
            return _("You can use this one.");
        }
        return _("Sorry, droid transfer failed.");
    },
    chatMoney: function (sender, argument) {
        var power = Math.round(myPower() / 3);
        donatePower(power, sender);
        return _("Power transferred.");
    },
    chatHelp: function (sender, argument) {
        if (!_math.defined(beaconInfo[sender]) || !beaconInfo[sender].exists)
            return _("Please put a beacon!");
        if (_tactics.setTarget({ x: beaconInfo[sender].x, y: beaconInfo[sender].y, type: POSITION }))
            return _("Coming!");
        else
            return _("Sorry, I don't have any free forces to send for help!");
    },
    chatUnhelp: function (sender, argument) {
        _tactics.unsetTarget(sender);
        return _("Any time, big boss!");
    }
};
