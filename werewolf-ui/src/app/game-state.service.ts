import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private static readonly playerIdCookieName = 'wwPlayerId'
  private static readonly gameIdCookieName = 'wwGameId'

  constructor(private cookieService: CookieService) {
    // let val = this.cookieService.get('Test')
    // console.log(val)
    // if (val == '') {
    //   console.log('=============================')
    // }

    // this.cookieService.set('ww_asoo', '44444', 0, '/');
    // let val1 = this.cookieService.get('ww_asoo')
    // console.log(val1)
  }

  getPlayerId() {
    return this.cookieService.get(GameStateService.playerIdCookieName)
  }

  setPlayerId(playerId: string) {
    return this.cookieService.set(GameStateService.playerIdCookieName, playerId, 0, '/');
  }

  getGameId() {
    return this.cookieService.get(GameStateService.gameIdCookieName)
  }

  setGameId(gameId: string) {
    return this.cookieService.set(GameStateService.gameIdCookieName, gameId, 0, '/');
  }
  
}