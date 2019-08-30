//time dimensions

function getTimeDimensionPower(tier) {
  if (player.currentEternityChall == "eterc11") return new Decimal(1)
  var dim = player["timeDimension"+tier]
  var ret = dim.power.pow(player.boughtDims?1:2)
  if (tmp.be) {
    ret = tmp.it
    if (player.timestudy.studies.includes(11) && tier == 1) ret = ret.times(getTS11Mult())
    if (tmp.qu.breakEternity.upgrades.includes(1) && tier < 5) ret = ret.times(getBreakUpgMult(1))
    if (tmp.qu.breakEternity.upgrades.includes(4) && tier > 3 && tier < 7) ret = ret.times(getBreakUpgMult(4))
    if (tmp.qu.bigRip.upgrades.includes(13)) ret = ret.times(player.replicanti.amount.max(1).pow(1e-6))
    if (tier == 6 && player.ghostify.ghostlyPhotons.unl) ret = ret.times(tmp.le[6])
    if (tier == 7 && tmp.qu.bigRip.upgrades.includes(16)) ret = ret.times(player.dilation.dilatedTime.div(1e100).pow(0.155).max(1))
    if (ret.lt(0)) ret = new Decimal(0)
    return dilates(ret)
  }

  if (player.timestudy.studies.includes(11) && tier == 1) ret = ret.times(getTS11Mult())
  if (player.achievements.includes("r105")) ret = ret.times(tmp.it)
  if (player.boughtDims) {
      if (player.achievements.includes('r117')) {
        ret = ret.times(1 + Math.pow(Math.log(player.eternities), 1.5) / Math.log(100));
      } else if (player.achievements.includes('r102')) {
        ret = ret.times(1 + Math.log(player.eternities) / Math.log(100));
      }
  }

  ret = ret.times(kongAllDimMult)
  ret = ret.dividedBy(Math.pow(Math.E,player.layer));
 
  var ret2 = new Decimal(1)
  if (player.currentEternityChall == "eterc9") ret2 = ret2.times((Decimal.pow(Math.max(player.infinityPower.log2(), 1), player.galacticSacrifice == undefined ? 4 : 30)).max(1))
  if (ECTimesCompleted("eterc1") !== 0) ret2 = ret2.times(getECReward(1))
  if (player.eternityUpgrades.includes(4)) ret2 = ret2.times(player.achPow)
  if (player.eternityUpgrades.includes(5)) ret2 = ret2.times(Math.max(player.timestudy.theorem, 1))
  if (player.eternityUpgrades.includes(6)) ret2 = ret2.times(player.totalTimePlayed / 10 / 60 / 60 / 24)
  if (player.galacticSacrifice === undefined) ret=ret.times(ret2)
  if (player.timestudy.studies.includes(73) && tier == 3) ret = ret.times(calcTotalSacrificeBoost().pow(0.005).min(new Decimal("1e1300")))
  if (player.timestudy.studies.includes(93)) ret = ret.times(Decimal.pow(player.totalTickGained, 0.25).max(1))
  if (player.timestudy.studies.includes(103)) ret = ret.times(Math.max(player.replicanti.galaxies, 1))
  if (player.timestudy.studies.includes(151)) ret = ret.times(1e4)
  if (player.timestudy.studies.includes(221)) ret = ret.times(Decimal.pow(1.0025, player.resets))
  if (player.timestudy.studies.includes(227) && tier == 4) ret = ret.times(Math.pow(calcTotalSacrificeBoost().max(10).log10(), 10))
  if (ECTimesCompleted("eterc10") !== 0) ret = ret.times(getECReward(10))
  if (player.achievements.includes("r128")) ret = ret.times(Math.max(player.timestudy.studies.length, 1))
  if (player.galacticSacrifice !== undefined && player.galacticSacrifice.upgrades.includes(43)) ret = ret.times(galUpgrade43())
  if (player.replicanti.unl && player.replicanti.amount.gt(1) && player.dilation.upgrades.includes(5)) ret = ret.times(tmp.rm.pow(0.1))
  if (inQC(6)) ret = ret.times(player.postC8Mult).dividedBy(player.matter.max(1))

  ret=dilates(ret, 2)
  if (player.galacticSacrifice !== undefined) ret=ret.times(ret2)

  return dilates(ret, 1)
}


function getTimeDimensionProduction(tier) {
  if (player.currentEternityChall == "eterc1" || player.currentEternityChall == "eterc10" || (!tmp.be && inQC(8))) return new Decimal(0)
  var dim = player["timeDimension"+tier]
  if (player.currentEternityChall == "eterc11") return dim.amount
  var ret = dim.amount
  if (inQC(4) && tier == 1) ret = ret.plus(player.timeDimension2.amount.floor())
  ret = ret.times(getTimeDimensionPower(tier))
  if (player.currentEternityChall == "eterc7") ret = dilates(ret.dividedBy(player.tickspeed.dividedBy(1000)))
  if (player.aarexModifications.ngm4V) ret = ret.div(100)
  if (player.currentEternityChall == "eterc1") return new Decimal(0)
  return ret
}


function getTimeDimensionRateOfChange(tier) {
  let toGain = getTimeDimensionProduction(tier+(inQC(4)?2:1))
  var current = Decimal.max(player["timeDimension"+tier].amount, 1);
  if (player.aarexModifications.logRateChange) {
      var change = current.add(toGain.div(10)).log10()-current.log10()
      if (change<0||isNaN(change)) change = 0
  } else var change  = toGain.times(10).dividedBy(current);
  return change;
}

function getTimeDimensionDescription(tier) {
  if (tier > (inQC(4) ? 6 : 7) || (tier > 3 && !player.dilation.studies.includes(tier - 2))) return getFullExpansion(player['timeDimension' + tier].bought)
  else return shortenDimensions(player['timeDimension' + tier].amount) + ' (+' + formatValue(player.options.notation, getTimeDimensionRateOfChange(tier), 2, 2) + dimDescEnd;
}

function updateTimeDimensions() {
  if (document.getElementById("timedimensions").style.display == "block" && document.getElementById("dimensions").style.display == "block") {
    for (let tier = 1; tier <= 4; ++tier) {
      document.getElementById("timeD"+tier).textContent = DISPLAY_NAMES[tier] + " Time Dimension x" + shortenMoney(getTimeDimensionPower(tier));
      document.getElementById("timeAmount"+tier).textContent = getTimeDimensionDescription(tier);
    }
    if (player.dilation.studies.includes(2)) {
      for (let tier = 5; tier <= 8; ++tier) {
        if (player.dilation.studies.includes(tier-3)) {
          document.getElementById("timeD"+tier).textContent = DISPLAY_NAMES[tier] + " Time Dimension x" + shortenMoney(getTimeDimensionPower(tier));
          document.getElementById("timeAmount"+tier).textContent = getTimeDimensionDescription(tier);
        }
      }
    }
    for (let tier = 1; tier <= 8; ++tier) {
      if (player.dilation.studies.includes(tier-3) || tier < 5) {
        document.getElementById("timeRow"+tier).style.display = "table-row"
      } else {
        document.getElementById("timeRow"+tier).style.display = "none"
      }
    }
  }
}

var timeDimCostMults = [null, 3, 9, 27, 81, 243, 729, 2187, 6561]
var timeDimStartCosts = [null, 1, 5, 100, 1000, "1e2350", "1e2650", "1e3000", "1e3350"]

function timeDimCost(tier, bought) {
	cost = Decimal.pow(timeDimCostMults[tier], bought).times(timeDimStartCosts[tier])
	if (player.galacticSacrifice !== undefined) return cost
	if (cost.gte(Number.MAX_VALUE)) cost = Decimal.pow(timeDimCostMults[tier]*1.5, bought).times(timeDimStartCosts[tier])
	if (cost.gte("1e1300")) cost = Decimal.pow(timeDimCostMults[tier]*2.2, bought).times(timeDimStartCosts[tier])
	if (tier > 4) cost = Decimal.pow(timeDimCostMults[tier]*100, bought).times(timeDimStartCosts[tier])
	if (cost.gte(tier > 4 ? "1e300000" : "1e20000")) {
		// rather than fixed cost scaling as before, quadratic cost scaling
		// to avoid exponential growth
		cost = cost.times(Decimal.pow(new Decimal('1e1000'),
		Math.pow(cost.log(10) / 1000 - (tier > 4 ? 300 : 20), 2)));
	}
	return cost
}

function buyTimeDimension(tier) {
  var dim = player["timeDimension"+tier]
  if (tier > 4 && !player.dilation.studies.includes(tier-3)) return false
  if (player.eternityPoints.lt(dim.cost)) return false

  player.eternityPoints = player.eternityPoints.minus(dim.cost)
  dim.amount = dim.amount.plus(1);
  dim.bought += 1
  dim.cost = timeDimCost(tier, dim.bought)
  dim.power = dim.power.times(player.boughtDims?3:2)
  if (inQC(6)) player.postC8Mult = new Decimal(1)
  updateEternityUpgrades()
  return true
}

function resetTimeDimensions() {
  for (var i=1; i<9; i++) {
      var dim = player["timeDimension"+i]
      dim.amount = new Decimal(dim.bought)
  }
}

function buyMaxTimeDimension(tier) {
	if (tier>4&&!player.dilation.studies.includes(tier-3)) return
	var dim=player['timeDimension'+tier]
	if (player.eternityPoints.lt(dim.cost)) return
	var increment=1
	while (player.eternityPoints.gte(timeDimCost(tier,dim.bought+increment*2-1))) {
		increment*=2
	}
	var toBuy=increment
	for (p=0;p<53;p++) {
		increment/=2
		if (increment<1) break
		if (player.eternityPoints.gte(timeDimCost(tier,dim.bought+toBuy+increment-1))) toBuy+=increment
	}
	var num=toBuy
	var newEP=player.eternityPoints
	while (num>0) {
		var temp=newEP
		var cost=timeDimCost(tier,dim.bought+num-1)
		if (newEP.lt(cost)) {
			newEP=player.eternityPoints.sub(cost)
			toBuy--
		} else newEP=newEP.sub(cost)
		if (newEP.eq(temp)||num>9007199254740992) break
		num--
	}
	player.eternityPoints=newEP
	dim.amount=dim.amount.plus(toBuy);
	dim.bought+=toBuy
	dim.cost=timeDimCost(tier, dim.bought)
	dim.power=dim.power.times(Decimal.pow(player.boughtDims?3:2, toBuy))
	if (inQC(6)) player.postC8Mult = new Decimal(1)
	updateEternityUpgrades()
}

function buyMaxTimeDimensions() {
  for (i=1; i<9; i++) buyMaxTimeDimension(i)
}

function getTS11Mult() {
	let bigRipped = player.masterystudies === undefined ? false : tmp.qu.bigRip.active
	let log = -player.tickspeed.div(1e3).pow(0.005).times(0.95).plus(player.tickspeed.div(1e3).pow(0.0003).times(0.95)).log10()
	if (bigRipped && log > 900) log = Math.sqrt(log * 900)
	else if (player.galacticSacrifice === undefined) log = Math.min(log, 2500)
	log /= player.aarexModifications.newGameExpVersion ? 4 : 1
	return Decimal.pow(10, log)
}
