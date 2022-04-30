import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { GameStateService } from '../game-state.service';
import { Guard } from '../model/guard';
import { Hunter } from '../model/hunter';
import { Seer } from '../model/seer';
import { Villager } from '../model/villager';
import { Werewolf } from '../model/werewolf';
import { Witch } from '../model/witch';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  gameIdInput = ''
  error = ''
  ws: WebSocket
  players = []

  @ViewChild('errModal', { static: true}) errModal: TemplateRef<any>
  @ViewChild('confirmModel') confirmModel: ConfirmDialogComponent

  constructor(public gameState: GameStateService, private modalService: NgbModal, private elementRef:ElementRef) { }

  ngOnInit() {
    this.ws = new WebSocket(environment.socketAddress)
    let that = this

    this.ws.onopen = function (event) {
      that.ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}"}`)
    }

    this.ws.onmessage = function (data) {
      console.log('received: %s', data.data)
      let cmd = JSON.parse(data.data)
      switch (cmd.op) {
        case 'handshake':
          that.gameState.setplayerIdAndGameId(cmd.playerId, cmd.gameId)
          if (cmd.gameId != '') that.ws.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}"}`)
          break
        case 'gameDetails':
          if (cmd.error == null) {
            console.log(cmd)
            that.gameState.setGame(cmd.gameId, cmd.hostId, cmd.turn, cmd.characters, cmd.players, cmd.actions)
          } else {
            that.gameState.setState('lobby')
            that.error = cmd.error
            that.modalService.open(that.errModal, { centered: true })
          }
          break
        case 'takeSeat':
          that.gameState.takeSeat(cmd.playerId, cmd.position)
          break
        case 'endTurn':
          that.gameState.endTurn(cmd.turn, cmd.action, cmd.target)
          break
        default:
        console.log('unknown command: ' + data)
      }
    }

    this.ws.onclose = function (data) {
      console.log('Server closed')
    }
  }

  createGame() {
    this.gameState.setState('createGame')
    this.players = [new Werewolf({selected: true}), new Werewolf({selected: true}), new Werewolf(), new Werewolf(),
      new Villager({selected: true}), new Villager({selected: true}), new Villager(), new Villager(),
      new Seer({selected: true}), new Witch({selected: true}), new Hunter(), new Guard()]
  }

  confirmCreateGame() {
    let selected = this.players.filter(p => p.selected).map(p => p.type)
    if (selected.length < 6) {
      this.error = '至少需要六人才能创建游戏'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      console.log(JSON.stringify(selected))
      this.ws.send(`{"op": "createGame", "characters": ${JSON.stringify(selected)}}`)
    }
  }

  joinGame(){
    if (!environment.production) this.gameIdInput = '1111' // Force first room # for dev testing
    this.gameState.setState('joinGame')
  }

  confirmJoinGame() {
    let gameId = this.gameIdInput.trim()
    if (gameId.length != 4) {
      this.error = '房间号应该为四位数字'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      this.ws.send(`{"op": "joinGame", "gameId": "${gameId}"}`)
    }
  }

  selectSeat(seatInd: number) {
    if (this.gameState.turn == '') {
      console.log(3)
      if (!this.gameState.players[seatInd].selected) {
        this.confirmModel.showDialog('入座', '确定在' + (seatInd+1) + '号入座？', {'op': 'takeSeat', 'position': seatInd+1})
      }
    } else if (this.isMyTurn()) {
      let character = this.gameState.getSelfCharacter()
      if (character.actionName == 'seerExamine') {
        this.confirmModel.showDialog(character.actionTitle, character.actionMessage.replace(/\{0\}/, seatInd+1),
          {'op': 'seerExamine', 'action': character.actionName, 'target': seatInd})
      } else if (character.actionName == 'witchPills') {
        let position = this.gameState.playerPosition[this.gameState.actions['werewolfKill']]
        if (position == seatInd + 1) {
          this.confirmModel.showDialog(character.actionTitle.replace(/\{0\}/, '解药'), character.actionMessage.replace(/\{0\}/, seatInd+1).replace(/\{1\}/, '解药'),
          {'op': 'endTurn', 'action': 'witchSave', 'target': this.gameState.players[seatInd].id}, false, '确认，并结束回合')
        } else {
          this.confirmModel.showDialog(character.actionTitle.replace(/\{0\}/, '毒药'), character.actionMessage.replace(/\{0\}/, seatInd+1).replace(/\{1\}/, '毒药'),
          {'op': 'endTurn', 'action': 'witchKill', 'target': this.gameState.players[seatInd].id}, false, '确认，并结束回合')
        }
      } else {
        this.confirmModel.showDialog(character.actionTitle, character.actionMessage.replace(/\{0\}/, seatInd+1),
          {'op': 'endTurn', 'action': character.actionName, 'target': this.gameState.players[seatInd].id}, false, '确认，并结束回合')
      }
    }
  }

  startGame() {
    if (this.gameState.players.filter(p => !p.selected).length > 0) {
      this.error = '所有人选择座位之后才可以开始发牌'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.ws.send(`{"op": "startGame", "gameId": "${this.gameState.gameId}"}`)
    }
  }

  viewCharacter() {
    this.confirmModel.showDialog('你的身份是', `${this.gameState.getSelfCharacter().name}`, {})
  }

  isMyTurn() {
    if (this.gameState.turn != '') {
      if (this.gameState.turn == this.gameState.getSelfCharacter().type) {
        return true
      }
    }
    return false
  }

  nightStart() {
    // Need this to break IOS mobile audio limitation.
    this.gameState.announce('soundUnlock.mp3')
    this.ws.send(`{"op": "endTurn", "action": "nightStart"}`)
  }

  endTurn() {
    this.ws.send(`{"op": "endTurn"}`)
  }

  getNote() {
    let character = this.gameState.getSelfCharacter()

    if (character.type == 'witch') {
      let position = this.gameState.playerPosition[this.gameState.actions['werewolfKill']]
      return character.note.replace(/\{0\}/g, position)
    } else if (character.type == 'hunter') {
      if ('witchKill' in this.gameState.actions) {
        if (this.gameState.actions['witchKill'] == this.gameState.playerId) {
          return character.note.replace(/\{0\}/g, '不可以')
        }
      }
      return character.note.replace(/\{0\}/g, '可以')
    } else {
      return character.note
    }
  }

  viewResult() {
    if ('witchSave' in this.gameState.actions) {
      if ('guardProtect' in this.gameState.actions && this.gameState.actions['witchSave'] == this.gameState.actions['guardProtect']) {
        this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${this.gameState.playerPosition[this.gameState.actions['werewolfKill']]} 号`, {}, true)
      } else {
        this.confirmModel.showDialog('昨晚结果', '昨晚是平安夜', {}, true)
      }
    } else if ('witchKill' in this.gameState.actions) {
      let witchKill = this.gameState.playerPosition[this.gameState.actions['witchKill']]

      if ('guardProtect' in this.gameState.actions && this.gameState.actions['werewolfKill'] == this.gameState.actions['guardProtect']) {
        this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${witchKill} 号`, {}, true)
      } else {
        let wolfKill = this.gameState.playerPosition[this.gameState.actions['werewolfKill']]
        this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${wolfKill} 号和 ${witchKill} 号`, {}, true)
      }
    } else {
      if ('guardProtect' in this.gameState.actions && this.gameState.actions['werewolfKill'] == this.gameState.actions['guardProtect']) {
        this.confirmModel.showDialog('昨晚结果', '昨晚是平安夜', {}, true)
      } else {
        this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${this.gameState.playerPosition[this.gameState.actions['werewolfKill']]} 号`, {}, true)
      }
    }
  }

  restartGame() {
    this.confirmModel.showDialog('重新发牌', '请确认使用同样角色配置重新开始游戏', {op: 'restartGame'})
  }

  public onConfirm(context: any) {
    switch(context.op) {
      case 'leaveGame':
        this.ws.send(`{"op": "leaveGame"}`)
        break
      case 'takeSeat':
        this.ws.send(`{"op": "takeSeat", "position": ${context.position}}`)
        break
      case 'endTurn':
        if (context.action == undefined) {
          this.ws.send(`{"op": "endTurn"}`)
        } else {
          this.ws.send(`{"op": "endTurn", "action": "${context.action}", "target": "${context.target}"}`)
        }
        break
      case 'seerExamine': {
        let character = this.gameState.players[context.target].character.isWolf ? '坏人' : '好人'
        this.confirmModel.showDialog('身份检验', `${context.target + 1}号玩家的身份是${character}。`, {op: 'endTurn'}, true, '下一回合')
        break
      }
      case 'restartGame':
        this.ws.send(`{"op": "restartGame"}`)
        break
      default:
    }
  }

  debug() {
    // console.log('Player: ' + this.gameState.playerId)
    // console.log(this.gameState.playerPosition)
    // console.log(this.gameState.players)
    // console.log(this.gameState.turn)
    // console.log(this.gameState.getSelfCharacter().type)
    // console.log(this.gameState.actions)
    // console.log(this.gameState.gameId)
    // this.confirmModel.showDialog('你的身份是', `${this.gameState.getSelfCharacter().name}`, {op: 'debug'}, false, '下一回合')

    // try {
    //   let audio = new Audio()
    //   audio.src = `../../assets/nightStart.m4a`
    //   audio.loop = true
    //   audio.load() 
    //   audio.play()

    //   setTimeout(function() {
    //     audio.pause()
    //     audio.src = `../../assets/nightEnd.m4a`
    //     audio.pause()
    //     audio.play()
    //   }, 6000)
    // } catch (err) {
    //   console.log(err)
    // }

    


    this.gameState.announce('nightStart.m4a')
  }

}
