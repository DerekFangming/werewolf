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

  setGame(gameId: string, hostId: string, turn: string, characters: string[], players: object) {
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

      this.characters += Utils.parseCharactor(key).name + 'X' + value
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

    this.turn = turn
    this.hostId = hostId
    this.setGameId(gameId)
  }

  takeSeat(playerId: string, position: number) {
    if (playerId in this.playerPosition) {
      this.players[this.playerPosition[playerId] - 1].selected = false
    }
    this.playerPosition[playerId] = position
    this.players[position - 1].selected = true
  }

  getSelfCharacter() {
    let position = this.playerPosition[this.playerId]
    return this.players[position - 1].character
  }

  endTurn(newTurn: string, action: string, targetId: string) {
    if (this.hostId == this.playerId) {
      if (this.turn == 'viewCharacter') {
        this.announce('天黑请闭眼')
      } else {
        this.announce(Utils.parseCharactor(this.turn).name + '请闭眼')
      }

      let that = this
      setTimeout(function() {
        if (newTurn == 'viewResult') {
          that.announce('天亮了')
        } else {
          that.announce(Utils.parseCharactor(newTurn).name + ' 请睁眼')
        }
      }, 5000)
    }
    this.turn = newTurn
  }

  announce(things: string) {
    console.log(new Date() + ' ' + things)
  }
  
}