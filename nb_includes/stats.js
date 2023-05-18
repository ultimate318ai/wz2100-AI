"use strict";
/*
 * This file contain functions for manipulating stats defined by rulesets.
 */

var _stats = {

    isHoverPropulsion: function (str) {
        if (str instanceof String) {
            return propulsionStats.some((val) => (val.usage === PROPULSIONUSAGE.HOVER && val.stat === str));
        }
        return false;
    },
    isVtolPropulsion: function (str) {
        if (str instanceof String) {
            return propulsionStats.some((val) => (val.usage === PROPULSIONUSAGE.VTOL && val.stat === str));
        }
        return false;
    },
    iHaveHover: function () {
        return propulsionStats.some((val) => (val.usage === PROPULSIONUSAGE.HOVER && componentAvailable(val.stat)));
    },
    iHaveVtol: function () {
        return propulsionStats.some((val) => (val.usage === PROPULSIONUSAGE.VTOL && componentAvailable(val.stat)));
    },
    iHaveArty: function () {
        for (let stat in Object.keys(weaponStats)) {
            if (weaponStats[stat].defenses !== undefined) {
                // for (let i = 0; i < weaponStats[stat].defenses.length; ++i) 
                for (let defensive_struct of weaponStats[stat].defenses)
                    if (defensive_struct.defrole === DEFROLE.ARTY)
                        if (defensive_struct.stat !== undefined && countStruct(defensive_struct.stat) > 0)
                            return true;
            }
        }
        return false;
    },
    safeIsVtol: function (droid) {
        return isVtolPropulsion(droid.propulsion);
    },
    enumStructList: function (list, player) {
        if (list instanceof Array && player instanceof String) {
            if (!defined(player))
                player = me;
            return list.reduce((summ, new_value) => (summ.concat(enumStruct(player, new_value))), []);
        }
    },
    countStructList: function (list, player) {
        if (!defined(player))
            player = me;
        return list.reduce((summ, new_value) => (summ + countStruct(new_value, player)), 0);
    },
    enumFinishedStructList: function (list, player) {
        return this.enumStructList(list, player).filterProperty("status", BUILT);
    },
    countFinishedStructList: function (list, player) {
        return this.enumFinishedStructList(list, player).length;
    },
    enumIdleStructList: function (list, player) {
        return this.enumFinishedStructList(list, player).filter(structureIdle);
    },
    structListLimit: function (list) {
        return list.reduce((summ, val) => (summ + getStructureLimit(val)), 0);
    },
    guessWeaponRole: function (name) {
        for (const stat in weaponStats) {
            if (
                weaponStats[stat].weapons.someProperty("stat", name) ||
                weaponStats[stat].vtols.someProperty("stat", name) ||
                weaponStats[stat].templates.some((i) => (i.weapons.indexOf(name) > -1))
            )
                return weaponStats[stat].roles;
        }
        niceDebug("Ruleset warning: Couldn't guess weapon role of", name);
    },
    guessWeaponMicro: function (name) {
        function uncached() {
            for (const stat in weaponStats) {
                if (weaponStats[stat].weapons.someProperty("stat", name))
                    return weaponStats[stat].micro;
                if (weaponStats[stat].templates.some((i) => (i.weapons.indexOf(name) > -1)))
                    return weaponStats[stat].micro;
            }
        }
        return cached(uncached, Infinity, name);
    },
    guessDroidMicro: function (droid) {
        for (let i = 0; i < droid.weapons.length; ++i) {
            var ret = this.guessWeaponMicro(droid.weapons[i].name);
            if (ret !== MICRO.RANGED)
                return ret;
        }
        return MICRO.RANGED;
    },
    guessBodyArmor: function (name) {
        var body = bodyStats.filterProperty("stat", name).last()
        if (defined(body))
            return body.armor;
        else
            niceDebug("Ruleset warning: Couldn't guess body class of", name);
    },
    weaponPathIsAvailable: function (path, objectType, defrole) {
        switch (objectType) {
            case 0:
                return path.weapons.some((val) => (componentAvailable(val.stat)))
            case 1:
                return path.templates.some((val) => {
                    for (let i = 0; i < val.weapons.length; ++i)
                        if (!componentAvailable(val.weapons[i]))
                            return false;
                    return componentAvailable(val.body) && componentAvailable(val.prop);
                });
            case 2:
                return path.defenses.some((val) => (val.defrole === defrole && isAvailable(val.stat)));
            case 3:
                return path.vtols.some((val) => (componentAvailable(val.stat)));
            default: // research
                return true;
        }
    },
    getProductionPaths: function () {
        if (!defined(fallbackWeapon) || gameTime > 600000)
            return personality.weaponPaths;
        return [weaponStats[fallbackWeapon]].concat(personality.weaponPaths);
    },
    chooseAvailableWeaponPathByRoleRatings: function (paths, rating, objectType, defrole) {
        var minDist = Infinity, minPath;
        paths.forEach((path) => {
            if (!weaponPathIsAvailable(path, objectType, defrole))
                return;
            var dist = 0;
            for (let i = 0; i < ROLE.LENGTH; ++i) {
                var newDist = Math.abs(rating[i] - path.roles[i])
                if (newDist > dist)
                    dist = newDist;
            }
            if (dist < minDist) {
                minDist = dist;
                minPath = path;
            }
        });
        return minPath;
    },
    statsToResList: function (path) {
        return path.map((val) => (val.res));
    },
    bodyStatsToResList: function (armor) {
        return statsToResList(filterBodyStatsByUsage(armor)).reverse();
    },
    propulsionStatsToResList: function (usage) {
        return statsToResList(filterDataByFlag(propulsionStats, 'usage', usage));
    },
    weaponStatsToResList: function (path, objType) {
        if (!defined(path))
            return new Array();
        var ret = new Array();
        switch (objType) {
            case 0:
                ret = statsToResList(path.weapons); break;
            case 1:
                ret = statsToResList(path.templates); break;
            case 2:
                ret = statsToResList(path.defenses); break;
            case 3:
                ret = statsToResList(path.vtols); break;
        }
        return ret.length === 0 ? ret.concat(
            statsToResList(path.weapons),
            statsToResList(path.templates),
            statsToResList(path.defenses),
            statsToResList(path.vtols),
            path.extras
        ) : ret.concat(path.extras);
    },
    filterDataByFlag: function (data, attr_name, flag) {
        return data.filter((obj) => (obj[attr_name] & flag));
    },
    filterBodyStatsByUsage: function (usage, armor) {
        var data;
        data = defined(armor) ? this.filterDataByFlag(bodyStats, 'armor', armor) : bodyStats
        return this.filterDataByFlag(data, 'usage', usage).reverse();
    },
    getPropulsionStatsComponents: function (usage) {
        var data = filterDataByFlag(propulsionStats, 'usage', usage)
        return data.map((val) => (val.stat)).reverse()
    },
    weaponStatsToDefenses: function (stats, defrole) {
        if (!defined(stats))
            return [];
        var ret = [];
        for (let i = 0; i < stats.defenses.length; ++i)
            if (!defined(defrole) || stats.defenses[i].defrole === defrole)
                ret.push(stats.defenses[i].stat);
        // reverse not needed here
        return ret;
    }
};
