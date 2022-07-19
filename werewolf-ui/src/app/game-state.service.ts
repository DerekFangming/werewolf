import { Injectable } from "@angular/core"
import { CookieService } from "ngx-cookie-service"
import { Player } from "./model/player"
import Utils from "./util"

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private static readonly playerIdCookieName = 'wwPlayerId'
  private static readonly gameIdCookieName = 'wwGameId'

  playerId = ''
  gameId = ''
  hostId = ''
  characters = ''
  turn = ''
  playerPosition = {}
  players = []
  actions = {}
  state = 'loading'

  constructor(private cookieService: CookieService) {
    this.playerId = this.cookieService.get(GameStateService.playerIdCookieName)
    this.gameId = this.cookieService.get(GameStateService.gameIdCookieName)
    console.log(this.playerId)
  }

  getPlayerId() {
    return this.playerId
  }

  setPlayerId(playerId: string) {
    this.playerId = playerId
    return this.cookieService.set(GameStateService.playerIdCookieName, playerId, 0, '/');
  }

  getGameId() {
    return this.gameId
  }

  setGameId(gameId: string) {
    this.gameId = gameId
    this.state = gameId == '' ? 'lobby' : 'game'
    if (gameId == '') {
      this.gameId = ''
      this.hostId = ''
      this.characters = ''
      this.turn = ''
      this.playerPosition = {}
      this.players = []
      this.actions = {}
    }
    return this.cookieService.set(GameStateService.gameIdCookieName, gameId, 0, '/');
  }

  setplayerIdAndGameId(playerId: string, gameId: string) {
    this.setPlayerId(playerId)
    this.setGameId(gameId)
  }

  setState(state: string) {
    this.state = state
  }

  setGame(gameId: string, hostId: string, turn: string, characters: string[], players: object, actions: object) {
    if (gameId == '') {
      this.setGameId(gameId)
      return
    }
    let m = new Map()
    this.players = []
    for (let c of characters) {
      m.has(c) ? m.set(c, m.get(c) + 1) : m.set(c, 1)
      this.players.push(new Player())
    }

    this.characters = ''
    for (const [key, value] of m) {
      if (this.characters != '') this.characters += ', '

      this.characters += Utils.parseCharactor(key).name
      if (value > 1) this.characters += 'X' + value
    }

    for (let p in players) {
      if ('position' in players[p]) {
        this.takeSeat(p, players[p].position)
      }
      if ('character' in players[p]) {
        if (p in this.playerPosition) {
          this.players[this.playerPosition[p] - 1].id = p
          this.players[this.playerPosition[p] - 1].character = Utils.parseCharactor(players[p].character)
        }
      }
    }

    this.actions = {}
    if (actions != undefined) {
      this.actions = actions
    }

    this.turn = turn
    this.hostId = hostId
    this.setGameId(gameId)
  }

  takeSeat(playerId: string, position: number) {
    if (playerId in this.playerPosition) {
      this.players[this.playerPosition[playerId] - 1].isOcupied = false
      if (this.playerId == playerId) {
        this.players[this.playerPosition[playerId] - 1].isSelf = false
      }
    }
    this.playerPosition[playerId] = position
    this.players[position - 1].isOcupied = true
    if (this.playerId == playerId) {
      this.players[position - 1].isSelf = true
    }
  }

  getSelfCharacter() {
    let position = this.playerPosition[this.playerId]
    return this.players[position - 1].character
  }

  endTurn(newTurn: string, action: string, targetId: string) {
    if (action != undefined && targetId != undefined) {
      this.actions[action] = targetId
    }
    if (this.hostId == this.playerId) {
      if (this.turn == 'viewCharacter') {
        this.announce('nightStart.mp3')
      } else {
        this.announce(Utils.parseCharactor(this.turn).endAudio)
      }

      let that = this
      setTimeout(function() {
        if (newTurn == 'viewResult') {
          that.announce('nightEnd.mp3')
        } else {
          that.announce(Utils.parseCharactor(newTurn).startAudio)
        }
      }, 6000)
    }
    this.turn = newTurn
  }

  audio: HTMLAudioElement

  announce(fileName: string) {

    if (this.audio == null) {
      this.audio = new Audio()
    }

    this.audio.src = `./assets/${fileName}`
    this.audio.load() 
    this.audio.play()
  }
  
}