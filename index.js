const express = require('express')
const path = require('path')
const ws = require('ws')
const { v4: uuidv4 } = require('uuid');

const app = express()

const port = '9001'
const production = process.env.PRODUCTION == 'true'

const wss = new ws.Server({ path: '/haha', port: 8081 });

const games = new Map()
const players = new Map()

games.set(uuidv4(), {name: 'The game!', started: false, total: 12, existing: 9})
games.set(uuidv4(), {name: 'Hahahah', started: true, total: 6, existing: 6})

wss.on('connection', function connection(player) {
  player.on('message', function message(data) {
    console.log('received from %s: %s', player.id, data)
    try {
      let cmd = JSON.parse(data)
      switch (cmd.op) {
        case 'create':
          console.log('creating game')
          break
        default:
          console.log('unknown command: ' + cmd.op)
      }
      console.log(d.op)
    } catch (err) {
      console.log('not json')
    }
  });

  player.id = uuidv4()
  console.log('Player joined: ' + player.id)
  player.send('j')

  // console.log(clients.get('a'));
  players.set(player.id, {player: player, heatbeat: new Date()})

  // Send games info
  let gamesInfo = Array.from(games, ([id, game]) => ({ name: game.name, started: game.started, total: game.total, existing: game.existing }))

  player.send(JSON.stringify(gamesInfo))
})




app.get('/poll', (req, res) => {
  if (req.query.checkPoint == undefined || req.query.checkPoint != checkPoint) {
    res.json({lastReceived: lastReceived, notification: notification, storeCards: storeCards, sellerCards: sellerCards, highlightCards: highlightCards, checkPoint: checkPoint})
  } else {
    res.json({lastReceived: lastReceived, notification: notification, storeCards: [], sellerCards:[], highlightCards: [], checkPoint: checkPoint})
  }
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


