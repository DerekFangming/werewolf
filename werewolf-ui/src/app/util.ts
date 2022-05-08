import { Guard } from "./model/guard"
import { Hunter } from "./model/hunter"
import { Idiot } from "./model/idiot"
import { Knight } from "./model/knight"
import { Pervert } from "./model/pervert"
import { Seer } from "./model/seer"
import { Villager } from "./model/villager"
import { Werewolf } from "./model/werewolf"
import { WerewolfQueen } from "./model/werewolfQueen"
import { Witch } from "./model/witch"

export default class Utils {

  static parseCharactor(type: string) {
    switch (type) {
      case 'werewolf':
        return new Werewolf()
      case 'werewolfQueen':
        return new WerewolfQueen()
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
      default:
        return null
    }
  }
}