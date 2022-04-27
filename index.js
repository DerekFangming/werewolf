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

// games.set(uuidv4(), {name: 'The game!', started: false, total: 12, existing: 9})
// games.set(uuidv4(), {name: 'Hahahah', started: true, total: 6, existing: 6})

wss.on('connection', function connection(player) {
  player.on('message', function message(data) {
    // console.log('received from %s: %s', player.id, data)
    try {
      let cmd = JSON.parse(data)
      switch (cmd.op) {
        case 'handshake':
          
          // Existing user reconnected
          if (players.has(cmd.playerId)) {
            let existing = players.get(cmd.playerId)
            existing.id = cmd.playerId
            existing.heatbeat = new Date()

            player.send(`{"op": "handshake", "playerId": "${existing.id}", "gameId": "${existing.gameId}"}`)
            break
          }

          // New or expired user
          player.id = uuidv4()
          player.heatbeat = new Date()
          player.gameId = ''
          players.set(player.id, player)

          player.send(`{"op": "handshake", "playerId": "${player.id}", "gameId": ""}`)
          break
        case 'create':
          let gameId = Math.floor(1000 + Math.random() * 9000).toString()
          while (games.has(gameId)) {
            gameId = Math.floor(1000 + Math.random() * 9000).toString()
          }

          player.gameId = gameId
          games.set(gameId, {started: false, hostId: player.id, characters: cmd.characters})
          player.send(`{"op": "game", "gameId": "${gameId}", "hostId": "${player.id}", "characters": ${JSON.stringify(cmd.characters)}}`)

          break
        case 'game':
          console.log('Getting game info')
          if (games.has(cmd.gameId)) {
            console.log('Getting game info1')
            let game = games.get(cmd.gameId)
            player.send(`{"op": "game", "gameId": "${cmd.gameId}", "hostId": "${game.hostId}", "characters": ${JSON.stringify(game.characters)}}`)
          } else {
            console.log('Getting game info2')
            player.send(`{"op": "game", "gameId": ""}`)
          }
          break
        default:
          console.log('unknown command: ' + data)
      }
      //console.log(cmd.op)
    } catch (err) {
      console.log('not json: ' + data)
    }
  });

  // player.id = uuidv4()
  // console.log('Player joined: ' + player.id)
  // player.send('j')

  // console.log(clients.get('a'));
  // players.set(player.id, {player: player, heatbeat: new Date()})

  // Send games info
  // let gamesInfo = Array.from(games, ([id, game]) => ({ name: game.name, started: game.started, total: game.total, existing: game.existing }))

  // player.send(JSON.stringify(gamesInfo))
})




app.get('/debug', (req, res) => {
  let status = '<h1>Players</h1>'
  for (const [id, p] of players) {
    status += '<br />' + id + ' - Last heartbeat: ' + p.heatbeat + (p.gameId == '' ? ' - Not in game' : ' - ' + p.gameId)
  }

  status += '<br /><br /><h1>Games</h1>'
  for (const [id, g] of games) {
    status += '<br />' + id + '<span style="color:red"> Host </span> ' + g.hostId + ' <span style="color:red"> characters </span> ' + JSON.stringify(g.characters)
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
app.listen(port, () => {})


