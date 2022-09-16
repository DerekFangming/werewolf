const express = require('express')
const path = require('path')
const fs = require('fs')
const ws = require('ws')
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const server = require('http').createServer()

const app = express()

const port = '9003'
const production = process.env.PRODUCTION == 'true'

const games = new Map()
const players = new Map()

const turnOrder = {
  thief: 1,
  cupid: 2,
  werewolf: 3,
  werewolfQueen: 4,
  hiddenWerewolf: 5,
  seer: 6,
  witch: 7,
  hunter: 8,
  guard: 9
}

const wss = new ws.Server({
  server: server
})

server.on('request', app);

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
            player.profileName = cmd.name
            player.profileAvatar = cmd.avatar
            player.heatbeat = new Date()
            player.gameId = existing.gameId
            players.set(cmd.playerId, player)

            player.send(`{"op": "handshake", "playerId": "${existing.id}", "gameId": "${existing.gameId}"}`)
          } else {
            // New or expired user
            player.id = uuidValidate(cmd.playerId) ? cmd.playerId : uuidv4()
            player.profileName = cmd.name
            player.profileAvatar = cmd.avatar
            player.heatbeat = new Date()
            player.gameId = ''
            players.set(player.id, player)
  
            player.send(`{"op": "handshake", "playerId": "${player.id}", "gameId": ""}`)
          }
          break
        case 'heartBeat':
          if (players.has(player.id)) {
            players.get(player.id).heatbeat = new Date()
          }
          break
        case 'createGame':
          gameId = Math.floor(1000 + Math.random() * 9000).toString()
          if (!production) gameId = '1111' // Force first room # for dev testing
          while (games.has(gameId)) {
            gameId = Math.floor(1000 + Math.random() * 9000).toString()
          }

          player.gameId = gameId

          let gamePlayers = {}
          gamePlayers[player.id] = {name: player.profileName, avatar: player.profileAvatar}
          let game = {turn: '', hostId: player.id, characters: cmd.characters, players: gamePlayers, actions: {} }
          games.set(gameId, game)
          player.send(gameDetailsOp(game, gameId))

          break
        case 'joinGame':
          if (games.has(cmd.gameId)) {
            let game = games.get(cmd.gameId)
            if (game.characters.length <= Object.keys(game.players).length) {
              player.send(`{"op": "gameDetails", "error": "房间已满"}`)
            } else {
              player.gameId = cmd.gameId
              game.players[player.id] = {name: player.profileName, avatar: player.profileAvatar}
              player.send(gameDetailsOp(game, cmd.gameId))
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
            player.send(gameDetailsOp(game, cmd.gameId))
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
              players.get(p).send(`{"op": "takeSeat", "position": ${cmd.position}, "playerId": "${player.id}", "name": "${player.profileName}", "avatar": "${player.profileAvatar}"}`)
            }
          }
          break
        case 'updateSetting':
          player.profileName = cmd.name
          player.profileAvatar = cmd.avatar
          if (games.has(player.gameId)) {
            let game = games.get(player.gameId)
            game.players[player.id].name = cmd.name
            game.players[player.id].avatar = cmd.avatar
            for (let p in game.players) {
              if (game.players[player.id].position) {
                players.get(p).send(`{"op": "takeSeat", "position": ${game.players[player.id].position}, "playerId": "${player.id}", "name": "${player.profileName}", "avatar": "${player.profileAvatar}"}`)
              }
            }
          }
          break
        case 'startGame':
          if (games.has(cmd.gameId)) {
            startGame(cmd.gameId)
          }
          break
        case 'endTurn':
          if (games.has(player.gameId)) {
            endTurn(player.gameId, cmd.action, cmd.target)
          }
          break
        case 'restartGame':
          if (games.has(player.gameId)) {
            startGame(player.gameId)
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

function startGame(gameId) {
  let game = games.get(gameId)
  let charactersCopy = JSON.parse(JSON.stringify(game.characters))

  let thiefOpt = []
  if (charactersCopy.includes('thief')) {
      charactersCopy = charactersCopy.filter(c => c != 'thief')
      charactersCopy = charactersCopy.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
      thiefOpt.push(charactersCopy.pop())
      thiefOpt.push(charactersCopy.pop())
      charactersCopy.push('thief')
      game.thiefOpt = thiefOpt
  }

  let shuffled = charactersCopy.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)

  let counter = 0
  for (let p in game.players) {
    game.players[p].character = shuffled[counter ++]
  }

  game.actions = {}
  game.turn = 'viewCharacter'
  game.turnOrder = game.characters.filter((c, p) => c in turnOrder && game.characters.indexOf(c) == p)
    .sort((a, b) => turnOrder[a] - turnOrder[b])

  for (let p in game.players) {
    players.get(p).send(gameDetailsOp(game, gameId))
  }
}

function endTurn(gameId, action, target) {
  let game = games.get(gameId)
  if (action != undefined && action != 'nightStart') game.actions[action] = target
  if (game.turnOrder.length > 0){

    if (action == 'cupidChoose') {
      game.turn = 'cupidResult'
    } else {
      game.turn = game.turnOrder.shift()
    }

    for (let p in game.players) {
      if (action == 'nightStart') {
        players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}"}`)
      } else {
        players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}", "action": "${action}", "target": "${target}"}`)
      }
    }
  } else {
    game.turn = 'viewResult'
    for (let p in game.players) {
      players.get(p).send(`{"op": "endTurn", "turn": "${game.turn}", "action": "${action}", "target": "${target}"}`)
    }
  }

  // Check for empty round that thief discarded
  if (game.thiefOpt) {
    let discarded = game.thiefOpt[0] == game.actions.thiefChoose ? game.thiefOpt[1] : game.thiefOpt[0]
    if (game.turn == discarded) {
      setTimeout(function(){
        endTurn(gameId, undefined, undefined)
      }, Math.floor(Math.random() * 20000) + 10000);
    }
  }
}

function gameDetailsOp(game, gameId){
  let g = Object.assign({}, game)
  delete g['turnOrder']
  g.gameId = gameId
  g.op = 'gameDetails'
  
  return JSON.stringify(g)
}


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

app.get('/game', (req, res) => {
  fs.readFile(__dirname + '/public/index.html', 'utf8', (err, text) => {
    res.send(text)
  })
})

app.use(express.static(path.join(__dirname, 'public')))

server.listen(port, function() {})

