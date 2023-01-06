import { Bear } from "./model/bear"
import { Cupid } from "./model/cupid"
import { Fox } from "./model/fox"
import { Guard } from "./model/guard"
import { HiddenWerewolf } from "./model/hiddenWerewolf"
import { Hunter } from "./model/hunter"
import { Idiot } from "./model/idiot"
import { Knight } from "./model/knight"
import { Pervert } from "./model/pervert"
import { Seer } from "./model/seer"
import { Thief } from "./model/thief"
import { Villager } from "./model/villager"
import { Werewolf } from "./model/werewolf"
import { WerewolfKing } from "./model/werewolfKing"
import { WerewolfQueen } from "./model/werewolfQueen"
import { Witch } from "./model/witch"

export default class Utils {

  static parseCharactor(type: string) {
    switch (type) {
      case 'werewolf':
        return new Werewolf()
      case 'werewolfKing':
        return new WerewolfKing()
      case 'werewolfQueen':
        return new WerewolfQueen()
      case 'hiddenWerewolf':
        return new HiddenWerewolf()
      case 'villager':
        return new Villager()
      case 'pervert':
        return new Pervert()
      case 'seer':
        return new Seer()
      case 'witch':
        return new Witch()
      case 'hunter':
        return new Hunter()
      case 'guard':
        return new Guard()
      case 'idiot':
        return new Idiot()
      case 'knight':
        return new Knight()
      case 'thief':
        return new Thief()
      case 'cupid':
        return new Cupid()
      case 'bear':
        return new Bear()
      case 'fox':
        return new Fox()
      default:
        return null
    }
  }
}