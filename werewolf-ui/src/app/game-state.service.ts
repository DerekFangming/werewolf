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
  public static readonly playerNameCookieName = 'wwPlayerName'
  public static readonly playerAvatarCookieName = 'wwGameAvatar'

  playerId = ''
  gameId = ''
  hostId = ''
  characterDetails = ''
  turn = ''
  characters: string[] = []
  playerPosition: any = {}
  allPlayers: any[]  = []
  seats: any[] = []
  actions: any = {}
  thiefOpt: any[] = []
  cupidSelection: any[] = []
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
    return this.cookieService.set(GameStateService.playerIdCookieName, playerId, 3650, '/');
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
      this.characterDetails = ''
      this.turn = ''
      this.characters = []
      this.playerPosition = {}
      this.seats = []
      this.allPlayers = []
      this.actions = {}
      this.thiefOpt = []
      this.cupidSelection = []
    }
    return this.cookieService.set(GameStateService.gameIdCookieName, gameId, 3650, '/');
  }

  setplayerIdAndGameId(playerId: string, gameId: string) {
    this.setPlayerId(playerId)
    this.setGameId(gameId)
  }

  setState(state: string) {
    this.state = state
  }

  setGame(gameId: string, hostId: string, turn: string, characters: string[], players: any, actions: any, thiefOpt: string[]) {
    if (gameId == '') {
      this.setGameId(gameId)
      return
    }
    let m = new Map()
    this.characters = characters
    this.seats = []
    this.allPlayers = []
    for (let c of characters) {
      m.has(c) ? m.set(c, m.get(c) + 1) : m.set(c, 1)
      this.seats.push(new Player())
    }

    // Two players less if thief exists
    if (characters.includes('thief')) this.seats = this.seats.slice(0, -2)

    this.characterDetails = ''
    for (const [key, value] of m) {
      if (this.characterDetails != '') this.characterDetails += ', '

      this.characterDetails += Utils.parseCharactor(key)?.name
      if (value > 1) this.characterDetails += 'X' + value
    }

    for (let p in players) {
      this.allPlayers.push({id: p, name: players[p].name, avatar: players[p].avatar, position: players[p].position})
      if ('position' in players[p]) {
        this.takeSeat(p, players[p].position, players[p].name, players[p].avatar)
      }
      if ('character' in players[p]) {
        if (p in this.playerPosition) {
          this.seats[this.playerPosition[p] - 1].id = p
          this.seats[this.playerPosition[p] - 1].character = Utils.parseCharactor(players[p].character)
        }
      }
    }

    this.actions = {}
    if (actions != undefined) {
      this.actions = actions

      if (actions.thiefChoose) {
        for (let p of this.seats) {
          if (p.character.type == 'thief') {
            p.character = Utils.parseCharactor(actions.thiefChoose)
            break
          }
        }
      }
    }

    this.thiefOpt = []
    if (thiefOpt != undefined) {
      this.thiefOpt = thiefOpt
    }

    this.cupidSelection = []
    this.turn = turn
    this.hostId = hostId
    this.setGameId(gameId)
  }

  getName() {
    return this.cookieService.get(GameStateService.playerNameCookieName)
  }

  getAvatar() {
    return this.cookieService.get(GameStateService.playerAvatarCookieName)
  }

  updateProfile(playerId: string, name: string, avatar: string) {
    let player = this.allPlayers.find(p => p.id == playerId)
    if (player != null) {
      player.name = name
      player.avatar = avatar
    }

    if (playerId in this.playerPosition) {
      this.seats[this.playerPosition[playerId] - 1].name = name
      this.seats[this.playerPosition[playerId] - 1].avatar = avatar
    }
  }

  takeSeat(playerId: string, position: number, name: string, avatar: string) {
    let player = this.allPlayers.find(p => p.id == playerId)
    if (player != null) {
      player.name = name
      player.position = position
      player.avatar = avatar
    }

    if (playerId in this.playerPosition) {
      this.seats[this.playerPosition[playerId] - 1].isOcupied = false
      if (this.playerId == playerId) {
        this.seats[this.playerPosition[playerId] - 1].isSelf = false
      }
    }
    this.playerPosition[playerId] = position
    this.seats[position - 1].isOcupied = true
    this.seats[position - 1].name = name
    this.seats[position - 1].avatar = avatar
    if (this.playerId == playerId) {
      this.seats[position - 1].isSelf = true
    }
  }

  joinGame(playerId: string, name: string, avatar: string) {
    this.allPlayers.push({id: playerId, name: name, avatar: avatar})
  }

  leaveGame(playerId: string) {
    this.allPlayers = this.allPlayers.filter(p => p.id != playerId)

    if (playerId in this.playerPosition) {
      this.seats[this.playerPosition[playerId] - 1].isOcupied = false
      this.seats[this.playerPosition[playerId] - 1].isSelf = false
      // if (this.playerId == playerId) {
      //   this.seats[this.playerPosition[playerId] - 1].isSelf = false
      // }
    }
    // this.playerPosition[playerId] = position
    // this.seats[position - 1].isOcupied = true
    // this.seats[position - 1].name = name
    // this.seats[position - 1].avatar = avatar
    // if (this.playerId == playerId) {
    //   this.seats[position - 1].isSelf = true
    // }
  }

  getSelfCharacter() {
    let position = this.playerPosition[this.playerId]
    return this.seats[position - 1].character
  }

  getThiefChoices() {
    if (this.thiefOpt == null || this.thiefOpt.length != 2) return []
    let character0 = Utils.parseCharactor(this.thiefOpt[0])
    let character1 = Utils.parseCharactor(this.thiefOpt[1])
    let hasWolf = character0.isWolf || character1.isWolf

    return [{
      type: this.thiefOpt[0],
      name: character0.name,
      selectable: hasWolf ? character0.isWolf : true
    }, {
      type: this.thiefOpt[1],
      name: character1.name,
      selectable: hasWolf ? character1.isWolf : true
    }]
  }

  endTurn(newTurn: string, action: string, targetId: string) {
    if (action != undefined && targetId != undefined) {
      this.actions[action] = targetId
    }
    if (this.hostId == this.playerId) {
      let roundEndAudio = this.turn == 'viewCharacter' ? 'nightStart.mp3' : this.turn == 'cupidResult' ? 'cupidRevealEnd.mp3' : Utils.parseCharactor(this.turn).endAudio

      let that = this
      this.announce(roundEndAudio, function() {
        let roundStartAudio = newTurn == 'viewResult' ? 'nightEnd.mp3' : newTurn == 'cupidResult' ? 'cupidRevealStart.mp3' : Utils.parseCharactor(newTurn).startAudio
        setTimeout(function() {
          that.announce(roundStartAudio)
        }, 2500)
      })
    }
    if (action == 'thiefChoose') {
      for (let p of this.seats) {
        if (p.character.type == 'thief') {
          p.character = Utils.parseCharactor(targetId)
          break
        }
      }
    }
    this.turn = newTurn
  }

  audio: HTMLAudioElement | undefined

  announce(fileName: string, done: any = null) {
    if (this.audio == null) {
      this.audio = new Audio()
    }
    this.audio.onended = function() {
      if (done != null) done()
    }

    this.audio.src = `./assets/${fileName}`
    this.audio.load() 
    this.audio.play()
  }
  
}