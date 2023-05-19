"use strict";
/*
 * This file lists all timers used by the AI.
 *
 */

var _timer = {
    setTimers: function () {
        function rnd() {
            return _math.random(201) - 100;
        }
        setTimer("spendMoney", 2000 + 3 * rnd());
        setTimer("checkConstruction", 3000 + 8 * rnd());
        setTimer("checkAttack", 100);
        setTimer("adaptCycle", 100);
        setTimer("rebalanceGroups", 10000 + 20 * rnd());
        if (difficulty === EASY) {
            setTimer("goEasy", 30000);
        }
    }
};