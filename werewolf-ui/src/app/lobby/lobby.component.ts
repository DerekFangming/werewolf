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
import { Idiot } from '../model/idiot';
import { Knight } from '../model/knight';
import { Pervert } from '../model/pervert';
import { WerewolfQueen } from '../model/werewolfQueen';
import { WerewolfKing } from '../model/werewolfKing';
import { HiddenWerewolf } from '../model/hiddenWerewolf';
import { IntroDialogComponent } from '../intro-dialog/intro-dialog.component';
import { Thief } from '../model/thief';
import Utils from '../util';
import { Cupid } from '../model/cupid';

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
  heartbeatInterval

  env = environment

  @ViewChild('errModal', { static: true}) errModal: TemplateRef<any>
  @ViewChild('introModel') introModel: IntroDialogComponent
  @ViewChild('confirmModel') confirmModel: ConfirmDialogComponent
  @ViewChild('settingModal', { static: true}) inrtoModal: TemplateRef<any>

  constructor(public gameState: GameStateService, private modalService: NgbModal, private elementRef:ElementRef) { }

  ngOnInit() {
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(environment.socketAddress)
    let that = this

    this.ws.onopen = function (event) {
      that.ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}", "name" : "${that.gameState.getName()}", "avatar" : "${that.gameState.getAvatar()}"}`)

      // heartbeat
      if (that.heartbeatInterval != undefined) {
        clearInterval(that.heartbeatInterval)
      }
      that.heartbeatInterval = setInterval(function() {
        if (environment.production) that.ws.send(`{"op": "heartBeat"}`)
      }, 30000)
     
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
            that.gameState.setGame(cmd.gameId, cmd.hostId, cmd.turn, cmd.characters, cmd.players, cmd.actions, cmd.thiefOpt)
          } else {
            that.gameState.setState('lobby')
            that.error = cmd.error
            that.modalService.open(that.errModal, { centered: true })
          }
          break
        case 'takeSeat':
          that.gameState.takeSeat(cmd.playerId, cmd.position, cmd.name, cmd.avatar)
          break
        case 'endTurn':
          that.gameState.endTurn(cmd.turn, cmd.action, cmd.target)
          break
        default:
          console.log('unknown command: ' + data)
      }
    }

    this.ws.onclose = function (data) {
      setTimeout(function() {
        that.connect()
      }, 1000)
    }

    this.ws.onerror = function (data) {
      that.ws.close();
    }
  }

  createGame() {
    this.gameState.setState('createGame')
    this.players = [new Werewolf({selected: true}), new Werewolf({selected: true}), new Werewolf(), new Werewolf(),
      new WerewolfKing(), new WerewolfQueen(), new HiddenWerewolf(),
      new Villager({selected: true}), new Villager({selected: true}), new Villager(), new Villager(), new Villager(), new Pervert(),
      new Seer({selected: true}), new Witch({selected: true}), new Hunter(), new Guard(), new Idiot(), new Knight(),
      new Thief(), new Cupid()]
  }

  confirmCreateGame() {
    let selected = this.players.filter(p => p.selected).map(p => p.type)
    let hasThief = selected.includes('thief')
    if (hasThief && selected.length < 8) {
      this.error = '至少需要六人才能创建游戏。因为选择了盗贼，需要额外选择两张身份牌。'
      this.modalService.open(this.errModal, { centered: true })
    } else if (!hasThief && selected.length < 6) {
      this.error = '至少需要六人才能创建游戏。'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      console.log(JSON.stringify(selected))
      this.ws.send(`{"op": "createGame", "characters": ${JSON.stringify(selected)}}`)
    }
  }

  joinGame(){
    if (environment.production) {
      this.gameState.setState('joinGame')
    } else {
      this.gameState.setState('loading')
      this.ws.send(`{"op": "joinGame", "gameId": "1111"}`)
      this.gameIdInput = ''
    }
  }

  confirmJoinGame() {
    let gameId = this.gameIdInput.trim()
    if (gameId.length != 4) {
      this.error = '房间号应该为四位数字'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      this.ws.send(`{"op": "joinGame", "gameId": "${gameId}"}`)
      this.gameIdInput = ''
    }
  }

  selectSeat(seatInd: number) {
    if (this.gameState.turn == '') {
      if (!this.gameState.players[seatInd].isOcupied) {
        if (environment.production) {
          this.confirmModel.showDialog('入座', '确定在' + (seatInd+1) + '号入座？', {'op': 'takeSeat', 'position': seatInd+1})
        } else {
          this.ws.send(`{"op": "takeSeat", "position": ${seatInd+1}}`)
        }
      }
    } else if (this.isMyTurn()) {
      let character = this.gameState.getSelfCharacter()
      if (character.type == 'thief') return
      if (this.gameState.turn  == 'cupid') {
        let playerId = this.gameState.players[seatInd].id
        if (this.gameState.cupidSelection.includes(playerId)) {
          this.gameState.cupidSelection = this.gameState.cupidSelection.filter(i => i != playerId)
        } else {
          if (this.gameState.cupidSelection.length == 2) {
            this.confirmModel.showDialog('无法选择', '你只能选择两个玩家。请点击已经选中的玩家之一来取消选择，然后在选择其他玩家。', {}, true)
          } else {
            this.gameState.cupidSelection.push(playerId)
          }
        }
        return
      }
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

  // Currently thief only
  selectOption(selection: any) {
    let thief:any = Utils.parseCharactor('thief')
    this.confirmModel.showDialog(thief.actionTitle, thief.actionMessage.replace(/\{0\}/, selection.name),
          {'op': 'endTurn', 'action': thief.actionName, 'target': selection.type})
  }

  startGame() {
    if (this.gameState.players.filter(p => !p.isOcupied).length > 0) {
      this.error = '所有人选择座位之后才可以开始发牌'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      // Need this to break IOS mobile audio limitation.
      this.gameState.announce('soundUnlock.mp3')
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

      if (this.gameState.turn == 'werewolf' && this.gameState.getSelfCharacter().type == 'werewolfKing') {
        return true
      }
    }
    return false
  }

  isCupidSelection(id: string) {
    if (this.gameState.turn  == 'cupid' && this.gameState.getSelfCharacter().type == 'cupid') {
      return this.gameState.cupidSelection.includes(id)
    }
    return false
  }
  
  cupidConfirm() {
    if (this.gameState.cupidSelection.length != 2) {
      this.confirmModel.showDialog('无法确认', '请选择两名玩家成为情侣。', {}, true)
    } else {
      let first = this.gameState.playerPosition[this.gameState.cupidSelection[0]]
      let second = this.gameState.playerPosition[this.gameState.cupidSelection[1]]
      let choice = `${this.gameState.cupidSelection[0]},${this.gameState.cupidSelection[1]}`
      this.confirmModel.showDialog('确认选择', `确认选择 ${first} 号和 ${second} 号成为情侣？`,
        {'op': 'endTurn', 'action': 'cupidChoose', 'target': choice})
    }
  }

  nightStart() {
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
    } else if (character.type == 'hiddenWerewolf') {
      let werewolfs = ''
      for (let p in this.gameState.players) {
        console.log(this.gameState.players[p])
        if (this.gameState.players[p].character.isWolf) {
          if (werewolfs != '') werewolfs += '，'
          werewolfs += (parseInt(p) + 1) + '号' 
        }
      }
      return character.note.replace(/\{0\}/g, werewolfs)
    } else {
      return character.note
    }
  }

  viewResult(isHost: boolean) {
    let actionResult = ''
    if (this.gameState.getSelfCharacter().actionResult) {
      actionResult = this.gameState.getSelfCharacter().actionResult
    }

    if (isHost) {
      if (actionResult != '') actionResult = '\n' + actionResult
      if ('witchSave' in this.gameState.actions) {
        if ('guardProtect' in this.gameState.actions && this.gameState.actions['witchSave'] == this.gameState.actions['guardProtect']) {
          this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${this.gameState.playerPosition[this.gameState.actions['werewolfKill']]} 号${actionResult}`, {}, true)
        } else {
          this.confirmModel.showDialog('昨晚结果', `昨晚是平安夜${actionResult}`, {}, true)
        }
      } else if ('witchKill' in this.gameState.actions) {
        let witchKill = this.gameState.playerPosition[this.gameState.actions['witchKill']]
  
        if ('guardProtect' in this.gameState.actions && this.gameState.actions['werewolfKill'] == this.gameState.actions['guardProtect']) {
          this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${witchKill} 号${actionResult}`, {}, true)
        } else {
          let wolfKill = this.gameState.playerPosition[this.gameState.actions['werewolfKill']]
          this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${wolfKill} 号和 ${witchKill} 号${actionResult}`, {}, true)
        }
      } else {
        if ('guardProtect' in this.gameState.actions && this.gameState.actions['werewolfKill'] == this.gameState.actions['guardProtect']) {
          this.confirmModel.showDialog('昨晚结果', `昨晚是平安夜${actionResult}`, {}, true)
        } else {
          this.confirmModel.showDialog('昨晚结果', `昨晚死亡的玩家为 ${this.gameState.playerPosition[this.gameState.actions['werewolfKill']]} 号${actionResult}`, {}, true)
        }
      }
    } else {
      if (this.gameState.getSelfCharacter().type == 'werewolfQueen') {
        actionResult = actionResult.replace(/\{0\}/, this.gameState.playerPosition[this.gameState.actions['werewolfQueenLink']])
      }
      this.confirmModel.showDialog('昨晚结果', `${actionResult}`, {}, true)
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

  onSettingSave(data: any) {
    this.ws.send(`{"op": "updateSetting", "name": "${data.name}", "avatar": "${data.avatar}"}`)
  }

  debug() {
    // console.log(this.gameState.players)
    this.ws.send(`{"op": "restartGame"}`)
  }

}
