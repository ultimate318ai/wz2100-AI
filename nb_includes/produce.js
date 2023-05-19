"use strict";
/*
 * This file is responsible for droid production.
 *
 */
var _production = {

    checkTruckProduction: function () {
        var trucks = enumTrucks();
        var hoverTrucksCount = trucks.filter((droid) => (_stats.isHoverPropulsion(droid.propulsion))).length;
        if (_stats.iHaveHover() && hoverTrucksCount < personality.minHoverTrucks) {
            var groundTrucks = trucks.filter((droid) => (!_stats.isHoverPropulsion(droid.propulsion)));
            if (groundTrucks.length > personality.minTrucks) {
                groundTrucks.length -= personality.minTrucks;
                groundTrucks.forEach((droid) => { orderDroid(droid, DORDER_RECYCLE); });
                return false;
            }
        }
        if (trucks.length >= getDroidLimit(me, DROID_CONSTRUCT))
            return false;
        if (trucks.length < personality.minTrucks || myPower() > personality.maxPower
            || (_stats.iHaveHover() && hoverTrucksCount < personality.minHoverTrucks)
        ) {
            var f;
            f = _stats.enumFinishedStructList(structures.factories)[0];
            if (_math.defined(f) && structureIdle(f) && produceTruck(f))
                return true;
            if (_math.defined(f))
                return false;
            f = _stats.enumFinishedStructList(structures.templateFactories)[0];
            if (_math.defined(f) && structureIdle(f) && produceTemplateFromList(f, truckTemplates))
                return true;
        }
        if (!_stats.iHaveArty())
            return false;
        var sensors = enumDroid(me, DROID_SENSOR).length;
        if (_math.withChance(100 - 100 * sensors / personality.maxSensors)) {
            f = _stats.enumFinishedStructList(structures.factories)[0];
            if (_math.defined(f))
                if (structureIdle(f))
                    if (produceTruck(f, sensorTurrets))
                        return true;
        }
        return false;
    },
    checkProduction: function () {
        switch (_adapt.chooseObjectType()) {
            case 1:
                if (checkTemplateProduction())
                    return;
            case 3:
                if (checkVtolProduction())
                    return;
            default:
                if (checkTankProduction())
                    return;
        }
        // if having too much energy, don't care about what we produce
        if (myPower() > personality.maxPower) {
            queue("checkConstruction");
            checkTemplateProduction();
            checkTankProduction();
            checkVtolProduction();
        }
    }
};

function ourBuildDroid(factory, name, bodies, propulsions, weapons1, weapons2, weapons3) {
    return buildDroid(factory, name, bodies, propulsions, "", "", weapons1, weapons2, weapons3);
}

function produceTruck(factory, turrets) {
    var turret = truckTurrets.concat();
    if (_math.defined(turrets))
        turret = turrets.concat();
    turret.reverse();
    // TODO: switch to using chooseBodyWeaponPair() here
    var bodies = _stats.filterBodyStatsByUsage(BODYUSAGE.TRUCK, BODYCLASS.KINETIC).map((val) => (val.stat));
    var propulsions = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND | PROPULSIONUSAGE.HOVER);
    return ourBuildDroid(factory, "Fancy Truck", bodies, propulsions, turret);
}

function chooseWeapon(forVtol) {
    if (!_math.defined(forVtol))
        forVtol = false;
    if (forVtol) {
        var ret = _stats.chooseAvailableWeaponPathByRoleRatings(_stats.getProductionPaths(), _adapt.chooseAttackWeaponRole(), 3);
        if (_math.defined(ret))
            return ret.vtols.concat().reverse();
    } else {
        var ret = _stats.chooseAvailableWeaponPathByRoleRatings(_stats.getProductionPaths(), _adapt.chooseAttackWeaponRole(), 0);
        if (_math.defined(ret))
            return ret.weapons.concat().reverse();
    }
}

function chooseBodyWeaponPair(bodies, weapons) {
    if (!_math.defined(bodies))
        return undefined;
    if (!_math.defined(weapons))
        return undefined;
    for (let i = 0; i < weapons.length; ++i) {
        var w = weapons[i].stat, ww = weapons[i].weight;
        if (!componentAvailable(w))
            continue;
        for (let j = 0; j < bodies.length; ++j) {
            var b = bodies[j].stat, bw = bodies[j].weight;
            if (!componentAvailable(b))
                continue;
            /* eslint-disable no-unreachable */
            switch (ww) {
                case WEIGHT.ULTRALIGHT:
                    if (bw <= WEIGHT.LIGHT)
                        return { b: b, w: w };
                    break;
                case WEIGHT.LIGHT:
                    if (bw <= WEIGHT.MEDIUM)
                        return { b: b, w: w };
                    break;
                case WEIGHT.MEDIUM:
                    return { b: b, w: w };
                    break;
                case WEIGHT.HEAVY:
                    if (bw >= WEIGHT.MEDIUM)
                        return { b: b, w: w };
                    break;
                case WEIGHT.ULTRAHEAVY:
                    if (bw >= WEIGHT.HEAVY)
                        return { b: b, w: w };
                    break;
            }
            /* eslint-enable no-unreachable */
        }
    }
}

function produceTank(factory) {
    // TODO: needs refactoring. Make some more clever sorting.
    var bodies = [];
    if (_adapt.chooseBodyClass() === BODYCLASS.KINETIC) {
        bodies = bodies.concat(
            _stats.filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.KINETIC),
            _stats.filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.THERMAL)
        );
    } else {
        bodies = bodies.concat(
            _stats.filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.THERMAL),
            _stats.filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.KINETIC)
        );
    }
    var propulsions;
    var ret = _adapt.scopeRatings();
    var rnd = _math.random(ret.land + ret.sea);
    if (!_math.defined(rnd)) // we need only vtols?
        return false;
    propulsions = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND);
    if (_stats.iHaveHover()) {
        if (rnd >= ret.land)
            propulsions = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.HOVER);
    } else {
        if (ret.land === 0)
            return false;
    }
    var bwPair = chooseBodyWeaponPair(bodies, chooseWeapon());
    if (!_math.defined(bwPair))
        return false;
    return ourBuildDroid(factory, "Tank", bwPair.b, propulsions, bwPair.w, bwPair.w, bwPair.w);
}

function produceVtol(factory) {
    // TODO: consider thermal bodies
    var bodies = _stats.filterBodyStatsByUsage(BODYUSAGE.AIR, BODYCLASS.KINETIC)
    var propulsions = _stats.getPropulsionStatsComponents(PROPULSIONUSAGE.VTOL);
    var bwPair = chooseBodyWeaponPair(bodies, chooseWeapon(true));
    if (!_math.defined(bwPair))
        return false;
    return ourBuildDroid(factory, "VTOL", bwPair.b, propulsions, bwPair.w, bwPair.w, bwPair.w);
}

function produceTemplateFromList(factory, list) {
    var ret = _adapt.scopeRatings();
    for (let i = list.length - 1; i >= 0; --i) {
        if (ret.land === 0 && !_stats.isHoverPropulsion(list[i].prop) && !_stats.isVtolPropulsion(list[i].prop))
            continue;
        if (ret.land === 0 && ret.sea === 0 && !_stats.isVtolPropulsion(list[i].prop))
            continue;
        if (_stats.isVtolPropulsion(list[i].prop) !== (factory.stattype === VTOL_FACTORY))
            continue;
        if ((!randomTemplates) || _math.withChance(100 / (i + 1)))
            if (ourBuildDroid(factory, "Template Droid", list[i].body, list[i].prop, list[i].weapons[0], list[i].weapons[1], list[i].weapons[2]))
                return true;
    }
    return false;
}

function produceTemplate(factory) {
    var path = _stats.chooseAvailableWeaponPathByRoleRatings(_stats.getProductionPaths(), _adapt.chooseAttackWeaponRole(), 1);
    if (_math.defined(path))
        return produceTemplateFromList(factory, path.templates);
    return false;
}


function checkTankProduction() {
    if (!iCanDesign())
        return false; // don't cheat by producing tanks before design is available (also saves money for early generators)
    var success = false;
    _stats.enumIdleStructList(structures.factories).forEach((factory) => {
        success = success || produceTank(factory);
    });
    return success;
}

function checkTemplateProduction() {
    var success = false;
    _stats.enumIdleStructList(structures.templateFactories)
        .concat(_stats.enumIdleStructList(structures.vtolFactories))
        .forEach((factory) => {
            success = success || produceTemplate(factory);
        });
    return success;
}

function checkVtolProduction() {
    var success = false;
    if (!iCanDesign())
        return false; // don't cheat by producing vtols before design is available
    _stats.enumIdleStructList(structures.vtolFactories).forEach((factory) => {
        success = success || produceVtol(factory);
    });
    return success;
}