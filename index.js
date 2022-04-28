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
          games.set(gameId, {started: false, hostId: player.id, characters: cmd.characters, players: gamePlayers })
          player.send(`{"op": "gameDetails", "gameId": "${gameId}", "hostId": "${player.id}", "characters": ${JSON.stringify(cmd.characters)}}`)

          break
        case 'joinGame':
          if (games.has(cmd.gameId)) {
            let game = games.get(cmd.gameId)
            if (game.characters.length <= Object.keys(game.players).length) {
              player.send(`{"op": "gameDetails", "error": "房间已满"}`)
            } else {
              player.gameId = cmd.gameId
              game.players[player.id] = {}
              player.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}}`)
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
                for (let p in game.players) {
                  if (players.has(p)) players.get(p).gameId = ''
                  players.get(p).send(`{"op": "gameDetails", "gameId": ""}`)
                }
                games.delete(gameId)
              } else {
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
            player.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}, "players": ${JSON.stringify(game.players)}}`)
          } else {
            player.gameId = ''
            player.send(`{"op": "gameDetails", "gameId": ""}`)
          }
          break
        case 'takeSeat':
          let game = games.get(player.gameId)
          game.players[player.id].position = cmd.position
          for (let p in game.players) {
            players.get(p).send(`{"op": "takeSeat", "position": ${cmd.position}, "playerId": "${player.id}"}`)
          }
          break
        default:
          console.log('unknown command: ' + data)
      }
      //console.log(cmd.op)
    } catch (err) {
      console.log('not json: ' + data + ' ==> ' + err)
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
    status += '<br />' + JSON.stringify(g.players)
  }
  res.send(status)
})

let counter = 0

app.get('/test', (req, res) => {
  console.log(1)
  for (const [key, value] of players) {
    console.log('Sending to client: ' + key)
    counter ++
    value.send('Hello! ' + counter)
  }
  res.sendStatus(200)
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
})


