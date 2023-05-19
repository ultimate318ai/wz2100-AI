"use strict";
namespace("bc_");
var vernum = "ultimate318ai";
var verdate = "18.05.2023";
var vername = "BoneCrusher!";
var shortname = "bc";
var release = true;

var MIN_ATTACKERS = 12;
var MIN_NEXUS = 4;
var MAX_DEFENDERS = 8;
var MAX_GLOBAL_DEFENDERS = 25;
var MAX_SENSORS = 5;
var MAX_UNITS = 300;
var MAX_HELICOPTERS = 40;
var MAX_CRANES = 10;

var CRANE_BODY = "B2crane";
var CRANE_WEAP = "scavCrane";

var derrick = "A0ResourceExtractor";
var factoryBaba = "A0BaBaFactory";
var vtolfac = "A0BaBaVtolFactory";
var gen = "A0BaBaPowerGenerator";
var oilres = "OilResource";
var repair = "ScavRepairCentre";
var vtolpad = "A0BaBaVtolPad";

var defenses = [
    "A0BaBaBunker",
    "A0BaBaBunker",
    "A0BaBaBunker",
    "A0CannonTower",
    "A0CannonTower",
    "A0CannonTower",
    "A0BaBaFlameTower",
    "A0BaBaFlameTower",
    "A0BaBaRocketPit",
    "A0BaBaRocketPit",
    "A0BaBaRocketPitAT",
    "A0BaBaMortarPit",
    "bbaatow"
];

var templates = [
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B3body-sml-buggy01-Ultimate", "BuggyMG"],
    ["B3body-sml-buggy01-Ultimate", "BuggyMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B3bodyRKbuggy01-Ultimate", "BabaRocket"],
    ["B3bodyRKbuggy01-Ultimate", "BabaRocket"],
    ["B2RKJeepBody-Ultimate", "BabaRocket"],
    ["B2RKJeepBody-Ultimate", "BabaRocket"],
    ["BusBody", "BusCannon"],
    ["BusBody", "BusCannon"],
    ["BusBody", "BabaPitRocketAT"],
    ["B2tractor", "BabaFlame"],
    ["B2tractor", "BabaFlame"],
    ["B2tractor", "BabaFlame"],
    ["FireBody", "BabaFlame"],
    ["FireBody", "BabaFlame"],
    ["FireBody", "BusCannon"],
    ["FireBody", "BabaPitRocket"],
    ["FireBody", "BabaPitRocketAT"],
    ["ScavCamperBody", "BabaPitRocket"],
    ["ScavCamperBody", "BusCannon"],
    //["ScavTruckBody","BabaFlame","BabaRocket","BabaPitRocketAT"],
    //["ScavTruckBody","BusCannon","BabaPitRocket","BabaRocket"],
    ["ScavIcevanBody", "BabaFlame"],
    ["ScavIcevanBody", "Mortar1Mk1"],
    ["ScavNEXUStrack", "ScavNEXUSlink"],
    ["ScavNEXUStrack", "ScavNEXUSlink"],
    ["ScavNEXUStrack", "ScavNEXUSlink"]
];

var vtolTemplates = [
    ["ScavengerChopper", "MG1-VTOL-SCAVS"],
    ["HeavyChopper", "Rocket-VTOL-Pod-SCAVS"]
];

// scav groups
var globalDefendGroup; // tanks that defend all bases
var needToPickGroup; // a group
var baseInfo = [];
var BASE_FIND_NEAREST = "Base"; //avoid passing a giant baseInfo to findNearest()

var BABA_FACTORY = "A0BaBaFactory";
var BABA_POWER_GEN = "A0BaBaPowerGenerator";
var BABA_VTOL_FACTORY = "A0BaBaVtolFactory";
var BABA_REARM_PAD = "A0BaBaVtolPad";
var BABA_REPAIR_FACILITY = "ScavRepairCentre";

var BABA_DEFENSES = [
    "A0BaBaBunker",
    "A0BaBaBunker",
    "A0BaBaBunker",
    "A0CannonTower",
    "A0CannonTower",
    "A0CannonTower",
    "A0BaBaFlameTower",
    "A0BaBaFlameTower",
    "A0BaBaRocketPit",
    "A0BaBaRocketPit",
    "A0BaBaRocketPitAT",
    "A0BaBaMortarPit",
    "bbaatow",
]

var debugLevels = ['error'];

var debugName = me;


var tech = [];

include("multiplay/skirmish/" + vernum + "/names.js");

//инфа
debugName = colors[playerData[me].colour];

include("multiplay/skirmish/" + vernum + "/functions.js");

//new 3.3+
var research_path = [];
include("multiplay/skirmish/" + vernum + "/research-paths.js");
include("multiplay/skirmish/" + vernum + "/research.js");

include("multiplay/skirmish/" + vernum + "/builders.js");
include("multiplay/skirmish/" + vernum + "/targeting.js");
include("multiplay/skirmish/" + vernum + "/events.js");
include("multiplay/skirmish/" + vernum + "/produce.js");
include("multiplay/skirmish/" + vernum + "/performance.js");
include("multiplay/skirmish/" + vernum + "/chatting.js");
include("multiplay/skirmish/" + vernum + "/tech.js");
include("multiplay/skirmish/" + vernum + "/weapons.js");
include("multiplay/skirmish/" + vernum + "/build-normal.js");




//Hard CPU-load algorythms
var weakCPU = false;

var base_range = 20;

var buildersTimer = 25000;
var fixersTimer = 50000;
var scannersTimer = 300000;
var checkRegularArmyTimer = 10000;
var reactRegularArmyTimer = 10000;
var reactWarriorsTimer = 5000;
var reactPartisanTimer = 20000;
var fullBaseTimer = 60000;

var minBuilders = 5;

var builderPts = 750;

var maxConstructors = 15;

var minPartisans = 7;
var maxPartisans = 15;
var minRegular = 10;
var maxRegular = 50;
var maxVTOL = 40;
var minCyborgs = 20;
var maxCyborgs = 30;
var maxFixers = 5;
var maxJammers = 2;
var maxScouts = 2;

var maxExtractors = 40;
var maxGenerators = 10;

//Performance limits
var ordersLimit = 100;

//functions controller for performance purpose
var func_buildersOrder = true;
var func_buildersOrder_timer = 5000 + me * 100;
var func_buildersOrder_trigger = 0;

var baba_templates = [
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B4body-sml-trike01-Ultimate", "bTrikeMG"],
    ["B3body-sml-buggy01-Ultimate", "BuggyMG"],
    ["B3body-sml-buggy01-Ultimate", "BuggyMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B2JeepBody-Ultimate", "BJeepMG"],
    ["B3bodyRKbuggy01-Ultimate", "BabaRocket"],
    ["B3bodyRKbuggy01-Ultimate", "BabaRocket"],
    ["B2RKJeepBody-Ultimate", "BabaRocket"],
    ["B2RKJeepBody-Ultimate", "BabaRocket"],
    ["BusBody", "BusCannon"],
    ["BusBody", "BusCannon"],
    ["BusBody", "BabaPitRocketAT"],
    ["B2tractor", "BabaFlame"],
    ["B2tractor", "BabaFlame"],
    ["B2tractor", "BabaFlame"],
    ["FireBody", "BabaFlame"],
    ["FireBody", "BabaFlame"],
    ["FireBody", "BusCannon"],
    ["FireBody", "BabaPitRocket"],
    ["FireBody", "BabaPitRocketAT"],
    ["ScavCamperBody", "BabaPitRocket"],
    ["ScavCamperBody", "BusCannon"],
    //["ScavTruckBody","BabaFlame","BabaRocket","BabaPitRocketAT"],
    //["ScavTruckBody","BusCannon","BabaPitRocket","BabaRocket"],
    ["ScavIcevanBody", "BabaFlame"],
    ["ScavIcevanBody", "Mortar1Mk1"],
    ["ScavNEXUStrack", "ScavNEXUSlink"],
    ["ScavNEXUStrack", "ScavNEXUSlink"],
    ["ScavNEXUStrack", "ScavNEXUSlink"],
];

var baba_vtolTemplates = [
    ["ScavengerChopper", "MG1-VTOL-SCAVS"],
    ["HeavyChopper", "Rocket-VTOL-Pod-SCAVS"],
];
// --- CONSTANTS --- \\

//Отсутствующие переменные
const DORDER_NONE = 0;
//const DORDER_RECOVER = 33;


// --- TRIGGERS --- \\

var fullBase = false;
var earlyGame = true;
var running = false;

var produceTrigger = [];

var armyToPlayer = false;
var vtolToPlayer = false;


// --- VARIABLES --- \\


//Координаты всех ресурсов, свободных и занятых
var allResources;

//Координаты нашей базы
var base = { x: 0, y: 0 };
var startPos = { x: 0, y: 0 };

//Массив для союзников
var ally = [];

var enemy = [];

//Массив всех приказов юнитам
var _globalOrders = [];

var build_rich = 26; //Сколько должно быть рядом нефтеточек, что бы изменить механизм постройки на rich
var army_rich = 28; //Сколько должно быть занято нефтеточек, что бы изменить механизм армии на rich

var bc_ally = []; //Союзные ИИ BoneCrusher-ы

var avail_research = [];

//var scavengerPlayer = -1;

var rage = difficulty;

var buildersMain = newGroup();
var buildersHunters = newGroup();

var policy = [];

//Фитчи, не совместимые с 3.1.5
var nf = [];
nf['policy'] = false;

var enemyDist = 0;

var armyPartisans = newGroup();
var armyRegular = newGroup();
var targRegular = { x: 0, y: 0 };
var lastImpact = false;
var pointRegular = false;
var lastEnemiesSeen = 0;
var armyCyborgs = newGroup();
var armyFixers = newGroup();
var armyJammers = newGroup();
var armyScanners = newGroup();
var VTOLAttacker = newGroup();
var droidsRecycle = newGroup();
var droidsBroken = newGroup();
var droidsFleet = newGroup();

var maxFactories, maxFactoriesCyb, maxFactoriesVTOL, maxLabs, maxPads;

//Triggers
var buildersTrigger = 0;
var fixersTrigger = 0;
var scannersTrigger = 0;
var checkRegularArmyTrigger = 0;
var reactRegularArmyTrigger = 0;
var reactWarriorsTrigger = 0;
var fullBaseTrigger = 0;
var partisanTrigger = 0;
var fleetTrigger = 0;

var berserk = false;
var seer = false;
var credit = 0;

var lassat_charged = false;


var eventsRun = [];
eventsRun['targetCyborgs'] = 0;
eventsRun['targetArmy'] = 0;
eventsRun['targetRegular'] = 0;
eventsRun['targetJammers'] = 0;
eventsRun['targetFixers'] = 0;
eventsRun['buildersOrder'] = 0;
eventsRun['victimCyborgs'] = 0;
eventsRun['targetSensors'] = 0;




//old 3.2-
//Предустановки на исследование
var research_way = []; //Главный путь развития, компануется далее, в функциях, в зависимости от уровня сложности и др. настроек
var research_primary = []; //Первичный, один из главных под-путей развития, к которому задаётся режим его исследований(строгий, размазанный или случайный)
const research_synapse = ["R-Struc-Research-Upgrade09"];
const research_power = ["R-Struc-Power-Upgrade03a"];
const research_armor = ["R-Vehicle-Metals09"];
const research_sensor = ["R-Sys-Sensor-UpLink"];

//Переназначаются в функции prepeareProduce() что бы не читерить.
//var light_bodies=["Body3MBT","Body2SUP","Body4ABT","Body1REC"];
var light_bodies = ["Body3MBT", "Body2SUP", "Body1REC"];
var medium_bodies = ["Body7ABT", "Body6SUPP", "Body8MBT", "Body5REC"];
var heavy_bodies = ["Body13SUP", "Body10MBT", "Body9REC", "Body12SUP", "Body11ABT"];
var avail_cyborgs = [];


// Research, Body, Weapon
var cyborgs = [
    //
    ["R-Wpn-Flamer01Mk1", "CyborgLightBody", "CyborgFlamer01"],
    ["R-Wpn-MG4", "CyborgLightBody", "CyborgRotMG"],
    ["R-Wpn-Flame2", "CyborgLightBody", "Cyb-Wpn-Thermite"],
    ["R-Wpn-Cannon1Mk1", "CyborgLightBody", "CyborgCannon"],
    ["R-Wpn-Mortar01Lt", "CyborgLightBody", "Cyb-Wpn-Grenade"],
    ["R-Wpn-Rocket01-LtAT", "CyborgLightBody", "CyborgRocket"],
    ["R-Wpn-Missile2A-T", "CyborgLightBody", "Cyb-Wpn-Atmiss"],
    ["R-Wpn-Laser01", "CyborgLightBody", "Cyb-Wpn-Laser"],
    ["R-Wpn-RailGun01", "CyborgLightBody", "Cyb-Wpn-Rail1"],
    ["R-Cyborg-Hvywpn-A-T", "CyborgHeavyBody", "Cyb-Hvywpn-A-T"],
    ["R-Cyborg-Hvywpn-Mcannon", "CyborgHeavyBody", "Cyb-Hvywpn-Mcannon"],
    ["R-Cyborg-Hvywpn-HPV", "CyborgHeavyBody", "Cyb-Hvywpn-HPV"],
    ["R-Cyborg-Hvywpn-Acannon", "CyborgHeavyBody", "Cyb-Hvywpn-Acannon"],
    ["R-Cyborg-Hvywpn-PulseLsr", "CyborgHeavyBody", "Cyb-Hvywpn-PulseLsr"],
    ["R-Cyborg-Hvywpn-TK", "CyborgHeavyBody", "Cyb-Hvywpn-TK"],
    ["R-Cyborg-Hvywpn-RailGunner", "CyborgHeavyBody", "Cyb-Hvywpn-RailGunner"],

];

var bodies = [
    //
    ["R-Vehicle-Body01", "Body1REC"],
    ["R-Vehicle-Body05", "Body5REC"],
    ["R-Vehicle-Body11", "Body11ABT"],
    //
    ["R-Vehicle-Body04", "Body4ABT"],
    ["R-Vehicle-Body08", "Body8MBT"],
    ["R-Vehicle-Body12", "Body12SUP"],
    //
    ["R-Vehicle-Body02", "Body2SUP"],
    ["R-Vehicle-Body06", "Body6SUPP"],
    ["R-Vehicle-Body09", "Body9REC"],
    //
    ["R-Vehicle-Body03", "Body3MBT"],
    ["R-Vehicle-Body07", "Body7ABT"],
    ["R-Vehicle-Body10", "Body10MBT"],
    //
    ["R-Vehicle-Body13", "Body13SUP"],
    ["R-Vehicle-Body14", "Body14SUP"],
];
var propulsions = [
    [true, "wheeled01"],
    ["R-Vehicle-Prop-Halftracks", "HalfTrack"],
    ["R-Vehicle-Prop-Tracks", "tracked01"],
    ["R-Vehicle-Prop-Hover", "hover01"],
    ["R-Vehicle-Prop-VTOL", "V-Tol"]
];

var avail_vtols = ["MG3-VTOL"];
var vtols = [
    ["R-Wpn-MG3Mk1", "MG3-VTOL"],
    ["R-Wpn-MG4", "MG4ROTARY-VTOL"],
    ["R-Wpn-Cannon4AMk1", "Cannon4AUTO-VTOL"],
    ["R-Wpn-Rocket01-LtAT", "Rocket-VTOL-LtA-T"],
    //["Bomb3-VTOL-LtINC","Bomb3-VTOL-LtINC"],
    //["Bomb4-VTOL-HvyINC","Bomb4-VTOL-HvyINC"],
];

var avail_guns = [];


var defence = [];
var towers = [
    ['R-Defense-Tower01', 'GuardTower1'],
    ['R-Defense-Pillbox01', 'PillBox1'],
    ['R-Defense-WallTower01', 'WallTower01'],
    ['R-Defense-WallTower02', 'WallTower02'],
    ['R-Defense-Tower06', 'GuardTower6'],
    ['R-Defense-Pillbox06', 'GuardTower5'],
    ['R-Defense-WallTower-HPVcannon', 'WallTower-HPVcannon'],
    ['R-Defense-Emplacement-HPVcannon', 'Emplacement-HPVcannon'],
    ['R-Defense-MRL', 'Emplacement-MRL-pit'],
    ['R-Defense-IDFRocket', 'Emplacement-Rocket06-IDF'],
    ['R-Defense-MortarPit', 'Emplacement-MortarPit01'],
    ['R-Defense-RotMor', 'Emplacement-RotMor'],
    ['R-Defense-WallTower-TwinAGun', 'WallTower-TwinAssaultGun'],
    ['R-Defense-MortarPit-Incendiary', 'Emplacement-MortarPit-Incendiary'],
];

var AA_defence = [];
var AA_queue = [];
var AA_towers = [
    ['R-Defense-AASite-QuadMg1', 'AASite-QuadMg1'],
    ['R-Defense-AASite-QuadBof', 'AASite-QuadBof'],
    ['R-Defense-WallTower-DoubleAAgun', 'WallTower-DoubleAAGun'],
    ['R-Defense-Sunburst', 'P0-AASite-Sunburst'],
    ['R-Defense-SamSite1', 'P0-AASite-SAM1'],
    ['R-Defense-SamSite2', 'P0-AASite-SAM2'],
    ['R-Defense-WallTower-QuadRotAA', 'WallTower-QuadRotAAGun'],
    ['R-Defense-AA-Laser', 'P0-AASite-Laser'],
];

/**
 * Init the IA, like main function.
 */
function init() {
    if (modList.indexOf('oilfinite') !== -1) {
        nf['oilfinite'] = true;
    }
    initBase();
    startPos = base;

    var technology = enumResearch();

    var freeResources = getFreeResources();
    var nearResources = freeResources.filter((e) => (distBetweenTwoPoints_p(base.x, base.y, e.x, e.y) < base_range));
    nearResources = nearResources.concat(enumStruct(me, "A0ResourceExtractor").filter((e) => (distBetweenTwoPoints_p(base.x, base.y, e.x, e.y) < base_range)));

    allResources = getAllResources();

    var access = false;
    playerData.forEach((data, player) => {
        var msg = "Игрок №" + player + " " + colors[data.colour];
        var dist = distBetweenTwoPoints_p(base.x, base.y, startPositions[player].x, startPositions[player].y);

        if (player === me) {
            msg += " я сам ИИ";
            bc_ally.push(player);
        }
        else if (playerLoose(player)) { msg += " отсутствует"; }
        else if (playerSpectator(player)) { msg += " наблюдатель"; }
        else if (allianceExistsBetween(me, player)) {
            msg += " мой союзник ";
            ally.push(player);
            if (data.name === 'bc-master' || data.name.substr(0, 11) === "BoneCrusher") { msg += "BC!"; bc_ally.push(player); }
            else { msg += data.name; }
        }
        else {
            msg += " мой враг";
            enemy.push(player);
            if (propulsionCanReach('wheeled01', base.x, base.y, startPositions[player].x, startPositions[player].y)) { msg += ", по земле"; access = 'land'; }
            else if (propulsionCanReach('hover01', base.x, base.y, startPositions[player].x, startPositions[player].y)) { msg += ", по воде"; access = 'island'; }
            else if (propulsionCanReach('V-Tol', base.x, base.y, startPositions[player].x, startPositions[player].y)) { msg += ", по воздуху"; access = 'air'; }
            else { msg += ", не доступен!"; access = 'island'; }
            if (!nf['policy'] || nf['policy'] === 'island' || nf['policy'] === 'air') { nf['policy'] = access; }
        }

        msg += " [" + startPositions[player].x + "x" + startPositions[player].y + "]";
        msg += " дист. " + dist;

    });
    if (nearResources.length >= build_rich) {
        policy['build'] = 'rich';
        initBase();
    } else {
        policy['build'] = 'standart';
    }
    if (policy['build'] === 'rich') {

        if (bc_ally.length > 1) {
            var researches = [research_rich2, research_fire1, research_cannon, research_fire2, research_rich, research_rockets];
            var r = bc_ally.indexOf(me) % researches.length;
            research_path = researches[r];
        } else {
            var researches = [
                research_rich2, research_rich2, research_rich2, research_rich2, research_rich2,
                research_cannon, research_cannon,
                research_fire2,
                research_rich, research_rich, research_rich,
                research_fire1, research_fire1,
                research_fire3, research_fire3, research_fire3,
                research_rockets];
            var r = Math.floor(Math.random() * researches.length);
            research_path = researches[r];
        }

        if (technology.length) cyborgs.unshift(["R-Wpn-MG1Mk1", "CyborgLightBody", "CyborgChaingun"]);

        buildersTimer = 7000;
        minBuilders = 10;
        minPartisans = 1;
        maxPartisans = 4;
        builderPts = 150;
        maxRegular = 100;
        scannersTimer = 120000;
    } else {
        if (bc_ally.length > 1) {
            var researches = [research_fire1, research_cannon, research_fire2, research_rich, research_rockets];
            var r = bc_ally.indexOf(me) % researches.length;
            research_path = researches[r];
        } else {

            var researches = [
                research_rich2,
                research_cannon, research_cannon, research_cannon, research_cannon, research_cannon,
                research_fire2,
                research_rich,
                research_fire1,
                research_fire3, research_fire3,
                research_rockets];

            var r = Math.floor(Math.random() * researches.length);
            research_path = researches[r];
        }
    }

    if (nf['oilfinite']) research_path = research_earlygame.concat(["R-Sys-MobileRepairTurret01"]).concat(research_path).concat(research_lasttech);
    else research_path = research_earlygame.concat(research_path).concat(research_lasttech);

    maxFactories = getStructureLimit("A0LightFactory", me);
    maxLabs = getStructureLimit("A0ResearchFacility", me);
    maxGenerators = getStructureLimit("A0PowerGenerator", me);
    maxFactoriesCyb = getStructureLimit("A0CyborgFactory", me);
    maxFactoriesVTOL = getStructureLimit("A0VTolFactory1", me);
    maxPads = getStructureLimit("A0VtolPad", me);


    if (rage === EASY) {
        debugMsg("Похоже я играю с нубами, будем поддаваться:", 'init');

        research_path = research_earlygame;

        (maxPartisans > 7) ? maxPartisans = 7 : {};
        maxRegular = 0;
        (maxVTOL > 5) ? maxVTOL = 5 : {};
        (maxCyborgs > 5) ? maxCyborgs = 5 : {};
        (maxFixers > 2) ? maxFixers = 2 : {};

        (maxConstructors > 7) ? maxConstructors = 7 : {};
        (minBuilders > 3) ? minBuilders = 3 : {};

        (maxFactories > 2) ? maxFactories = 2 : {};
        (maxFactoriesCyb > 1) ? maxFactoriesCyb = 1 : {};
        (maxFactoriesVTOL > 1) ? maxFactoriesVTOL = 1 : {};
        (maxPads > 2) ? maxPads = 2 : {};

        maxJammers = 0;
        buildersTimer = 60000;



    } else if (rage === MEDIUM) {
        buildersTimer = buildersTimer + Math.floor(Math.random() * 5000 - 2000);
        minBuilders = minBuilders + Math.floor(Math.random() * 5 - 2);
        builderPts = builderPts + Math.floor(Math.random() * 200 - 150);
        minPartisans = minPartisans + Math.floor(Math.random() * 6 - 4);

        if (alliancesType === 2 && isHumanAlly()) { research_path = research_earlygame.concat(research_lasttech); }

    }
    if (nf['policy'] === 'island') {
        switchToIsland();
    }

    queue("checkAlly", 2000);
    letsRockThisFxxxingWorld();
}
function enableStandardIA() {
    if (rage === EASY) {
        setTimer("produceDroids", 10000 + me * 100);
        setTimer("produceVTOL", 12000 + me * 100);
        setTimer("checkEventIdle", 60000 + me * 100);
        setTimer("doResearch", 60000 + me * 100);
        setTimer("defenceQueue", 60000 + me * 100);
        setTimer("produceCyborgs", 25000 + me * 100);
        setTimer("targetVTOL", 120000 + me * 100);
    }
    else if (rage === MEDIUM) {
        setTimer("produceDroids", 7000 + me * 100);
        setTimer("produceVTOL", 8000 + me * 100);
        setTimer("produceCyborgs", 9000 + me * 100);
        setTimer("checkEventIdle", 30000 + me * 100);
        setTimer("doResearch", 30000 + me * 100);
        setTimer("defenceQueue", 60000 + me * 100);
        setTimer("targetVTOL", 56000 + me * 100);
        setTimer("targetRegular", 65000 + me * 100);
    } else if (rage === HARD) {
        setTimer("targetPartisan", 5000 + me * 100);
        setTimer("produceDroids", 6000 + me * 100);
        setTimer("produceVTOL", 6500 + me * 100);
        setTimer("produceCyborgs", 7000 + me * 100);
        setTimer("targetCyborgs", 7000 + me * 100);
        setTimer("targetFixers", 8000 + me * 100);
        setTimer("targetRegular", 10000 + me * 100);
        setTimer("doResearch", 12000 + me * 100);
        setTimer("defenceQueue", 30000 + me * 100);
        setTimer("targetVTOL", 56000 + me * 100);
    }
    baba_eventStopLevel();
}
function letsRockThisFxxxingWorld() {

    include("multiplay/skirmish/" + vernum + "/weap-init.js");

    //Remove chaingun and flamer cyborgs if better available
    cyborgs = cyborgs.filter((e) => (!((e[2] === 'CyborgChaingun' && getResearch('R-Wpn-MG4').done) || (e[2] === 'CyborgFlamer01' && getResearch('R-Wpn-Flame2').done))));

    enumDroid(me, DROID_CYBORG).forEach((e) => { groupAdd(armyCyborgs, e); });
    enumDroid(me, DROID_WEAPON).forEach((e) => { groupAdd(armyCyborgs, e); });

    setTimer("secondTick", 1000);
    queue("buildersOrder", 1000);
    queue("prepeareProduce", 2000);
    queue("produceThings", 3000);
    queue("doResearch", 3000);
    setTimer("longCycle", 120000);

    running = true;
    setupScavenger();
    baba_eventStartLevel();
    if (rage === MEDIUM) {
        if (policy['build'] === 'rich') func_buildersOrder_timer = 5000 + me * 100;
    } else if (rage === HARD) {
        reactRegularArmyTimer = 5000;
        checkRegularArmyTimer = 5000;
        reactWarriorsTimer = 2000;
        func_buildersOrder_timer = 2000 + me * 100;
    }
    if (rage === INSANE) {
        reactRegularArmyTimer = 5000;
        checkRegularArmyTimer = 5000;
        reactWarriorsTimer = 2000;
        func_buildersOrder_timer = 2000 + me * 100;
    }

    if (!release) {
        setTimer("stats", 10000);
    }
    setTimer("enableStandardIA", rage === MEDIUM ? 300000 : rage === HARD ? 15000 : rage === INSANE ? 1000 : 10000000)
    setTimer("checkProcess", 60000 + me * 100);
}

function initBase() {
    checkBase();
    var _builders = enumDroid(me, DROID_CONSTRUCT);

    var _r = Math.floor(Math.random() * _builders.length);
    if (_builders.length > 0) base = { x: _builders[_r].x, y: _builders[_r].y };

    _builders.forEach((e) => { groupBuilders(e); });

    if (policy['build'] === 'rich' && _builders.length > 4) {
        groupAdd(buildersHunters, _builders[0]);
    }
    if (!release) mark(base.x, base.y);
}

function debugMsg(msg, level) {
    if (typeof level === "undefined") return;
    if (debugLevels.indexOf(level) === -1) return;
    var timeMsg = Math.floor(gameTime / 1000);
    debug(shortname + "[" + timeMsg + "]{" + debugName + "}(" + level + "): " + msg);
}

function bc_eventStartLevel() {
    if (version !== '3.3.0')
        queue("init", 1000);
}

function bc_eventGameLoaded() {
    queue("init", 1000);
}

function bc_eventGameSaving() {
    running = false;
}

function bc_eventGameSaved() {
    running = true;
}


// unit limit constant
function atLimits() {
    return countDroid(DROID_ANY, me) >= MAX_UNITS;
}

// random integer between 0 and max-1 (for convenience)
function random(max) {
    return (max <= 0) ? 0 : Math.floor(Math.random() * max);
}

// Returns true if something is defined
function isDefined(data) {
    return typeof data !== "undefined";
}

function isCopterPropulsion(droidProp) {
    var helicopterPropulsions = [
        "Helicopter"
    ];

    for (let i = 0, len = helicopterPropulsions.length; i < len; ++i) {
        var propulsion = helicopterPropulsions[i];

        if (propulsion === droidProp) {
            return true;
        }
    }

    return false;
}

function helicoptersAreAllowed() {
    if (getMultiTechLevel() === 1) {
        if ((baseType === CAMP_CLEAN && gameTime > (10 * 60000)) ||
            (baseType === CAMP_BASE && gameTime > (7 * 60000)) ||
            (baseType === CAMP_WALLS && gameTime > (4 * 60000))) {
            return true;
        }

        return false;
    }

    return true;
}

// Make sure a unit does not try to go off map
function mapLimits(x, y, num1, num2, xOffset, yOffset) {
    var xPos = x + xOffset + random(num1) - num2;
    var yPos = y + yOffset + random(num1) - num2;

    if (xPos < 2) {
        xPos = 2;
    }
    if (yPos < 2) {
        yPos = 2;
    }
    if (xPos >= mapWidth - 2) {
        xPos = mapWidth - 3;
    }
    if (yPos >= mapHeight - 2) {
        yPos = mapHeight - 3;
    }

    return { x: xPos, y: yPos };
}

//Return a closeby enemy object. Will be undefined if none.
function rangeStep(obj, visibility) {
    const MAX_TILE_LIMIT = 250;
    const STEP = 25;
    var target;

    for (let i = 0; i <= MAX_TILE_LIMIT; i += STEP) {
        var temp = enumRange(obj.x, obj.y, i, ENEMIES, visibility);
        if (temp.length > 0) {
            target = findNearest(temp, obj.x, obj.y, true);
            break;
        }
    }

    return target;
}

function constructBaseInfo(factory) {
    var info = {
        x: factory.x,
        y: factory.y,
        id: factory.id,
        defendGroup: newGroup(),
        nexusGroup: newGroup(),
        builderGroup: newGroup(),
        attackGroup: newGroup(),
        helicopterAttackers: newGroup(),
    };

    return info;
}

function findNearest(list, x, y, flag) {
    if (typeof list === "string" && list === BASE_FIND_NEAREST) {
        list = baseInfo;
    }

    var minDist = Infinity, minIdx;
    for (let i = 0, len = list.length; i < len; ++i) {
        var d = distBetweenTwoPoints(list[i].x, list[i].y, x, y);
        if (d < minDist) {
            minDist = d;
            minIdx = i;
        }
    }

    if (!isDefined(minIdx)) {
        return undefined;
    }

    return (flag === true) ? list[minIdx] : minIdx;
}

function reviseGroups() {
    var list = enumGroup(needToPickGroup);
    for (let i = 0, len = list.length; i < len; ++i) {
        var droid = list[i];
        if (addDroidToSomeGroup(droid)) {
            var coords = mapLimits(droid.x, droid.y, 15, 7, 0, 0);
            orderDroidLoc(droid, DORDER_SCOUT, coords.x, coords.y);
        }
    }
}

function addDroidToSomeGroup(droid) {
    var base = findNearest(BASE_FIND_NEAREST, droid.x, droid.y, true);
    if (!base) {
        return false;
    }

    switch (droid.droidType) {
        case DROID_CONSTRUCT:
            {
                groupAddDroid(base.builderGroup, droid);
                break;
            }
        case DROID_WEAPON:
            {
                if (droid.name.indexOf("Nexus") > -1) {
                    if (groupSize(base.nexusGroup) < MIN_NEXUS) {
                        groupAddDroid(base.nexusGroup, droid);
                    }
                    break;
                }

                if (isCopterPropulsion(droid.propulsion)) {
                    groupAddDroid(base.helicopterAttackers, droid);
                    break;
                }

                if (groupSize(base.defendGroup) < MAX_DEFENDERS) {
                    groupAddDroid(base.defendGroup, droid);
                    break;
                }

                if (groupSize(base.attackGroup) < MIN_ATTACKERS) {
                    groupAddDroid(base.attackGroup, droid);
                    break;
                }

                if (groupSize(globalDefendGroup) < MAX_GLOBAL_DEFENDERS) {
                    groupAddDroid(globalDefendGroup, droid);
                    break;
                }
                else {
                    groupAddDroid(base.attackGroup, droid);
                }
            }
            break;
        case DROID_SENSOR:
            {
                groupAddDroid(base.attackGroup, droid);
            }
            break;
    }

    return true;
}

function groupOfTank(droid) {
    for (let i = 0, b = baseInfo.length; i < b; ++i) {
        if (droid.group === baseInfo[i].attackGroup) {
            return baseInfo[i].attackGroup;
        }

        if (droid.group === baseInfo[i].nexusGroup) {
            return baseInfo[i].nexusGroup;
        }
    }
}

function buildStructure(droid, stat) {
    if (droid.order !== DORDER_BUILD && isStructureAvailable(stat, me)) {
        const MAX_BLOCK_TILES = 0;
        var loc = pickStructLocation(droid, stat, droid.x, droid.y, MAX_BLOCK_TILES);

        if (loc && orderDroidBuild(droid, DORDER_BUILD, stat, loc.x, loc.y)) {
            return true;
        }
    }

    return false;
}

function buildTower(droid) {
    return buildStructure(droid, defenses[random(defenses.length)]);
}

function buildThingsWithDroid(droid) {
    const MAX_FACTORY_COUNT = 100;

    switch (random(7)) {
        case 0:
            if ((countStruct(factoryBaba) < MAX_FACTORY_COUNT) && (((5 * countStruct(factoryBaba)) < countStruct(derrick)) || (playerPower(me) > 500))) {
                buildStructure(droid, factoryBaba);
            }
            break;
        case 1:
            if ((countStruct(derrick) - (countStruct(gen) * 4)) > 0) {
                buildStructure(droid, gen);
            }
            break;
        case 2:
            if (helicoptersAreAllowed() && (4 * countStruct(vtolfac)) < countStruct(factoryBaba)) {
                buildStructure(droid, vtolfac);
            }
            break;
        case 3:
            var result = findNearest(enumFeature(ALL_PLAYERS, oilres), droid.x, droid.y, true);
            if (result) {
                orderDroidBuild(droid, DORDER_BUILD, derrick, result.x, result.y);
            }
            break;
        case 4:
            if ((playerPower(me) > 60) && (countStruct(repair) < 5) && (gameTime > 200000)) {
                buildStructure(droid, repair);
            }
            break;
        case 5:
            if (countHelicopters() > 2 * countStruct(vtolpad)) {
                buildStructure(droid, vtolpad);
            }
            break;
        default:
            if (playerPower(me) > 150) {
                buildTower(droid);
            }
            break;
    }
}

function buildThings() {
    var list = enumDroid(me, DROID_CONSTRUCT);

    for (let i = 0, len = list.length; i < len; ++i) {
        var droid = list[i];
        if (droid.order !== DORDER_RTR && droid.order !== DORDER_BUILD) {
            //Build a defense at an enemy derrick should we happen to be idle near one
            for (let j = 0; j < maxPlayers; ++j) {
                var dlist = enumStruct(j, derrick);
                for (let x = 0, len2 = dlist.length; x < len2; ++x) {
                    var enemy_derrick = dlist[x];
                    if (distBetweenTwoPoints(droid.x, droid.y, enemy_derrick.x, enemy_derrick.y) < 3) {
                        buildTower(droid);
                    }
                }
            }
            buildThingsWithDroid(droid);
        }
    }
}

function scavBuildDroid(fac, name, body, prop, weapon) {
    var success = false;

    if (weapon.length === 3) {
        success = buildDroid(fac, name, body, prop, "", "", weapon[0], weapon[1], weapon[2]);
    }
    else if (weapon.length === 2) {
        success = buildDroid(fac, name, body, prop, "", "", weapon[0], weapon[1]);
    }
    else {
        success = buildDroid(fac, name, body, prop, "", "", weapon[0]);
    }

    return success;
}

function produceCrane(fac) {
    if (countDroid(DROID_CONSTRUCT, me) >= MAX_CRANES) {
        return false;
    }

    var num = random(2) + 1; // Choose crane 1 or 2.

    return buildDroid(fac, "Crane", CRANE_BODY + num, "BaBaProp", "", "", CRANE_WEAP + num);
}

function baba_produceDroid(fac) {
    const MIN_CRANES = 4;
    var craneCount = countDroid(DROID_CONSTRUCT, me);

    if ((craneCount < MIN_CRANES) || ((craneCount < MAX_CRANES) && !random(10))) {
        produceCrane(fac);
        return;
    }

    var weapons = [];
    if (!random(10)) {
        if (countDroid(DROID_SENSOR, me) < MAX_SENSORS) {
            weapons.push("ScavSensor");
            scavBuildDroid(fac, "Sensor", "BusBody", "BaBaProp", weapons);
        }
    }
    else {
        var j = random(templates.length);
        var name = (templates[j][1].indexOf("NEXUS") > -1) ? "Nexus Tank" : "Scavenger unit";

        for (let x = 1; x < templates[j].length; ++x) {
            var weapon = templates[j][x];
            weapons.push(weapon);
        }

        scavBuildDroid(fac, name, templates[j][0], "BaBaProp", weapons);
    }
}

function produceHelicopter(fac) {
    var j = random(vtolTemplates.length);
    var weapons = [];

    for (let x = 1; x < vtolTemplates[j].length; ++x) {
        var weapon = vtolTemplates[j][x];
        weapons.push(weapon);
    }

    scavBuildDroid(fac, "ScavengerHelicopter", vtolTemplates[j][0], "Helicopter", weapons);
}

function produceThings() {
    if (atLimits()) {
        return;
    }

    var list = enumStruct(me, factoryBaba).concat(enumStruct(me, vtolfac));
    for (let i = 0, len = list.length; i < len; ++i) {
        var fac = list[i];

        if (structureIdle(fac) && fac.status === BUILT) {
            if (fac.stattype === FACTORY) {
                baba_produceDroid(fac);
            }
            else if (fac.stattype === VTOL_FACTORY) {
                produceHelicopter(fac);
            }
        }
    }
}

function attackWithDroid(droid, target, force) {
    if (isCopterPropulsion(droid.propulsion) || droid.order === DORDER_RTR) {
        return;
    }

    if (droid.droidType === DROID_WEAPON) {
        if ((droid.order !== DORDER_ATTACK) || force) {
            orderDroidObj(droid, DORDER_ATTACK, target);
        }
    }
    else if (droid.droidType === DROID_SENSOR) {
        if ((droid.order !== DORDER_OBSERVE) || force) {
            orderDroidObj(droid, DORDER_OBSERVE, target);
        }
    }
}

function helicopterArmed(obj) {
    for (let i = 0, len = obj.weapons.length; i < len; ++i) {
        var weapon = obj.weapons[i];
        if (weapon.armed > 0) {
            return true;
        }
    }

    return false;
}

function helicopterReady(droid) {
    if (droid.order === DORDER_REARM) {
        return false;
    }
    if (helicopterArmed(droid) && droid.health > 50) {
        return true;
    }
    if (droid.order !== DORDER_REARM) {
        orderDroid(droid, DORDER_REARM);
    }

    return false;
}

//Helicopters can only attack things that the scavengers have seen
function helicopterAttack() {
    for (let i = 0, len = baseInfo.length; i < len; ++i) {
        var base = baseInfo[i];
        var copters = enumGroup(base.helicopterAttackers);
        var target = rangeStep(base, false);

        for (let j = 0, len2 = copters.length; j < len2; ++j) {
            var coords = [];
            var droid = copters[j];

            if (!helicopterReady(droid)) {
                continue;
            }

            if (target) {
                coords = mapLimits(target.x, target.y, 5, 2, 0, 0);
            }
            else {
                var xOff = random(2);
                var yOff = random(2);
                xOff = (!xOff) ? -random(10) : random(10);
                yOff = (!yOff) ? -random(10) : random(10);
                coords = mapLimits(droid.x, droid.y, 5, 2, xOff, yOff);
            }

            orderDroidLoc(droid, DORDER_SCOUT, coords.x, coords.y);
        }
    }
}

//Ignores lifts
function countHelicopters() {
    var count = 0;

    enumDroid(me).forEach((droid) => {
        if (isCopterPropulsion(droid.propulsion)) {
            ++count;
        }
    });
    return count;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function groundAttackStuff() {
    for (let i = 0, len = baseInfo.length; i < len; ++i) {
        var base = baseInfo[i];
        var target = rangeStep(base, false);
        if (target) {
            var attackDroids = enumGroup(base.attackGroup);
            var nexusDroids = enumGroup(base.nexusGroup);
            if (groupSize(base.attackGroup) > MIN_ATTACKERS) {
                for (let droidIdx = 0, len2 = attackDroids.length; droidIdx < len2; ++droidIdx) {
                    attackWithDroid(attackDroids[droidIdx], target, false);
                }
            }

            if (groupSize(base.nexusGroup) > MIN_NEXUS) {
                for (let droidIdx = 0, len2 = nexusDroids.length; droidIdx < len2; ++droidIdx) {
                    attackWithDroid(nexusDroids[droidIdx], target, false);
                }
            }
        }
    }
}

function baba_eventAttacked(victim, attacker) {
    // don't quarrel because of friendly splash damage
    if (attacker === null || victim.player !== me || attacker.player === me) {
        return;
    }

    var droids = enumGroup(globalDefendGroup);
    for (let i = 0, len = droids.length; i < len; ++i) {
        var droid = droids[i];
        if (droid.order !== DORDER_ATTACK) {
            attackWithDroid(droid, attacker, true);
        }
    }

    if (victim.type === STRUCTURE) {
        var base = findNearest(BASE_FIND_NEAREST, victim.x, victim.y, true);
        if (!base) {
            return;
        }

        var list = enumGroup(base.defendGroup);

        //Let this base build more defense units then
        if (list.length < Math.floor(MAX_DEFENDERS / 2)) {
            list = enumGroup(base.attackDroids);
        }

        for (let i = 0, len = list.length; i < len; ++i) {
            attackWithDroid(list[i], attacker, true);
        }
    }
    else if (victim.type === DROID) {
        if (isCopterPropulsion(victim.propulsion)) {
            return;
        }

        retreat(victim);
    }
}

function baba_eventDroidBuilt(droid, fac) {
    groupAddDroid(needToPickGroup, droid);
    reviseGroups();
}

function baba_eventStructureBuilt(structure, droid) {
    if (structure.stattype === FACTORY) {
        baseInfo.push(constructBaseInfo(structure));
        if (droid) {
            groupAddDroid(baseInfo[baseInfo.length - 1].builderGroup, droid);
        }

        if (!produceCrane(structure)) {
            baba_produceDroid(structure);
        }
    }
    else if (structure.stattype === VTOL_FACTORY) {
        produceHelicopter(structure);
    }
}

// respond correctly on unit transfers
function baba_eventObjectTransfer(object, from) {
    if (object.player !== me) {
        return; //not mine
    }

    if (object.type === DROID) {
        baba_eventDroidBuilt(object, null);
    }
    else {
        baba_eventStructureBuilt(object, null);
    }
}

function retreat(obj) {
    const REPAIR_PERCENT = 85;

    if (obj.type === DROID && obj.order !== DORDER_RTR) {
        if (!isCopterPropulsion(obj.propulsion) && obj.health < REPAIR_PERCENT) {
            orderDroid(obj, DORDER_RTR);
        }
    }
}

//Check to see if a base factory still exists, and, if not, then free its groups
//and put them into another base.
function cleanupBaseInfo() {
    var units = [];

    for (let i = 0, len = baseInfo.length; i < len; ++i) {
        var base = baseInfo[i];
        var factory = getObject(STRUCTURE, me, base.id);

        if (factory === null) {
            var atk = enumGroup(base.attackGroup);
            var nex = enumGroup(base.nexusGroup);
            var def = enumGroup(base.defendGroup);
            var con = enumGroup(base.builderGroup);
            var cop = enumGroup(base.helicopterAttackers);
            units = atk.concat(nex).concat(def).concat(con).concat(cop);
            baseInfo.splice(i, 1);
            break;
        }
    }

    for (let i = 0, len = units.length; i < len; ++i) {
        var droid = units[i];
        groupAddDroid(needToPickGroup, droid);
    }

    reviseGroups();
}

function baba_eventStartLevel() {
    var factories = enumStruct(me, factoryBaba);
    for (let i = 0, len = factories.length; i < len; ++i) {
        var fac = factories[i];
        baseInfo.push(constructBaseInfo(fac));
    }

    var droids = enumDroid(me);
    for (let i = 0, len = droids.length; i < len; ++i) {
        addDroidToSomeGroup(droids[i]);
    }

    globalDefendGroup = newGroup();
    needToPickGroup = newGroup();

    produceThings();
    setTimer("produceThings", 300);
    setTimer("buildThings", 900);
    setTimer("groundAttackStuff", 1200);
    setTimer("helicopterAttack", 2900);
    setTimer("cleanupBaseInfo", 8000);
}
function baba_eventStopLevel() {
    removeTimer("produceThings");
    removeTimer("buildThings");
    removeTimer("groundAttackStuff");
    removeTimer("helicopterAttack");
    removeTimer("cleanupBaseInfo");
}

function setupScavenger() {

    for (let i = 0, len = templates.length; i < len; ++i) {
        makeComponentAvailable(templates[i][0], me);
        makeComponentAvailable(templates[i][1], me);

        if (isDefined(templates[i][2])) {
            makeComponentAvailable(templates[i][2], me);
        }

        if (isDefined(templates[i][3])) {
            makeComponentAvailable(templates[i][3], me);
        }
    }

    for (let i = 0, len = vtolTemplates.length; i < len; ++i) {

        makeComponentAvailable(vtolTemplates[i][0], me);
        makeComponentAvailable(vtolTemplates[i][1], me);

        if (isDefined(vtolTemplates[i][2])) {
            makeComponentAvailable(vtolTemplates[i][2], me);
        }

        if (isDefined(vtolTemplates[i][3])) {
            makeComponentAvailable(vtolTemplates[i][3], me);
        }

    }

    const SCAV_COMPONENTS = [
        "B4body-sml-trike01",
        "B3body-sml-buggy01",
        "B2JeepBody",
        "BusBody",
        "FireBody",
        "B1BaBaPerson01",
        "BaBaProp",
        "BaBaLegs",
        "bTrikeMG",
        "BuggyMG",
        "BJeepMG",
        "BusCannon",
        "BabaFlame",
        "BaBaMG",
        "B2crane1",
        "scavCrane1",
        "B2crane2",
        "scavCrane2",
        "ScavSensor",
        "Helicopter",
        "B2RKJeepBody",
        "B2tractor",
        "B3bodyRKbuggy01",
        "HeavyChopper",
        "ScavCamperBody",
        "ScavengerChopper",
        "ScavIcevanBody",
        "ScavNEXUSbody",
        "ScavNEXUStrack",
        "ScavTruckBody",
        "MG1-VTOL-SCAVS",
        "Rocket-VTOL-Pod-SCAVS",
        "ScavNEXUSlink",
        "BaBaCannon",
        "BabaPitRocket",
        "BabaPitRocketAT",
        "BabaRocket",
        "BTowerMG",
        "Mortar1Mk1",
        "B4body-sml-trike01-Ultimate",
        "B3body-sml-buggy01-Ultimate",
        "B2JeepBody-Ultimate",
        "B3bodyRKbuggy01-Ultimate",
        "B2RKJeepBody-Ultimate",
    ];

    for (let i = 0, len = SCAV_COMPONENTS.length; i < len; ++i) {
        makeComponentAvailable(SCAV_COMPONENTS[i], me);
    }

    enableStructure(factoryBaba, me);
    enableStructure(vtolfac, me);
    enableStructure(derrick, me);
    enableStructure(gen, me);
    enableStructure(repair, me);
    enableStructure(vtolpad, me);

    for (let i = 0, len = defenses.length; i < len; ++i) {
        enableStructure(defenses[i], me);
    }
};
