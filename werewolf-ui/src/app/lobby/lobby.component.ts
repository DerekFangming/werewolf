import { Component, OnInit } from '@angular/core'
import { GameStateService } from '../game-state.service';
import { Guard } from '../model/guard';
import { Hunter } from '../model/hunter';
import { Seer } from '../model/seer';
import { Villager } from '../model/villager';
import { Werewolf } from '../model/werewolf';
import { Witch } from '../model/witch';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  ws: WebSocket
  players = []

  constructor(public gameState: GameStateService) { }

  ngOnInit() {
    // const ws = new WebSocket('ws://localhost:8080')
    this.ws = new WebSocket('ws://10.0.1.50:8080')
    let that = this

    this.ws.onopen = function (event) {
      that.ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}"}`)
    };

    this.ws.onmessage = function (data) {
      let cmd = JSON.parse(data.data)
      console.log('received: %s', JSON.stringify(cmd))
      if (cmd.op == 'handshake') {
        console.log('received: %s', cmd.playerId)
        that.gameState.setplayerIdAndGameId(cmd.playerId, cmd.gameId)
        
        return
      }
    }

    this.ws.onclose = function (data) {
      console.log('Server closed')
    }
  }

  createGame() {
    this.gameState.setState('create')
    this.players = [new Werewolf({selected: true}), new Werewolf({selected: true}), new Werewolf(), new Werewolf(),
      new Villager({selected: true}), new Villager({selected: true}), new Villager(), new Villager(),
      new Seer({selected: true}), new Witch({selected: true}), new Hunter(), new Guard()]
  }

  confirmCreateGame() {
    let selected = this.players.filter(p => p.selected).map(p => p.name)
    if (selected.length < 6) {

    }

    this.gameState.setState('loading')

  }

}
