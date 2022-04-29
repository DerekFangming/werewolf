const express = require('express')
const path = require('path')
const ws = require('ws')
const { v4: uuidv4 } = require('uuid');

const app = express()

const port = '9001'
const production = process.env.PRODUCTION == 'true'

const wss = new ws.Server({ path: '/', port: 8080 })

const games = new Map()
const players = new Map()

wss.on('connection', function connection(player) {
  player.on('message', function message(data) {
    console.log('received from %s: %s', player.id, data)
    try {
      let cmd = JSON.parse(data)
      var gameId
      switch (cmd.op) {
        case 'handshake':
          if (players.has(cmd.playerId)) {
            // Existing user reconnected
            let existing = players.get(cmd.playerId)
            player.id = cmd.playerId
            player.heatbeat = new Date()
            player.gameId = existing.gameId
            players.set(cmd.playerId, player)

            player.send(`{"op": "handshake", "playerId": "${existing.id}", "gameId": "${existing.gameId}"}`)
          } else {
            // New or expired user
            player.id = uuidv4()
            player.heatbeat = new Date()
            player.gameId = ''
            players.set(player.id, player)
  
            player.send(`{"op": "handshake", "playerId": "${player.id}", "gameId": ""}`)
          }
          break
        case 'createGame':
          gameId = Math.floor(1000 + Math.random() * 9000).toString()
          gameId = '1111' //TODO
          while (games.has(gameId)) {
            gameId = Math.floor(1000 + Math.random() * 9000).toString()
          }

          player.gameId = gameId

          let gamePlayers = {}
          gamePlayers[player.id] = {}
          games.set(gameId, {turn: '', hostId: player.id, characters: cmd.characters, players: gamePlayers, actions: {} })
          player.send(`{"op": "gameDetails", "gameId": "${gameId}", "hostId": "${player.id}", "characters": ${JSON.stringify(cmd.characters)}, "turn": ""}`)

          break
        case 'joinGame':
          if (games.has(cmd.gameId)) {
            let game = games.get(cmd.gameId)
            if (game.characters.length <= Object.keys(game.players).length) {
              player.send(`{"op": "gameDetails", "error": "房间已满"}`)
            } else {
              player.gameId = cmd.gameId
              game.players[player.id] = {}
              player.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}, "players": ${JSON.stringify(game.players)}, "turn": "${game.turn}", "actions": "${JSON.stringify(game.actions)}"}`)
            }
          } else {
            player.send(`{"op": "gameDetails", "error": "房间号${cmd.gameId}不存在"}`)
          }
          break
        case 'leaveGame':
          gameId = player.gameId
          if (gameId != '') {
            if (games.has(gameId)) {
              let game = games.get(gameId)
              if (game.hostId == player.id) {
                // Close game for all users if host quit
                for (let p in game.players) {
                  if (players.has(p)) players.get(p).gameId = ''
                  players.get(p).send(`{"op": "gameDetails", "gameId": ""}`)
                }
                games.delete(gameId)
              } else {
                // Should we keep player data for him to come back? Game will break at this point
                delete game.players[player.id]
                player.send(`{"op": "gameDetails", "gameId": ""}`)
              }
            }

            player.gameId = ''
          }
          break
        case 'gameDetails':
          if (games.has(cmd.gameId)) {
            let game = games.get(cmd.gameId)
            console.log(JSON.stringify(game.players))
            player.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}, "players": ${JSON.stringify(game.players)}, "turn": "${game.turn}", "actions": "${JSON.stringify(game.actions)}"}`)
          } else {
            player.gameId = ''
            player.send(`{"op": "gameDetails", "gameId": ""}`)
          }
          break
        case 'takeSeat':
          if (games.has(player.gameId)) {
            let game = games.get(player.gameId)
            game.players[player.id].position = cmd.position
            for (let p in game.players) {
              players.get(p).send(`{"op": "takeSeat", "position": ${cmd.position}, "playerId": "${player.id}"}`)
            }
          }
          break
        case 'startGame':
          if (games.has(cmd.gameId)) {
            let game = games.get(cmd.gameId)
            let charactersCopy = JSON.parse(JSON.stringify(game.characters))
            let shuffled = charactersCopy.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)

            let counter = 0
            for (let p in game.players) {
              game.players[p].character = shuffled[counter ++]
            }

            game.turn = 'viewCharacter'
            game.turnOrder = game.characters.filter((c, p) => (c != 'villager') && game.characters.indexOf(c) == p).sort((a, b) => turnOrder[a] - turnOrder[b])

            for (let p in game.players) {
              players.get(p).send(`{"op": "gameDetails", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}, "players": ${JSON.stringify(game.players)}, "turn": "${game.turn}", "actions": "${JSON.stringify(game.actions)}"}`)
            }
          }
          break
        case 'endTurn':
          if (games.has(player.gameId)) {
            let game = games.get(player.gameId)
            if (game.turnOrder.length > 0){
              game.turn = game.turnOrder.shift()

              if (cmd.action != 'nightStart') game.actions[cmd.action] = cmd.target
              for (let p in game.players) {
                if (cmd.action == 'nightStart') {
                  players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}"}`)
                } else {
                  players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}", "action": "${cmd.action}", "target": "${cmd.target}"}`)
                }
              }
            } else {
              game.turn = 'viewResult'
              for (let p in game.players) {
                players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}"}`)
              }
            }
          }
          break
        default:
          console.log('unknown command: ' + data)
      }
    } catch (err) {
      console.log(err.stack)
    }
  });
})




app.get('/debug', (req, res) => {
  let status = '<h1>Players</h1>'
  for (const [id, p] of players) {
    status += '<br />' + id + ' - Last heartbeat: ' + p.heatbeat + (p.gameId == '' ? ' - Not in game' : ' - ' + p.gameId)
  }

  status += '<br /><br /><h1>Games</h1>'
  for (const [id, g] of games) {
    status += '<br />' + id + '<span style="color:red"> Host </span> ' + g.hostId + ' <span style="color:red"> characters </span> ' + JSON.stringify(g.characters)
    status += '<br /><span style="color:red"> Turn </span> ' + g.turn + ' <span style="color:red"> turnOrder </span> ' + (g.turnOrder == undefined ? '[]' : JSON.stringify(g.turnOrder))
    status += '<br />' + JSON.stringify(g.players)
    status += '<br />' + JSON.stringify(g.actions)
  }
  res.send(status)
})

app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
  // let a = {a: 1, b: 2}
  // console.log(JSON.stringify(a))
  // for (let key in a) {
  //   console.log(key + a[key])
  // }
  // a.key = 'val'
  // console.log(JSON.stringify(a))
  // delete a.key
  // console.log(JSON.stringify(a))
  // let a = ["werewolf","werewolf","werewolf","werewolf","villager","villager","villager","villager","seer","witch","hunter","guard"]
  // let b = a.filter((c, pos) => (c != 'villager') && a.indexOf(c) == pos).sort((a, b) => turnOrder[a] - turnOrder[b])
  // console.log(b)
})

const turnOrder = {
  werewolf: 1,
  seer: 2,
  witch: 3,
  hunter: 4,
  guard: 5
}


