"use strict";
/*
 * This file controls the AI's research choices.
 *
 */

var forcedResearch;

var _research = {

    setForcedResearch: function (list) {
        forcedResearch = list;
    },
    needFastestResearch: function () {
        var ret = _adapt.scopeRatings();
        if (ret.land === 0 && ret.sea === 0 && !_stats.iHaveVtol()) {
            return PROPULSIONUSAGE.VTOL;
        }
        if (ret.land === 0 && ret.sea !== 0 && !_stats.iHaveHover() && !_stats.iHaveVtol()) {
            return PROPULSIONUSAGE.HOVER;
        }
        return PROPULSIONUSAGE.GROUND;
    },
    doResearch: function (lab) {
        if (_math.defined(forcedResearch)) {
            if (forcedResearch === null) { return false; }
            if (pursueResearch(lab, forcedResearch)) { return true; }
        }
        // if we need to quickly get a certain propulsion to reach the enemy, prioritize that.
        var fastest = this.needFastestResearch();
        if (fastest === PROPULSIONUSAGE.VTOL)
            if (pursueResearch(lab, [
                _stats.propulsionStatsToResList(PROPULSIONUSAGE.VTOL),
                fastestResearch,
            ].random())) { return true; }
        if (fastest === PROPULSIONUSAGE.HOVER)
            if (pursueResearch(lab, [
                _stats.propulsionStatsToResList(PROPULSIONUSAGE.HOVER),
                _stats.propulsionStatsToResList(PROPULSIONUSAGE.VTOL),
                fastestResearch,
            ].random())) { return true; }
        // otherwise, start with completing the fixed research path
        if (_math.defined(personality.earlyResearch) && pursueResearch(lab, personality.earlyResearch)) {
            return true;
        }
        // then, see if we want to research some weapons
        var objType = _adapt.chooseObjectType();
        if (_math.withChance(70)) { // TODO: make a more thoughtful decision here
            var list = _stats.weaponStatsToResList(_stats.chooseAvailableWeaponPathByRoleRatings(personality.weaponPaths, _adapt.chooseWeaponRole()), objType);
            if (pursueResearch(lab, list))
                return true;
        }
        if (_math.withChance(65)) { // TODO: make a more thoughtful decision here
            if (_adapt.chooseBodyClass() === BODYCLASS.KINETIC) {
                if (_math.withChance(40))
                    if (pursueResearch(lab, classResearch.kinetic[objType]))
                        return true;
                if (objType === OBJTYPE.TANK || objType === OBJTYPE.VTOL || (objType === OBJTYPE.DEFS && personality.defensiveness < 100))
                    if (pursueResearch(lab, _stats.bodyStatsToResList(BODYCLASS.KINETIC)))
                        return true;
            } else {
                if (_math.withChance(40))
                    if (pursueResearch(lab, classResearch.thermal[objType]))
                        return true;
                if (objType === OBJTYPE.TANK || objType === OBJTYPE.VTOL || (objType === OBJTYPE.DEFS && personality.defensiveness < 100))
                    if (pursueResearch(lab, _stats.bodyStatsToResList(BODYCLASS.THERMAL)))
                        return true;
            }
        }
        // if nothing of the above holds, do some generic research
        return pursueResearch(lab, fundamentalResearch);
    },
    checkResearch: function () {
        _stats.enumIdleStructList(structures.labs).forEach(doResearch);
    }
};
