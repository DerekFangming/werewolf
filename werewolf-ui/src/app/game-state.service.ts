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

  setGame(gameId: string, hostId:string, characters: string[], players: object) {
    if (gameId == '') {
      this.setGameId(gameId)
      return
    }
    let m = new Map()
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
        players[p].character = Utils.parseCharactor(players[p].character)
      }
    }

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
  
}