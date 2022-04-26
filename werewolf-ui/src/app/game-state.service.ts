import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private static readonly playerIdCookieName = 'wwPlayerId'
  private static readonly gameIdCookieName = 'wwGameId'

  playerId = ''
  gameId = ''
  state = 'loading'

  constructor(private cookieService: CookieService) {
    this.playerId = this.cookieService.get(GameStateService.playerIdCookieName)
    this.gameId = this.cookieService.get(GameStateService.gameIdCookieName)
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
  
}