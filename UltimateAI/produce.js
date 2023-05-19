debugMsg('Module: produce.js', 'init');


function prepeareProduce() {
    var hq = enumStruct(me, HQ).filter((e) => (e.status === BUILT));
    if (hq.length > 0) {
        light_bodies = [];
        medium_bodies = [];
        heavy_bodies = [];
        bodies.forEach((e) => {
            switch (e[1]) {
                case "Body1REC":
                case "Body4ABT":
                case "Body2SUP":
                case "Body3MBT":
                    if (getResearch(e[0]).done) light_bodies.unshift(e[1]);
                    break;
                case "Body5REC":
                case "Body8MBT":
                case "Body6SUPP":
                case "Body7ABT":
                    if (getResearch(e[0]).done) medium_bodies.unshift(e[1]);
                    break;
                case "Body11ABT":
                case "Body12SUP":
                case "Body9REC":
                case "Body10MBT":
                case "Body13SUP":
                case "Body14SUP":
                    if (getResearch(e[0]).done) heavy_bodies.unshift(e[1]);
                    break;

            }
        });
        avail_guns = _weaponsGetGuns(3);

        var technology = enumResearch().length;

        avail_cyborgs = [];
        var _cyb = cyborgs.filter((e) => ((getResearch(e[0]).done && technology) || (!technology && e[1] === 'CyborgHeavyBody')));
        for (const i in _cyb) {
            avail_cyborgs.push([_cyb[i][1], _cyb[i][2]]);
        }
        avail_cyborgs.reverse();

        avail_vtols = [];
        var _vtols = vtols.filter((e) => (getResearch(e[0]).done)).sort((a, b) => (
            getResearch(a[0]).points - getResearch(b[0]).points
        ));
        for (const i in _vtols) {
            avail_vtols.push(_vtols[i][1]);
        }
        avail_vtols.reverse();
        avail_vtols.unshift("Bomb3-VTOL-LtINC");
        avail_vtols.unshift("Bomb4-VTOL-HvyINC");
    }

    defence = [];
    towers.forEach((e) => { if (getResearch(e[0]).done) defence.unshift(e[1]); });

    AA_defence = [];
    AA_towers.forEach((e) => { if (getResearch(e[0]).done) AA_defence.unshift(e[1]); });

}

function produceDroids() {
    if (!running) return;
    var droid_factories = enumStruct(me, FACTORY).filter((e) => (e.status === BUILT && structureIdle(e)));
    if (droid_factories.length === 0) return;


    var builders = enumDroid(me, DROID_CONSTRUCT);


    var _body = light_bodies[Math.floor(Math.random() * light_bodies.length)];
    if (droid_factories[0].modules >= 1 && (playerPower(me) > 50 || berserk) && medium_bodies.length > 0) _body = medium_bodies[Math.floor(Math.random() * medium_bodies.length)];
    if (droid_factories[0].modules === 2 && (playerPower(me) > 1000 || berserk) && heavy_bodies.length > 0) _body = heavy_bodies[Math.floor(Math.random() * heavy_bodies.length)];

    var _prop = ['tracked01', 'HalfTrack', 'wheeled01'];
    if (nf['policy'] === 'island') _prop = ['hover01'];
    else if (nf['policy'] === 'both') _prop = ['hover01', 'tracked01', 'HalfTrack', 'wheeled01'];

    if (
        (
            builders.length < (maxConstructors - 3)
            && (getInfoNear(base.x, base.y, 'safe', base_range).value || policy['build'] === 'rich')
        ) && (
            ((playerPower(me) > builderPts || berserk) && builder_targets.length > 7)
            || ((groupSize(buildersMain) === 1 || groupSize(buildersHunters) === 0) && (playerPower(me) > 150 || berserk))
            || builders.length === 0
        )
        && buildersTrigger < gameTime
        && (policy['build'] !== 'rich' || !isFullBase(me) || (builders.length === 0 && (groupSize(armyPartisans) + groupSize(armyRegular) + groupSize(armyCyborgs)) > 10))
    ) {
        buildersTrigger = gameTime + buildersTimer;
        buildDroid(droid_factories[0], "Truck", ['Body2SUP', 'Body4ABT', 'Body1REC'], ['hover01', 'wheeled01'], "", "", "Spade1Mk1");
        return;
    }


    if (enumDroid(me, DROID_SENSOR).length === 0 && getInfoNear(base.x, base.y, 'safe', base_range).value && scannersTrigger < gameTime) {
        var hq = enumStruct(me, HQ).filter((e) => (e.status === BUILT));
        if (hq.length > 0) {
            buildDroid(droid_factories[0], "Scanner", ['Body2SUP', 'Body4ABT', 'Body1REC'], ['hover01', 'HalfTrack', 'wheeled01'], "", "", "SensorTurret1Mk1");
            scannersTrigger = gameTime + scannersTimer;
            return;
        }
    }


    if (policy['build'] !== 'rich' && getInfoNear(base.x, base.y, 'safe', base_range).value && groupSize(armyFixers) < maxFixers && groupSize(armyPartisans) > 5 && fixersTrigger < gameTime
        && (getResearch("R-Sys-MobileRepairTurret01").done || getResearch("R-Sys-MobileRepairTurretHvy").done) && ((playerPower(me) > 300 || berserk) || groupSize(armyFixers) === 0)) {
        fixersTrigger = gameTime + fixersTimer;
        var _repair = "LightRepair1";
        if (getResearch("R-Sys-MobileRepairTurretHvy").done) _repair = "HeavyRepair";
        buildDroid(droid_factories[0], "Fixer", _body, _prop, "", "", _repair);
        return;
    }
    var forceproduce = false;
    if (berserk) {
        var enemyarmy = [];
        for (let e = 0; e < maxPlayers; ++e) {
            if (allianceExistsBetween(me, e)) continue;
            if (seer) {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG));
            } else {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON, me));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG, me));
            }
        }
        var myarmy = [];
        myarmy = myarmy.concat(enumDroid(me, DROID_WEAPON));
        myarmy = myarmy.concat(enumDroid(me, DROID_CYBORG));
        if (myarmy.length <= enemyarmy.length) {
            debugMsg("Droids forceproduce: my " + myarmy.length + " <= enemy " + enemyarmy.length, 'berserk');
            forceproduce = true;
        }
    }

    //Армия
    if (light_bodies.length > 0 && avail_guns.length > 0) {
        //			if (( (groupSize(armyPartisans) < 7 || playerPower(me) > 250) && groupSize(armyPartisans) < maxPartisans) || !getInfoNear(base.x,base.y,'safe',base_range).value) {
        if ((groupSize(armyPartisans) < minPartisans || playerPower(me) > (groupSize(armyPartisans) * 50)) || !getInfoNear(base.x, base.y, 'safe', base_range).value || forceproduce) {
            //				var _weapon = avail_guns[Math.floor(Math.random()*Math.min(avail_guns.length, 5))]; //Случайная из 5 последних крутых пушек
            var _weapon = avail_guns[Math.floor(Math.random() * avail_guns.length)];
            var _second = avail_guns[Math.floor(Math.random() * avail_guns.length)];
            debugMsg(_body + " " + _prop + " " + _weapon, 'template');
            buildDroid(droid_factories[0], "Army", _body, _prop, "", "", _weapon, _second);
        }
    }

}
function produceCyborgs() {
    if (!running) return;
    var cyborg_factories = enumStruct(me, CYBORG_FACTORY).filter((e) => (e.status === BUILT && structureIdle(e)));
    if (cyborg_factories.length === 0) return;


    if (enumStruct(me, FACTORY).length === 0) {
        var cyborg_factories = enumStruct(me, CYBORG_FACTORY).filter((e) => (e.status === BUILT && structureIdle(e)));
        if (cyborg_factories.length > 0) {
            buildDroid(cyborg_factories[0], 'Emergency Builder', 'CyborgLightBody', "CyborgLegs", "", "", 'CyborgSpade');
        }
        return;
    }

    var forceproduce = false;
    if (berserk) {
        var enemyarmy = [];
        for (let e = 0; e < maxPlayers; ++e) {
            if (allianceExistsBetween(me, e)) continue;
            if (seer) {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG));
            } else {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON, me));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG, me));
            }
        }
        var myarmy = [];
        myarmy = myarmy.concat(enumDroid(me, DROID_WEAPON));
        myarmy = myarmy.concat(enumDroid(me, DROID_CYBORG));
        if (myarmy.length <= enemyarmy.length) {
            debugMsg("Cyborg forceproduce: my " + myarmy.length + " <= enemy " + enemyarmy.length, 'berserk');
            forceproduce = true;
        }
    }

    if (nf['policy'] === 'island') return;
    if (groupSize(armyCyborgs) >= maxCyborgs && !forceproduce) return;
    if (!(playerPower(me) > 200 || forceproduce) && groupSize(armyCyborgs) > 2) return;
    //	debugMsg("Cyborg: fact="+cyborg_factories.length+"; cyb="+avail_cyborgs.length, 'production');
    if (avail_cyborgs.length > 0 && (groupSize(armyCyborgs) < minCyborgs || !getInfoNear(base.x, base.y, 'safe', base_range).value || forceproduce)) {
        //		var _cyb = avail_cyborgs[Math.floor(Math.random()*Math.min(avail_cyborgs.length, 5))]; //Случайный киборг из 5 полседних
        var _cyb = avail_cyborgs[Math.floor(Math.random() * avail_cyborgs.length)]; //Случайный киборг из доступных
        var _body = _cyb[0];
        //		var _body = 'CyborgLightBody';
        var _weapon = _cyb[1];
        debugMsg("Cyborg: body=" + _body + "; weapon=" + _weapon, 'production');
        //buildDroid(cyborg_factories[0], "Terminator", _body, "CyborgLegs", "", "", _weapon);
        buildDroid(cyborg_factories[0], _weapon, _body, "CyborgLegs", "", "", _weapon);
    }
}

function produceVTOL() {
    if (!running) return;
    var vtol_factory = enumStruct(me, VTOL_FACTORY);
    var vtol_factories = vtol_factory.filter((e) => (e.status === BUILT && structureIdle(e)));

    if (vtol_factories.length === 0) return;

    var forceproduce = false;
    if (berserk) {
        var enemyarmy = [];
        for (let e = 0; e < maxPlayers; ++e) {
            if (allianceExistsBetween(me, e)) continue;
            if (seer) {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG));
            } else {
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_WEAPON, me));
                enemyarmy = enemyarmy.concat(enumDroid(e, DROID_CYBORG, me));
            }
        }
        var myarmy = [];
        myarmy = myarmy.concat(enumDroid(me, DROID_WEAPON));
        myarmy = myarmy.concat(enumDroid(me, DROID_CYBORG));
        if (myarmy.length <= enemyarmy.length) {
            debugMsg("VTOL forceproduce: my " + myarmy.length + " <= enemy " + enemyarmy.length, 'berserk');
            forceproduce = true;
        }
    }

    if (groupSize(VTOLAttacker) >= maxVTOL && !forceproduce) return;
    if (playerPower(me) < 300 && groupSize(VTOLAttacker) > 3 && !forceproduce) return;
    if (groupSize(VTOLAttacker) > 20 && !forceproduce) return;

    var _body = light_bodies;
    if (((playerPower(me) > 300 && playerPower(me) < 500) || forceproduce) && medium_bodies.length > 0) _body = medium_bodies;
    if ((playerPower(me) > 800 || forceproduce) && heavy_bodies.length > 0) _body = heavy_bodies;
    var _weapon = avail_vtols[Math.floor(Math.random() * Math.min(avail_vtols.length, 5))]; //Случайная из 5 последних крутых пушек
    buildDroid(vtol_factories[0], "Bomber", _body, "V-Tol", "", "", _weapon);

}
