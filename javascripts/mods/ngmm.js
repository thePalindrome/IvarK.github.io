function getGSAmount() {
	if (isEmptiness) return new Decimal(0)
	let galaxies = player.galaxies + player.replicanti.galaxies + player.dilation.freeGalaxies;
	let y = 1.5 
	if (player.challenges.includes("postcngmm_1")) {
		y += Math.max(0, 0.05*(galaxies - 10)) + 0.005 * Math.pow(Math.max(0, galaxies-30) , 2)
		if (player.tickspeedBoosts == undefined) y += 0.0005 * Math.pow(Math.max(0, galaxies-50) , 3)
		if (player.achievements.includes("r121") && player.tickspeedBoosts == undefined) y += 1e-5 * Math.pow(Math.max(galaxies - 500, 0), 4)
		y *= .08*(tmp.cp+14)
	}
	if (player.galacticSacrifice.upgrades.includes(52) && player.tickspeedBoosts == undefined) {
		if (y > 100) y = Math.pow(1e4*y , 1/3)
	} else if (y > 100 && player.tickspeedBoosts == undefined) y = Math.pow(316.22*y, 1/3)
	else if (y > 10) y = Math.pow(10*y, .5)
	let z = 1
	if (tmp.cp>3) {
		z = 0.06*(tmp.cp+14)
		z += galaxies/100
		if (player.tickspeedBoosts == undefined) z *= Math.log(galaxies+3)
	}
	let resetMult = player.resets-(player.currentChallenge=="challenge4"?2:4)
	if (player.tickspeedBoosts !== undefined) resetMult = (resetMult+1)/2
	let ret = Decimal.pow(galaxies, y).times(Decimal.pow(Math.max(0, resetMult), z)).max(0)
	ret = ret.times(getAmount(8)/50+1)
	if (player.achievements.includes("r23") && player.tickspeedBoosts !== undefined) ret=ret.times(Decimal.pow(Math.max(player.tickspeedBoosts/10,1),Math.max(getAmount(8)/75,1)))
	if (player.galacticSacrifice.upgrades.includes(32)) ret = ret.times(galUpgrade32())
	if (player.infinityUpgrades.includes("galPointMult")) ret = ret.times(getPost01Mult())
	if (player.achievements.includes('r37')) {
		if (player.bestInfinityTime >= 18000) ret = ret.times(Math.max(180000/player.bestInfinityTime,1))
		else ret = ret.times(10*(1+Math.pow(Math.log10(18000/player.bestInfinityTime),2)))
	}
	if (player.achievements.includes("r62")&&player.tickspeedBoosts==undefined) ret = ret.times(player.infinityPoints.max(10).log10())
	return ret.floor()
}

function galacticSacrifice(auto) {
	if (getGSAmount().eq(0)) return
	if (tmp.ri) return
	if (player.options.gSacrificeConfirmation&&!auto) if (!confirm("Galactic Sacrifice will do a galaxy reset, and then remove all of your galaxies, in exchange of galaxy points which can be use to buy many overpowered upgrades, but it will take a lot of time to recover, are you sure you wanna do this?")) return
	player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.plus(getGSAmount())
	player.galacticSacrifice.times++
	player.galacticSacrifice.time = 0
	GPminpeak = new Decimal(0)
	galaxyReset(-player.galaxies)
}

function resetGalacticSacrifice(eternity) {
	return player.galacticSacrifice ? {
		galaxyPoints: player.achievements.includes("r33")&&!eternity?player.infinityPoints.div(10).pow(2):new Decimal(0),
		time: 0,
		times: 0,
		upgrades: []
	} : undefined
}

function newGalacticDataOnInfinity(eternity) {
	if (player.galacticSacrifice&&(eternity?getEternitied()>6:player.achievements.includes("r3"+(player.tickspeedBoosts==undefined?6:3)))) {
		var data=player.galacticSacrifice
		data.galaxyPoints=player.tickspeedBoosts==undefined?(eternity?data.galaxyPoints:data.galaxyPoints.add(getGSAmount())):new Decimal(0)
		if (player.tickspeedBoosts!=undefined) data.times=0
		data.time=0
		return data
	} else return resetGalacticSacrifice()
}

function isIC3Trapped() {
	return player.galacticSacrifice || player.currentEternityChall === "eterc14" || inQC(6)
}

//v1.2

let galUpgradeCosts = {
	11: 1,
	21: 1,
	22: 5,
	23: 100,
	14: 300,
	24: 1e3,
	34: 1e17,
	41: "1e1650",
	42: "1e2300",
	43: "1e3700",
	51: "1e5500",
	52: "1e8000",
	53: "1e25000"
}

function buyGalaxyUpgrade(i) {
	if (player.galacticSacrifice.upgrades.includes(i) || !(Math.floor(i/10)<2 || player.galacticSacrifice.upgrades.includes(i-10)) || player.galacticSacrifice.galaxyPoints.lt(galUpgradeCosts[i])) return
	player.galacticSacrifice.upgrades.push(i)
	player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.sub(galUpgradeCosts[i])
	if (i==11) {
		if (player.achievements.includes("r21")) {
			for (d=1;d<9;d++) {
				var name = TIER_NAMES[d]
				player[name+"Cost"] = player[name+"Cost"].times(10)
			}
		}
		reduceDimCosts()
	}
	if (i==41) for (tier=1;tier<9;tier++) {
		let dim = player["infinityDimension"+tier]
		dim.power = Decimal.pow(getInfBuy10Mult(tier), dim.baseAmount/10)
	}
	if (i==42) for (tier=1;tier<9;tier++) {
		let dim = player["infinityDimension"+tier]
		dim.cost = Decimal.pow(getIDCostMult(tier),dim.baseAmount/10).times(infBaseCost[tier])
	}
}

function reduceDimCosts() {
	if (player.galacticSacrifice) {
		let div=1
		if (player.achievements.includes("r21")) div=10
		if (player.galacticSacrifice.upgrades.includes(11)) div=galUpgrade11()
		for (d=1;d<9;d++) {
			var name = TIER_NAMES[d]
			if (player.aarexModifications.ngmX>3) {
				player[name+"Cost"] = player[name+"Cost"].pow(1.25).times(10)
				player.costMultipliers[d-1] = player.costMultipliers[d-1].pow(1.25)
			}
			player[name+"Cost"] = player[name+"Cost"].div(div)
		}
		if (player.achievements.includes('r48') && player.tickspeedBoosts == undefined) player.tickSpeedCost = player.tickSpeedCost.div(div)
	}
	if (player.infinityUpgradesRespecced != undefined) {
		for (d=1;d<9;d++) {
			var name = TIER_NAMES[d]
			player[name+"Cost"] = player[name+"Cost"].div(Decimal.pow(getDiscountMultiplier("dim" + d), player.dimtechs.discounts))
		}
		player.tickSpeedCost = player.tickSpeedCost.div(Decimal.pow(getDiscountMultiplier("tick"), player.dimtechs.discounts))
	}
}

let galUpgrade11=function () {
	let x=getInfinitied()
	if (x>1e6 && getEternitied() == 0) x = 1e6
	let y=Math.max(x+2,2);
	let z=10
	if (player.tickspeedBoosts!=undefined) return Decimal.pow(10,Math.min(y,6))
	if (tmp.cp>0&&player.challenges.includes("postcngmm_1")) z-=(tmp.cp+6)/4
	if (tmp.cp>6) z+=0.085*tmp.cp-0.31
	if (tmp.cp>0&&getEternitied()>0&&getInfinitied() < 1e8) x+=2e6
	if (player.infinityUpgrades.includes("postinfi61")) {
		x+=1e7
		z-=.1
		if (player.galacticSacrifice.upgrades.length>9) x+=player.galacticSacrifice.upgrades.length*1e7
	}
	if (tmp.ec) {
		x+=1e10*tmp.ec
		z-=Math.pow(tmp.ec,0.3)/10
	}
	if (x>1e8) x=Math.pow(1e8*x,.5)
	if (getEternitied()>0) z-=0.5
	if (z<6) z=Math.pow(1296*z,.2)
	if (x>99) y=Math.pow(Math.log(x),Math.log(x)/z)+14
	else if (x>4) y=Math.sqrt(x+5)+4
	if (y>1000) y=Math.sqrt(1000*y)
	if (y>1e4) y=Math.pow(1e8*y,1/3)
	return Decimal.pow(10, Math.min(y, 2e4));
}
let galUpgrade12 = function () {
	return 2 * Math.pow(1 + player.galacticSacrifice.time / 600, 0.5);
}
let galUpgrade13 = function () {
	let exp = 3
	if (player.infinityUpgrades.includes("postinfi62")) {
		if (player.currentEternityChall === "") exp *= Math.pow(Math.log(player.resets+3), 2)
		else exp *= Math.pow(Math.log(player.resets+3), 0.5)
	}
	return player.galacticSacrifice.galaxyPoints.div(5).plus(1).pow(exp)
}
let galUpgrade23 = function () {
	return player.galacticSacrifice.galaxyPoints.max(1).log10()*3/4+1
}
let galUpgrade31 = function () {
	return 1.1 + player.extraDimPowerIncrease * 0.02
}
let galUpgrade32 = function () {
	let x = player.totalmoney
	if (!player.break) x = x.min(Number.MAX_VALUE)
	return x.pow(0.003).add(1);
}
let galUpgrade33 = function () {
	if (player.tickspeedBoosts != undefined) return player.galacticSacrifice.galaxyPoints.div(1e10).add(1).log10()/5+1
	return player.galacticSacrifice.galaxyPoints.max(1).log10()/4+1
}

function galacticUpgradeSpanDisplay () {
	document.getElementById("galaxyPoints").innerHTML = "You have <span class='GPAmount'>"+shortenDimensions(player.galacticSacrifice.galaxyPoints)+"</span> Galaxy point"+(player.galacticSacrifice.galaxyPoints.eq(1)?".":"s.")
	if (player.infinitied>0||player.eternities!==0||quantumed) document.getElementById('galspan11').innerHTML = shortenDimensions(galUpgrade11())
	document.getElementById('galspan12').innerHTML = shorten(galUpgrade12())
	document.getElementById('galspan13').innerHTML = shorten(galUpgrade13())
	document.getElementById('galspan23').innerHTML = shorten(galUpgrade23())
	document.getElementById('galspan31').innerHTML = galUpgrade31().toFixed(2)
	document.getElementById('galspan32').innerHTML = shorten(galUpgrade32())
	document.getElementById('galspan33').innerHTML = shorten(galUpgrade33())
	document.getElementById('galcost33').innerHTML = shortenCosts(galUpgradeCosts[33])
	if (player.tickspeedBoosts!=undefined) {
		document.getElementById('galspan24').innerHTML = shorten(galUpgrade24())
		document.getElementById('galcost24').innerHTML = shortenCosts(1e3)
		document.getElementById('galcost34').innerHTML = shortenCosts(1e17)
	}
	if (player.infinityUpgrades.includes("postinfi63")) {
		document.getElementById("galcost41").innerHTML = shortenCosts(new Decimal("1e1650"))
		document.getElementById("galcost42").innerHTML = shortenCosts(new Decimal("1e2300"))
		document.getElementById("galcost43").innerHTML = shortenCosts(new Decimal("1e3700"))
		document.getElementById("galcost51").innerHTML = shortenCosts(new Decimal("1e5500"))
		document.getElementById("galcost52").innerHTML = shortenCosts(new Decimal("1e8000"))
		document.getElementById("galcost53").innerHTML = shortenCosts(new Decimal("1e25000"))
	}
}

function galacticUpgradeButtonTypeDisplay () {
	for (let i = 1; i < (player.infinityUpgrades.includes("postinfi63")?6:4); i++) {
		for (let j = 1; j < (player.tickspeedBoosts!=undefined?5:4); j++) {
			let e = document.getElementById('galaxy' + i + j);
			if (player.galacticSacrifice.upgrades.includes(+(i + '' + j))) {
				e.className = 'infinistorebtnbought'
			} else if (player.galacticSacrifice.galaxyPoints.gte(galUpgradeCosts[i + '' + j]) && (i === 1 || player.galacticSacrifice.upgrades.includes(+((i - 1) + '' + j)))) {
				e.className = 'infinistorebtn' + j;
			} else {
				e.className = 'infinistorebtnlocked'
			}
		}
	}
	for (var r=1;r<3;r++) document.getElementById("newgalrow"+r).style.display=player.infinityUpgrades.includes("postinfi63")?"":"none"
}

//v1.295
function resetTotalBought() {
	if (player.galacticSacrifice) return {}
}

function productAllTotalBought () {
	var ret = 1;
	var mult = getProductBoughtMult()
	for (i = 1; i <= 8; i++) {
		if (player.currentChallenge == "challenge13" && player.tickspeedBoosts != undefined) ret = Decimal.times(player[TIER_NAMES[i]+"Amount"].max(1).log10(),mult).add(1).times(ret);
		else if (player.totalBoughtDims[TIER_NAMES[i]]) ret = Decimal.times(ret,player.totalBoughtDims[TIER_NAMES[i]]?Decimal.times(player.totalBoughtDims[TIER_NAMES[i]],mult).max(1):1);
	}
	return ret;
}

function productAllTotalBought1 () {
	return Math.pow(Decimal.max(productAllTotalBought(),10).log10(),2);
}

function productAllDims1(){
	var ret = new Decimal(0)
	for (i = 1; i <= 8; i++) {
		ret = ret.add(Math.max(player[TIER_NAMES[i] + "Amount"].max(1).log10(),0));
	}
	return ret.min(1)
}

document.getElementById("challenge13").onclick = function () {
	startChallenge("challenge13", Number.MAX_VALUE);
}

//v1.3
function gSacrificeConf() {
	document.getElementById("gConfirmation").checked = player.options.gSacrificeConfirmation
	player.options.gSacrificeConfirmation = !player.options.gSacrificeConfirmation
	document.getElementById("gSacConfirmBtn").textContent = "Galactic Sacrifice confirmation: O" + (player.options.gSacrificeConfirmation ? "N" : "FF")
}

document.getElementById("challenge14").onclick = function () {
	startChallenge("challenge14", Number.MAX_VALUE);
}

function updateTBTIonGalaxy() {
	if (player.galacticSacrifice) return {current:player.tickBoughtThisInf.current,pastResets:[{resets:0,bought:player.tickBoughtThisInf.current}]}
}

function resetTickBoughtThisInf() {
	if (player.galacticSacrifice) return {current:0,pastResets:[{resets:0,bought:0}]}
}

function upgradeSacAutobuyer() {
	if (player.infinityPoints.lt(player.autoSacrifice.cost)) return false;
	player.infinityPoints = player.infinityPoints.minus(player.autoSacrifice.cost);
	if (player.autoSacrifice.interval > 100) {
		player.autoSacrifice.interval = Math.max(player.autoSacrifice.interval*0.6, 100);
		if (player.autoSacrifice.interval > 120) player.autoSacrifice.cost *= 2; //if your last purchase wont be very strong, dont double the cost
	}
	updateAutobuyers();
}

document.getElementById("buyerBtnGalSac").onclick = function () {
	buyAutobuyer(12);
}

//v1.4
function getPost01Mult() {
	return Math.min(Math.pow(player.infinitied + 1, .3), Math.pow(Math.log(player.infinitied + 3), 3))
}

document.getElementById("postinfi01").onclick = function() {
	buyInfinityUpgrade("galPointMult",player.tickspeedBoosts==undefined?1e3:1e4);
}

document.getElementById("postinfi02").onclick = function() {
	buyInfinityUpgrade("dimboostCost",player.tickspeedBoosts==undefined?2e4:1e5);
}

document.getElementById("postinfi03").onclick = function() {
	buyInfinityUpgrade("galCost",5e5);
}

document.getElementById("postinfi04").onclick = function() {
	if (player.infinityPoints.gte(player.dimPowerIncreaseCost) && player.extraDimPowerIncrease < 40) {
		player.infinityPoints = player.infinityPoints.minus(player.dimPowerIncreaseCost)
		player.dimPowerIncreaseCost = new Decimal(player.tickspeedBoosts==undefined?1e3:3e5).times(Decimal.pow(4,Math.min(player.extraDimPowerIncrease,15)+1));
		player.extraDimPowerIncrease += 1;
		if (player.extraDimPowerIncrease > 15) player.dimPowerIncreaseCost = player.dimPowerIncreaseCost.times(Decimal.pow(Decimal.pow(4,5),player.extraDimPowerIncrease-15))
		document.getElementById("postinfi04").innerHTML = "Further increase all dimension multipliers<br>x^"+galUpgrade31().toFixed(2)+(player.extraDimPowerIncrease<40?" -> x^"+((galUpgrade31()+0.02).toFixed(2))+"<br>Cost: "+shorten(player.dimPowerIncreaseCost)+" IP":"")
	}
}

//v1.41
function galIP(){
    let gal = player.galaxies
    if (gal<5) return gal
    if (gal<50) return 2+Math.pow(5+gal,0.6)
    return Math.pow(gal,.4)+7
}

//v1.5
function renameIC(id) {
	let split=id.split("postc")
	if (split[1]) id=order[parseInt(split[1])-1]
	return id
}

//v1.501
function isADSCRunning() {
	return player.currentChallenge === "challenge13" || (player.currentChallenge === "postc1" && player.galacticSacrifice) || player.tickspeedBoosts !== undefined
}

//v1.6
document.getElementById("postinfi50").onclick = function() {
    buyInfinityUpgrade("postinfi50",player.tickspeedBoosts==undefined?1e25:2e18);
}

document.getElementById("postinfi51").onclick = function() {
    buyInfinityUpgrade("postinfi51",player.tickspeedBoosts==undefined?1e29:1e20);
}

document.getElementById("postinfi52").onclick = function() {
    buyInfinityUpgrade("postinfi52",player.tickspeedBoosts==undefined?1e33:1e25);
}

document.getElementById("postinfi53").onclick = function() {
    buyInfinityUpgrade("postinfi53",player.tickspeedBoosts==undefined?1e37:1e29);
}

//v1.9
document.getElementById("postinfi60").onclick = function() {
    buyInfinityUpgrade("postinfi60",1e50);
}

document.getElementById("postinfi61").onclick = function() {
    buyInfinityUpgrade("postinfi61",new Decimal("1e450"));
}

document.getElementById("postinfi62").onclick = function() {
    buyInfinityUpgrade("postinfi62",new Decimal("1e700"));
}

document.getElementById("postinfi63").onclick = function() {
    buyInfinityUpgrade("postinfi63",new Decimal("1e2000"));
}

function getB60Mult() {
	return Decimal.pow(getEternitied()>0?2.5:3,player.galaxies-95).max(1)
}

function getPostC3Exp() {
	let g = getGalaxyPower(0)-player.dilation.freeGalaxies
	if (g<7) return 1+g/5
	let y=5
	let z=.5
	if (tmp.ec>29) {
		if (player.currentEternityChall=="") {
			z=.9
			if (tmp.ec>42) y=2
			else if (tmp.ec>37) y=3.5
		} else z=.6
	}
	return 2+Math.pow(g-5,z)/y
}

//v2
let galUpgrade43 = function () {
	return Decimal.pow(player.galacticSacrifice.galaxyPoints.log10(),50)
}

let galUpgrade51 = function () {
	let x=player.galacticSacrifice.galaxyPoints.log10()/1e3
	if (x>20) x=Math.sqrt(x*20)
	return Decimal.pow(10,x)
}
