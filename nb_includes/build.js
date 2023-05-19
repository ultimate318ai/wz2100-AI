"use strict";
/*
 * This file describes building construction procedures.
 *
 */

var _build = {
    randomLocation: function () {
        var x = baseLocation.x + random(baseScale) - baseScale / 2;
        var y = baseLocation.y + random(baseScale) - baseScale / 2;
        if (x < 3 || y < 3 || x > mapWidth - 4 || y > mapHeight - 4) {
            return baseLocation;
        }
        return { x: x, y: y };
    },
    safeSpot: function (x, y) {
        return _tactics.dangerLevel({ x: x, y: y }) <= 0;
    },
    truckFree: function (truck) {
        return !(truck.droidType !== DROID_CONSTRUCT || truck.order === DORDER_BUILD || truck.order === DORDER_HELPBUILD
            || truck.order === DORDER_LINEBUILD || truck.order === DORDER_DEMOLISH);
    },
    getTwoFreeTrucks: function () {
        var trucks = enumTrucks().filter(truckFree);
        if (trucks.length > 2) {
            var ret = _math.naiveFindClusters(trucks, baseScale / 2);
            if (ret.maxCount >= 2) {
                trucks = ret.clusters[ret.maxIdx];
            }
        }
        return trucks.slice(0, 2);
    },
    getFreeTruckAround: function (x, y) {
        var list = enumTrucks().filter(truckFree).filter((droid) => (
            droidCanReach(droid, x, y)
        )).sort((one, two) => (_math.distance(one, x, y) - _math.distance(two, x, y)));
        return list.length !== undefined ? list[0] : null;
    },
    buildModule: function (struct) {
        var trucks = _build.getTwoFreeTrucks();
        if (!trucks.length) {
            return BUILDRET.FAILURE;
        }
        var moduleInfo = modules.filter((item) => (isAvailable(item.module) && item.base === struct.stattype)).last();
        if (!_math.defined(moduleInfo)) {
            return BUILDRET.UNAVAILABLE;
        }
        if (struct.modules >= moduleInfo.count) {
            return BUILDRET.UNAVAILABLE;
        }
        var success = false;
        for (let truck of trucks) {
            success = orderDroidBuild(truck, DORDER_BUILD, moduleInfo.module, struct.x, struct.y) || success;
        }
        if (success) {
            return BUILDRET.SUCCESS;
        }
        return BUILDRET.FAILURE;
    },
    buildBasicStructure: function (statlist, importance) {
        if (_intensity.throttled(5000, statlist[0])) return BUILDRET.FAILURE;
        // by default, don't try building things in dangerous locations
        if (!_math.defined(importance))
            importance = IMPORTANCE.MANDATORY;
        var trucks = this.getTwoFreeTrucks();
        if (trucks.length <= 0)
            return BUILDRET.FAILURE;
        // choose structure type (out of the statlist),
        // together with suitable location
        var idx, loc, avail = false;
        for (let i = 0; i < statlist.length; ++i)
            if (isAvailable(statlist[i])) {
                avail = true;
                if (distanceToBase(trucks[0]) <= baseScale)
                    loc = pickStructLocation(trucks[0], statlist[i], trucks[0].x, trucks[0].y);
                else {
                    var rndLoc = randomLocation();
                    loc = pickStructLocation(trucks[0], statlist[i], rndLoc.x, rndLoc.y);
                }
                idx = i;
                break;
            }
        if (!avail)
            return BUILDRET.UNAVAILABLE;
        if (!_math.defined(loc))
            return BUILDRET.FAILURE;
        if (importance === IMPORTANCE.PEACETIME && !this.safeSpot(loc.x, loc.y))
            return BUILDRET.FAILURE;
        // now actually build
        var success = false;
        for (let i = 0; i < trucks.length; ++i)
            success = orderDroidBuild(trucks[i], DORDER_BUILD, statlist[idx], loc.x, loc.y) || success;
        return success ? BUILDRET.SUCCESS : BUILDRET.FAILURE;
    },
    finishStructures: function () {
        var success = false;
        var list = new Array(enumStruct(me).filterProperty("status", BEING_BUILT));
        for (let item of list) {
            if (success)
                return;
            if (_intensity.throttled(10000, item.id))
                return;
            if (item.stattype === RESOURCE_EXTRACTOR)
                return;
            var truck = getFreeTruckAround(item.x, item.y);
            if (!_math.defined(truck))
                return;
            if (orderDroidObj(truck, DORDER_HELPBUILD, item))
                success = true;
        }
        return success;
    },
    buildStructureAround: function (statlist, loc, unique) {
        if (!_math.defined(statlist))
            return BUILDRET.UNAVAILABLE;
        var truck = this.getFreeTruckAround(loc.x, loc.y);
        if (!_math.defined(truck))
            return BUILDRET.FAILURE;
        var stat = statlist.filter(isAvailable).filter((s) => {
            if (unique !== true)
                return true;
            var list = enumStruct(me, s);
            for (let i = 0; i < list.length; ++i)
                if (_math.distance(list[i], loc) < baseScale / 2)
                    return false;
            return true;
        }).last();
        if (!_math.defined(stat))
            return BUILDRET.UNAVAILABLE;
        var loc2 = pickStructLocation(truck, stat, loc.x, loc.y);
        if (!_math.defined(loc2))
            return BUILDRET.FAILURE;
        // if we're not into turtling, don't build too many towers
        if (personality.defensiveness < 100 && _math.distance(loc2, loc) > baseScale / 5)
            return BUILDRET.FAILURE;
        if (orderDroidBuild(truck, DORDER_BUILD, stat, loc2.x, loc2.y))
            return BUILDRET.SUCCESS;
        return BUILDRET.FAILURE;
    },
    captureOil: function (oil) {
        if (!_math.defined(oil))
            return BUILDRET.FAILURE;
        var truck = this.getFreeTruckAround(oil.x, oil.y);
        if (!_math.defined(truck))
            return BUILDRET.FAILURE;
        var stat = structures.derricks.filter(isAvailable).last();
        if (!_math.defined(stat))
            return BUILDRET.UNAVAILABLE;
        if (_intensity.throttled(90000, oil.y * mapWidth + oil.x))
            return BUILDRET.FAILURE;
        if (orderDroidBuild(truck, DORDER_BUILD, stat, oil.x, oil.y))
            return BUILDRET.SUCCESS;
        return BUILDRET.FAILURE;
    },
    chooseDefense: function (defRole) {
        return weaponStatsToDefenses(chooseAvailableWeaponPathByRoleRatings(_stats.getProductionPaths(), _adapt.chooseDefendWeaponRole(), 2, defRole), defRole);
    },
    buildTowers: function () {
        var oils = _stats.enumStructList(structures.derricks);
        if (!oils.length)
            return false;
        if (_math.withChance(70))
            return this.buildStructureAround(this.chooseDefense(DEFROLE.STANDALONE), oils.random()) !== BUILDRET.UNAVAILABLE;
        return this.buildStructureAround(this.chooseDefense(DEFROLE.FORTRESS).concat(structures.sensors), oils.random(), true) !== BUILDRET.UNAVAILABLE;
    },
    buildGateways: function () {
        function uncached() {
            var oils = _stats.countStructList(structures.derricks);
            if (oils <= 0)
                return BUILDRET.FAILURE;
            // lets not cycle through all gateways on the map
            if (!areThereGW())
                return BUILDRET.FAILURE;
            var gates = gateways.filter((gate) => {
                var l = gate.x1 - gate.x2 + gate.y1 - gate.y2;
                if (l < 0)
                    l = -l;
                var cnt = enumRange(gate.x1, gate.y1, l, ALLIES).filterProperty("stattype", DEFENSE).length;
                cnt += enumRange(gate.x2, gate.y2, l, ALLIES).filterProperty("stattype", DEFENSE).length;
                cnt -= enumRange(gate.x1, gate.y1, l, ENEMIES).filterProperty("stattype", DEFENSE).length;
                cnt -= enumRange(gate.x2, gate.y2, l, ENEMIES).filterProperty("stattype", DEFENSE).length;
                return cnt >= 0 && (cnt < l || (personality.defensiveness === 100 && _math.withChance(70))); // turtle AI needs to keep building towers
            }).sort((one, two) => (distanceToBase({ x: one.x1, y: one.y1 }) - distanceToBase({ x: two.x1, y: two.y1 })));
            if (gates.length === 0)
                return BUILDRET.FAILURE;
            if (_math.withChance(50))
                return buildStructureAround(chooseDefense(DEFROLE.GATEWAY), { x: gates[0].x1, y: gates[0].y1 }) !== BUILDRET.UNAVAILABLE;
            else
                return buildStructureAround(chooseDefense(DEFROLE.GATEWAY), { x: gates[0].x2, y: gates[0].y2 }) !== BUILDRET.UNAVAILABLE;
        }
        return _intensity.cached(uncached, 200);
    },
    buildArty: function () {
        return this.buildBasicStructure(chooseDefense(DEFROLE.ARTY), IMPORTANCE.PEACETIME);
    },
    buildMinimum: function (statlist, count, importance) {
        if (_stats.countStructList(statlist) < count)
            if (this.buildBasicStructure(statlist, importance) !== BUILDRET.UNAVAILABLE)
                return true;
        return false;
    },
    captureSomeOil: function () {
        if (_intensity.throttled(500))
            return true;
        function getOilList() {
            var oils = [];
            oilResources.forEach((stat) => { oils = oils.concat(enumFeature(ALL_PLAYERS, stat)); });
            oils = oils.concat(_stats.enumStructList(structures.derricks).filterProperty("status", BEING_BUILT));
            oils = oils.sort((one, two) => (distanceToBase(one) - distanceToBase(two)));
            return oils.slice(0, 10)
        }
        var oils = _intensity.cached(getOilList, 5000);
        if (_stats.countFinishedStructList(structures.derricks) >= 4 * _stats.structListLimit(structures.gens))
            return false;
        for (let oil of oils)
            if (captureOil(oil) === BUILDRET.SUCCESS)
                return true;
        return false;
    },
    buildMinimumDerricks: function (count) {
        if (_stats.countFinishedStructList(structures.derricks) < count)
            if (this.captureSomeOil())
                return true;
        return false;
    },
    buildExpand: function () {
        if (myPower() > personality.maxPower) {
            switch (chooseObjectType()) {
                case 0:
                    if (_research.needFastestResearch() === PROPULSIONUSAGE.GROUND)
                        if (buildMinimum(structures.factories, Infinity, IMPORTANCE.PEACETIME))
                            return true;
                // fall-through
                case 1:
                    if (_research.needFastestResearch() === PROPULSIONUSAGE.GROUND)
                        if (buildMinimum(structures.templateFactories, Infinity, IMPORTANCE.PEACETIME))
                            return true;
                // fall-through
                case 3:
                    if (buildMinimum(structures.vtolFactories, Infinity, IMPORTANCE.PEACETIME))
                        return true;
            }
        }
        return false;
    },
    buildEnergy: function () {
        var oils = _stats.countFinishedStructList(structures.derricks);
        var gens = _stats.countStructList(structures.gens);
        if (oils > 4 * gens)
            if (this.buildBasicStructure(structures.gens, IMPORTANCE.PEACETIME) !== BUILDRET.UNAVAILABLE)
                return true;
        if (_math.withChance(50) && this.captureSomeOil())
            return true;
        return false;
    },
    buildModules: function () {
        var str = [];
        for (let i = 0; i < modules.length; ++i) {
            if (modules[i].base === FACTORY && _research.needFastestResearch() !== PROPULSIONUSAGE.GROUND)
                continue;
            str = enumStruct(me, modules[i].base);
            for (let j = 0; j < str.length; ++j)
                if (buildModule(str[j]) !== BUILDRET.UNAVAILABLE)
                    return true;
        }
        return false;
    },
    buildVtols: function () {
        if (this.buildMinimum(structures.vtolPads, enumDroid(me, DROID_WEAPON).filter(isVTOL).length / 2), IMPORTANCE.PEACETIME)
            return true;
        return false;
    },
    buildExtras: function () {
        if (_intensity.throttled(180000))
            return false;
        if (this.buildBasicStructure(structures.extras, IMPORTANCE.PEACETIME) !== BUILDRET.UNAVAILABLE)
            return true;
        return false;
    },
    buildDefenses: function () {
        if (_adapt.chooseObjectType() !== 2)
            return false;
        if (_math.withChance(33) && areThereGW() && this.buildGateways()) {
            return true;
        } else if (_math.withChance(50) && this.buildTowers()) {
            return true;
        }
        return this.buildArty() > 0;
    },
    listOutdatedDefenses: function () {
        for (const path in weaponStats) {
            for (const role in DEFROLE) {
                var list = _stats.weaponStatsToDefenses(weaponStats[path], DEFROLE[role]);
                for (let i = 0; i < list.length - 2; ++i)
                    if (isAvailable(list[i + 2])) {
                        if (countStruct(list[i]) > 0)
                            return new Array(enumStruct(me, list[i]));
                    }
            }
        }
        return [];
    },
    recycleDefenses: function () {
        var trucks = enumTrucks().filter(truckFree);
        if (trucks.length <= 0)
            return false;
        var list = this.listOutdatedDefenses();
        for (let i = 0; i < list.length; ++i)
            for (let j = 0; j < trucks.length; ++j)
                if (droidCanReach(trucks[j], list[i].x, list[i].y)) {
                    orderDroidObj(trucks[j], DORDER_DEMOLISH, list[i]);
                    return true;
                }
        return false;
    },
    checkConstruction: function () {
        if (enumTrucks().filter(truckFree).length === 0)
            return;
        if (_intensity.functionSeries("construction", [
            finishStructures,
            buildOrder,
            buildExpand,
            buildEnergy,
            buildModules,
            buildVtols,
            buildExtras,
            recycleDefenses,
            buildDefenses,
        ]))
            queue("checkConstruction");
    }
};
