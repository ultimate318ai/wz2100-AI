"use strict";
// A fallback build order for the standard ruleset.


var _standard_build_common = {
    buildOrder_StandardFallback: function () {
        var derrickCount = _stats.countFinishedStructList(structures.derricks);
        // might be good for Insane AI, or for rebuilding
        if (derrickCount instanceof Number && derrickCount > 0) {
            if (_build.buildMinimum(structures.gens, 1)) { return true; }
        }
        // lab, factory, gen, cc - the current trivial build order for the 3.2+ starting conditions
        if (_build.buildMinimum(structures.labs, 1)) return true;
        if (_build.buildMinimum(structures.factories, 1)) return true;
        if (_build.buildMinimum(structures.gens, 1)) return true;
        // make sure trucks go capture some oil at this moment
        if (_build.buildMinimumDerricks(1)) return true;
        // what if one of them is being upgraded? will need the other anyway.
        // also, it looks like the right timing in most cases.
        if (_build.buildMinimum(structures.gens, 2)) return true;
        if (_build.buildMinimum(structures.hqs, 1)) return true;
        // make sure we have at least that much oils by now
        if (_build.buildMinimumDerricks(5)) return true;
        // support hover maps
        var ret = _adapt.scopeRatings();
        if (ret.land === 0 && !_stats.iHaveHover())
            if (_build.buildMinimum(structures.labs, 4)) return true;
        if (ret.land === 0 && ret.sea === 0 && !_stats.iHaveVtol())
            if (_build.buildMinimum(structures.labs, 4)) return true;
        if (gameTime > 300000) {
            // build more factories and labs when we have enough income
            if (_build.buildMinimum(structures.labs, derrickCount / 3)) return true;
            if (_research.needFastestResearch() === PROPULSIONUSAGE.GROUND) {
                if (_build.buildMinimum(structures.factories, 2)) return true;
                if (_adapt.scopeRatings().land > 0)
                    if (_build.buildMinimum(structures.templateFactories, 1)) return true;
            }
            if (_build.buildMinimum(structures.vtolFactories, 1)) return true;
            return false;
        }
        // support hover maps
        var ret = _adapt.scopeRatings();
        if (ret.land === 0 && !_stats.iHaveHover())
            if (_build.buildMinimum(structures.labs, 4)) return true;
        if (ret.land === 0 && ret.sea === 0 && !_stats.iHaveVtol())
            if (_build.buildMinimum(structures.labs, 4)) return true;
        return true;
    }
}

