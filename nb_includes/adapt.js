"use strict";
/*
 * This file is responsible for the adaptation system. It gathers statistics about
 * player choices and regulates the AI's choices accordingly.
 *
 */

var SCOPES = {
    land: 0,
    sea: 0,
    air: 0
};

var enemyStats = [], enemyStatsTemp = [];
for (let i = 0; i < maxPlayers; ++i) {
    enemyStats[i] = new _adapt.EnemyStat();
    enemyStatsTemp[i] = new _adapt.EnemyStat();
}

var myStats = new _adapt.MyStat();
var myStatsTemp = new _adapt.MyStat();

var stack = [];
var MAX_PER_CYCLE = 20;

var _adapt = {

    adaptVote: function (our, their, verbose) {
        if (!_math.defined(verbose)) {
            verbose = false;
        }
        var l = our.length;
        var ourTotal = our.reduce((prev, curr) => (prev + curr));
        var theirTotal = their.reduce((prev, curr) => (prev + curr));
        if (theirTotal === 0) {
            return verbose ? _math.randomUnitArray(l) : _math.random(l);
        }
        var rating = [];
        for (let i = 0; i < l; ++i)
            rating[i] = their[i] / theirTotal;
        if (ourTotal > 0)
            for (let i = 0; i < l; ++i)
                rating[i] -= our[i] / ourTotal;
        if (verbose)
            return rating.map((val) => ((val + 1) / 2));
        var maxRating = -Infinity;
        var maxIdx = 0;
        for (let i = 0; i < l; ++i)
            if (rating[i] > maxRating) {
                maxRating = rating[i];
                maxIdx = i;
            }
        return maxIdx;
    },

    //
    // here be functions for gathering player statistics
    //

    SimpleStat: function () {
        // propulsion classes used by the player
        this.obj = _math.zeroArray(ROLE.LENGTH);
        // weapon-propulsion classes used by the player
        this.role = _math.zeroArray(ROLE.LENGTH);
        // armor used by the player
        this.kbody = 0;
        this.tbody = 0;
        // weapon-armor classes used by the player
        this.kweapon = 0;
        this.tweapon = 0;
    },
    addStat: function (to, what, weight) {
        if (!_math.defined(weight))
            weight = 1;
        for (const prop in to) {
            if (to[prop].constructor === Array)
                for (let i = 0; i < to[prop].length; ++i)
                    to[prop][i] += what[prop][i] * weight;
            else
                to[prop] += what[prop] * weight;
        }
    },
    ScopeStat: function () {
        // simple stats by scopes
        this.land = new this.SimpleStat();
        this.sea = new this.SimpleStat();
        this.air = new this.SimpleStat();
        // a function to convert this sort of stat to a SimpleStat
        this.collapse = function () {
            var ret = new this.SimpleStat();
            for (const i in SCOPES)
                this.addStat(ret, this[i]);
            return ret;
        }
    },
    EnemyStat: function () {
        // separate stats for defense and offense
        this.defense = new this.ScopeStat();
        this.offense = new this.SimpleStat();
        // a function to convert this sort of stat to a SimpleStat
        this.collapse = function () {
            var ret = new this.SimpleStat();
            this.addStat(ret, this.defense.collapse());
            this.addStat(ret, this.offense);
            return ret;
        }
    },
    MyStat: function () {
        // separate stats for defense and offense
        this.defense = new this.SimpleStat();
        this.offense = new this.ScopeStat();
        // a function to convert this sort of stat to a SimpleStat
        this.collapse = function () {
            var ret = new this.SimpleStat();
            this.addStat(ret, this.defense);
            this.addStat(ret, this.offense.collapse());
            return ret;
        }
    },
    canReachBy: function (scope, location) {
        switch (scope) {
            case "land":
                return canReachFromBase(_stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND).last(), location);
            case "sea":
                return canReachFromBase(_stats.getPropulsionStatsComponents(PROPULSIONUSAGE.HOVER).last(), location);
            case "air":
                return canReachFromBase(_stats.getPropulsionStatsComponents(PROPULSIONUSAGE.AIR).last(), location);
        }
    },
    adaptCycle: function () {
        if (!_math.defined(adaptCycle.player))
            adaptCycle.player = me;
        if (!_math.defined(adaptCycle.phase))
            adaptCycle.phase = 0;
        if (stack.length > 0) {
            var items = MAX_PER_CYCLE;
            if (items > stack.length)
                items = stack.length;
            for (let i = 0; i < items; ++i) {
                var obj = stack.pop();
                if (isEnemy(adaptCycle.player))
                    summUpEnemyObject(obj, enemyStatsTemp[adaptCycle.player]);
                else if (adaptCycle.player === me)
                    summUpMyObject(obj, myStatsTemp);
            }
            return;
        }
        ++adaptCycle.phase;
        switch (adaptCycle.phase) {
            case 1:
                stack = enumStruct(adaptCycle.player, DEFENSE);
                return;
            case 2:
                stack = enumDroid(adaptCycle.player, DROID_WEAPON);
                return;
            case 3:
                stack = enumDroid(adaptCycle.player, DROID_CYBORG);
                return;
        }
        if (adaptCycle.player === me) {
            myStats = myStatsTemp;
            myStatsTemp = new this.MyStat();
        } else {
            enemyStats[adaptCycle.player] = enemyStatsTemp[adaptCycle.player];
            enemyStatsTemp[adaptCycle.player] = new this.EnemyStat();
        }
        do {
            ++adaptCycle.player;
            if (adaptCycle.player >= maxPlayers)
                adaptCycle.player = 0;
        } while (adaptCycle.player !== me && !isEnemy(adaptCycle.player));
        adaptCycle.phase = 0;
    },
    chooseWeaponRole: function (gr) {
        function uncached() {
            if (_math.withChance(20))
                return _math.randomUnitArray(4);
            return this.adaptVote(groupOurs(gr).role, groupTheirs(gr).obj, true);
        }
        return _intensity.cached(uncached, 5000, gr);
    },

    // use this for droids and long-range arty emplacements
    chooseAttackWeaponRole: function (gr) {
        function uncached() {
            return this.adaptVote(groupAttackOurs(gr).role, groupTheirs(gr).obj, true);
        }
        return _intensity.cached(uncached, 5000, gr);
    },

    // use this for defenses; 15% smooth
    chooseDefendWeaponRole: function () {
        function uncached() {
            if (_math.withChance(20))
                return _math.randomUnitArray(4);
            return this.adaptVote(myStats.defense.role, enemyOffense().obj, true);
        }
        return _intensity.cached(uncached, 5000);
    },
    chooseBodyClass: function (gr) {
        function uncached() {
            var our = groupAttackOurs(gr), their = groupTheirs(gr);
            return this.adaptVote(
                [our.kbody, our.tbody],
                [their.kweapon, their.tweapon]
            ) ? BODYCLASS.THERMAL : BODYCLASS.KINETIC;
        }
        return _intensity.cached(uncached, 5000, gr);
    },
    chooseObjectType: function () {
        function uncached() {
            var our = groupOurs(), their = groupTheirs();
            // behaviour specific for a turtle AI
            if (personality.defensiveness === 100) {
                if (_stats.iHaveVtol() && _math.withChance(personality.vtolness) && this.adaptVote(
                    [our.obj[OBJTYPE.DEFS], our.obj[OBJTYPE.VTOL]],
                    [their.role[ROLE.AA], their.role[ROLE.AT] + their.role[ROLE.AP] + 2 * their.role[ROLE.AS]]
                ) === 1) {
                    return OBJTYPE.VTOL;
                }
                else
                    return OBJTYPE.DEFS;
            }
            // behaviour of a generic AI
            if (_math.withChance(personality.defensiveness) && this.adaptVote(
                [our.obj[OBJTYPE.TANK] + our.obj[OBJTYPE.BORG] + our.obj[OBJTYPE.VTOL], our.obj[OBJTYPE.DEFS]],
                [their.role[ROLE.AS], their.role[ROLE.AT] + their.role[ROLE.AP] + their.role[ROLE.AA]]
            ) === 1)
                return OBJTYPE.DEFS;
            if (_stats.iHaveVtol() && _math.withChance(personality.vtolness) && this.adaptVote(
                [our.obj[OBJTYPE.TANK] + our.obj[OBJTYPE.BORG] + our.obj[OBJTYPE.DEFS], our.obj[OBJTYPE.VTOL]],
                [their.role[ROLE.AA], their.role[ROLE.AT] + their.role[ROLE.AP] + their.role[ROLE.AS]]
            ) === 1)
                return OBJTYPE.VTOL;
            return this.adaptVote(
                [our.obj[OBJTYPE.TANK], our.obj[OBJTYPE.BORG]],
                [their.role[ROLE.AP], their.role[ROLE.AT]]
            ) ? OBJTYPE.BORG : OBJTYPE.TANK;
        }
        return _intensity.cached(uncached, 5000);
    },
    scopeRatings: function () {
        function uncached() {
            var ret = { land: 0, sea: 0, air: 0 };
            enumLivingPlayers().filter(isEnemy).forEach((player) => {
                ret.land += countLandTargets(player);
                ret.sea += countSeaTargets(player);
                ret.air += countAirTargets(player);
            });
            return ret;
        }
        return _intensity.cached(uncached, 5000);
    },
    spendMoney: function () {
        queue("checkResearch", 100);
        if (_produce.checkTruckProduction())
            return; // will proceed on the next cycle
        if (_adapt.chooseObjectType() === OBJTYPE.DEFS)
            queue("checkConstruction", 200);
        else
            queue("checkProduction", 300);
    }
};

// works with stored droid objects too!
function threatensBase(droid) {
    if (isAlly(droid.player))
        return false;
    return canReachFromBase(droid.propulsion, droid);
}

// count target structures and construct units reachable by land
function countLandTargets(player) {
    function uncached() {
        var currProp = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND).last();
        if (!_math.defined(currProp))
            return 0;
        var list = _stats.enumStructList(targets, player).concat(enumDroid(player, DROID_CONSTRUCT));
        return list.filter((obj) => (canReachFromBase(currProp, obj))).length;
    }
    return _intensity.cached(uncached, 5000, player);
}

// count target structures and construct units reachable by sea but not by land
function countSeaTargets(player) {
    function uncached() {
        var currProp = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.HOVER)[0];
        if (!_math.defined(currProp))
            return 0;
        var prevProp = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND)[0];
        return _stats.enumStructList(targets, player).concat(enumDroid(player, DROID_CONSTRUCT)).filter((obj) => (
            (!_math.defined(prevProp) || !canReachFromBase(prevProp, obj)) && canReachFromBase(currProp, obj)
        )).length;
    }
    return _intensity.cached(uncached, 5000, player);
}

// count target structures and construct units reachable by air but not by land or by sea
function countAirTargets(player) {
    function uncached() {
        var currProp = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.VTOL)[0];
        if (!_math.defined(currProp))
            return 0;
        var prevProp = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND | PROPULSIONUSAGE.HOVER)[0];
        return _stats.enumStructList(targets, player).concat(enumDroid(player, DROID_CONSTRUCT)).filter((obj) => (
            (!_math.defined(prevProp) || !canReachFromBase(prevProp, obj)) && canReachFromBase(currProp, obj)
        )).length;
    }
    return _intensity.cached(uncached, 5000, player);
}

// become available for the API to use.
function classifyObject(obj) {
    var ret = new _adapt.SimpleStat();
    if (obj.type === STRUCTURE && obj.stattype !== DEFENSE)
        return ret;
    if (obj.type === DROID && obj.droidType !== DROID_WEAPON && obj.droidType !== DROID_CYBORG)
        return ret;
    if (obj.type === FEATURE)
        return ret;
    for (let i = 0; i < obj.weapons.length; ++i) {
        var roles = _stats.guessWeaponRole(obj.weapons[i].name); {
            if (!_math.defined(roles)) {
                if (obj.canHitAir && obj.canHitGround)
                    ret.role.addArray([1 / 4, 1 / 4, 1 / 4, 1 / 4]);
                else if (obj.canHitAir && !obj.canHitGround)
                    ret.role.addArray([0, 0, 0, 1]);
                else
                    ret.role.addArray([1 / 3, 1 / 3, 1 / 3, 0]);
            } else
                ret.role.addArray(roles);
        }
    }
    for (let i = 0; i < obj.weapons.length; ++i) {
        if (Stats.Weapon[obj.weapons[i].fullname].ImpactType === "KINETIC")
            ret.kweapon += 1;
        else
            ret.tweapon += 1;
    }
    if (obj.type === STRUCTURE || (obj.type === DROID && _stats.safeIsVtol(obj)))
        ret.tbody += 1;
    else if (obj.type === DROID && obj.droidType === DROID_CYBORG)
        ret.kbody += 1;
    else {
        switch (_stats.guessBodyArmor(obj.body)) {
            case BODYCLASS.KINETIC:
                ret.kbody += 1;
                break;
            case BODYCLASS.THERMAL:
                ret.tbody += 1;
                break;
            default:
                ret.tbody += 1 / 2;
                ret.kbody += 1 / 2;
        }
    }
    if (obj.type === STRUCTURE)
        ret.obj[OBJTYPE.DEFS] += 1;
    if (obj.type === DROID) {
        if (_stats.safeIsVtol(obj))
            ret.obj[OBJTYPE.VTOL] += 1;
        else if (obj.droidType === DROID_CYBORG)
            ret.obj[OBJTYPE.BORG] += 1;
        else
            ret.obj[OBJTYPE.TANK] += 1;
    }
    return ret;
}

function summUpEnemyObject(obj, stat) {
    var ret = classifyObject(obj);
    var w = obj.cost;
    if (obj.type === STRUCTURE) {
        for (const scope in SCOPES)
            if (_adapt.canReachBy(scope, obj)) // structures don't move, so they are usually counted as defense
                _adapt.addStat(stat.defense[scope], ret, w);
        if (obj.range > baseScale * 2) // unless they're covering the whole map with their range
            _adapt.addStat(stat.offense, ret, w);
    }
    if (obj.type === DROID) {
        for (const scope in SCOPES)
            if (_adapt.canReachBy(scope, obj)) // if the droid can't reach your base, we count it as defense only
                _adapt.addStat(stat.defense[scope], ret, w);
        if (threatensBase(obj)) // otherwise count them as offense as well
            _adapt.addStat(stat.offense, ret, w);
    }
}

function summUpMyObject(obj, stat) {
    var ret = classifyObject(obj);
    var w = obj.cost;
    if (obj.type === STRUCTURE) {
        _adapt.addStat(stat.defense, ret, w);
        if (obj.range > baseScale * 2)
            for (const scope in SCOPES)
                _adapt.addStat(stat.offense[scope], ret, w);
    }
    if (obj.type === DROID) {
        if (obj.group === miscGroup)
            _adapt.addStat(stat.defense, ret, w);
        var list = enumLivingPlayers();
        list.forEach((p) => {
            if (isEnemy(p)) {
                if (countLandTargets(p) > 0)
                    _adapt.addStat(stat.offense.land, ret, w / list.length);
                if (countSeaTargets(p) > 0)
                    _adapt.addStat(stat.offense.sea, ret, w / list.length);
                if (countAirTargets(p) > 0)
                    _adapt.addStat(stat.offense.air, ret, w / list.length);
            }
        });
    }
}


function getMyGroupInfo(gr) {
    var ret = new _adapt.MyStat();
    enumGroup(gr).forEach((obj) => { summUpMyObject(obj, ret); });
    return ret;
}

//
// here be functions for querying statistics gathered above
// and making adaptive decisions
//

function groupOurs(gr) {
    function uncached() {
        if (_math.defined(gr))
            return getMyGroupInfo(gr).collapse();
        else
            return myStats.collapse();
    }
    return _intensity.cached(uncached, 500, gr);
}

function groupAttackOurs(gr) {
    function uncached() {
        if (_math.defined(gr))
            return getMyGroupInfo(gr).collapse();
        else
            return myStats.offense.collapse();
    }
    return _intensity.cached(uncached, 500, gr);
}

function enemyOffense() {
    var theirs = new _adapt.SimpleStat();
    enumLivingPlayers().filter(isEnemy).forEach((p) => {
        _adapt.addStat(theirs, enemyStats[p].offense);
    });
    return theirs;
}

function groupTheirs(gr) {
    function uncached() {
        if (_math.defined(gr)) {
            if (gr === miscGroup)
                return enemyOffense();
            else
                return enemyStats[gr].collapse();
        } else {
            var theirs = new _adapt.SimpleStat();
            enumLivingPlayers().filter(isEnemy).forEach((p) => {
                _adapt.addStat(theirs, enemyStats[p].collapse());
            });
            return theirs;
        }
    }
    return _intensity.cached(uncached, 500, gr);
}