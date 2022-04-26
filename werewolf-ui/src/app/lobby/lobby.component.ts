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

  players = [new Werewolf(), new Werewolf(), new Werewolf(), new Werewolf(), new Villager(), new Villager(), new Villager(), new Villager(),
    new Seer(), new Witch(), new Hunter(), new Guard()]

  constructor(private gameState: GameStateService) { }

  ngOnInit() {
    // const ws = new WebSocket('ws://localhost:8080')
    const ws = new WebSocket('ws://10.0.1.50:8080')
    let that = this

    ws.onopen = function (event) {
      ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}"}`)
    };

    ws.onmessage = function (data) {
      let cmd = JSON.parse(data.data)
      console.log('received: %s', JSON.stringify(cmd))
      if (cmd.op == 'handshake') {
        console.log('received: %s', cmd.playerId)
        that.gameState.setplayerIdAndGameId(cmd.playerId, cmd.gameId)
        
        return
      }
    }

    ws.onclose = function (data) {
      console.log('Server closed')
    }
  }

}
