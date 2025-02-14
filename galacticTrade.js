
class Database {
  #entriesStore = new Map()

}





const TradeDatabase = new Database();

const Operations = {
  sequenceBuffer: [],
  playMany: false,
  playManySequenced: false,
  cursorPos: false,
  startPos: false,
  endPos: false,
  get name() {
    const name = game.user.name
    return name;
  },

  async buyCargo(actor) {

    const allskills = actor.system.skills
    let skillToUse = "dip"

    // use merchant if greater

    for (let [k, v] of Object.entries(allskills)) {
      if (v.subname?.toLowerCase() === "merchant") {
        if (v.mod > allskills.dip.mod) skillToUse = k
      }
    }

    const charLevel = actor.system.details.level.value
    const dc = 10 + Math.floor(charLevel * 1.5)
    const chatMessage = "Cargo Search DC " + dc
    const roll = await actor.rollSkill(skillToUse, { chatMessage: chatMessage })
    const result = roll.callbackResult.total
    let cargo = "1d4"
    let variation = "0"
    if (result < dc) { cargo = "0" }
    else {
      variation = Math.floor((result - dc) / 5).toString()
    }

    // complete Rolls
    const rollData = actor.getRollData();

    // Create the roll and the corresponding message
    const r = await new Roll(cargo, rollData);
    await r.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: chatMessage + 'Number of Cargo lots +/- ' + variation + 'Half-elves receive @UUID[Compendium.sfrpg.setting.JournalEntry.FYV6RgTjPdg72RF0]{Triune} as a bonus feat at 1st level.'
    });
    if (r.total < 1) return
    // get Tables

    let typeTable = {}
    let destTable = {}

    game.tables.forEach((value, key) => {
      // console.log(key,value);
      if (value.name.startsWith("TABLE 1")) typeTable = value
      if (value.name.startsWith("TABLE 2")) destTable = value
    });

    const typeRoll = await typeTable.draw({ displayChat: true })
    const destRoll = await destTable.draw({ displayChat: true })
    console.log(destRoll)
  },

  async sellCargo(actor) {
    const allskills = actor.system.skills
    let skillToUse = "dip"
    
    // use merchant if greater
    
    for (let [k, v] of Object.entries(allskills)) {
        if (v.subname?.toLowerCase() === "merchant") {
            if (v.mod > allskills.dip.mod) skillToUse = k
        }
    }
    
    const roll = await actor.rollSkill(skillToUse)
    const result = roll.callbackResult.total
    const charLevel = actor.system.details.level.value
    const dc = 15 + Math.floor(charLevel * 1.5)
    let success = false
    let sellPrice = 0
    
    if (result < dc) { sellPrice = -1 }
    else {
        sellPrice = Math.floor((result - dc) / 5).toString()
        success = true
    }
    const sellPriceSigned = new Intl.NumberFormat("en-US", {
        signDisplay: "exceptZero"
    }).format(sellPrice);
    
    const html = '<h2>Galactic Trade</h2><h3>Sell</h3><p></p>'
    const chat = ChatMessage.create({
        user: game.user.id,
        speaker: {
            actor: actor,
            alias: actor.name
        },
        content: html,
        flavor: `DC ${dc} Sell check - ${success ? "success!" : "failure!"} Sell for additional ${sellPriceSigned} BP/Lot `,
    })
  },

  async GMCargo(){

  // get Tables

let compTable = {}
game.tables.forEach((value, key) => {
    if (value.name.startsWith("TABLE 3")) compTable = value
});
const compRoll = await compTable.draw({ displayChat: true, rollMode: "selfroll" })
const systemSellForm = "1d8-2"
const pactSellForm = "1d8-1"
const nearSellForm = "1d8"
const vastSellForm = "1d8+1"
const systemDur = "1d6"
const pactDur = "2d6"
const nearDur = "3d6"
const vastDur = "5d6"
const systemSell = await new Roll(systemSellForm).evaluate();
const pactSell = await new Roll(pactSellForm).evaluate();
const nearSell = await new Roll(nearSellForm).evaluate();
const vastSell = await new Roll(vastSellForm).evaluate();
const systemDurRoll = await new Roll(systemDur).evaluate();
const pactDurRoll = await new Roll(systemDur).evaluate();
const nearDurRoll = await new Roll(systemDur).evaluate();
const vastDurRoll = await new Roll(systemDur).evaluate();

const html = '<h2>Galactic Trade</h2><h3>Buy</h3><p>[[1d4]] BP</p><h3>Sell</h3><table><tr><th>Ship to</th><th>Duration<br>(days)</th><th>Sell<br>BP/lot</th></tr><tr><td>In System</td><td>[[1d6]]</td><td>[[1d8-2]]</td></tr><tr><td>Pact Worlds</td><td>[[2d6]]</td><td>[[1d8-1]]</td></tr><tr><td>Near Space</td><td>[[3d6]]</td><td>[[1d8]]</td></tr><tr><td>The Vast</td><td>[[3d6]]</td><td>[[1d8+1]]</td></tr></table>'
console.log(game.user)
const chat = ChatMessage.create({
    user: game.user.id,

    content: html,
    whisper: [game.user.id]

})
}

}

Hooks.once("init", async function () {


  initializeModule();
  //    registerSocket();
});

function initializeModule() {
  console.log("Initialise Fly Free or Die")
  window.GalacticTrade = {
    Operations: Operations,
    Database: TradeDatabase
  }
  console.log("Fly Free or Die window.Trade", window.Trade)
};