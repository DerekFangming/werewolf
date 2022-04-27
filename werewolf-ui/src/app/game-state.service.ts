import { Injectable } from "@angular/core"
import { CookieService } from "ngx-cookie-service"
import Utils from "./util"

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private static readonly playerIdCookieName = 'wwPlayerId'
  private static readonly gameIdCookieName = 'wwGameId'

  playerId = ''
  gameId = ''
  characters = ''
  playerCount = 0
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
    return this.cookieService.set(GameStateService.gameIdCookieName, gameId, 0, '/');
  }

  setplayerIdAndGameId(playerId: string, gameId: string) {
    this.setPlayerId(playerId)
    this.setGameId(gameId)
  }

  setState(state: string) {
    this.state = state
  }

  setGame(gameId: string, characters: string[]) {
    let m = new Map()
    for (let c of characters) {
      m.has(c) ? m.set(c, m.get(c) + 1) : m.set(c, 1)
    }

    this.characters = ''
    for (const [key, value] of m) {
      if (this.characters != '') this.characters += ', '

      this.characters += Utils.parseCharactor(key).name + 'X' + value
    }

    this.playerCount = characters.length
    this.setGameId(gameId)
  }
  
}