import { Guard } from "./model/guard"
import { Hunter } from "./model/hunter"
import { Seer } from "./model/seer"
import { Villager } from "./model/villager"
import { Werewolf } from "./model/werewolf"
import { Witch } from "./model/witch"

export default class Utils {

  static parseCharactor(type: string) {
    switch (type) {
      case 'werewolf':
        return new Werewolf()
      case 'villager':
        return new Villager()
      case 'seer':
        return new Seer()
      case 'witch':
        return new Witch()
      case 'hunter':
        return new Hunter()
      case 'guard':
        return new Guard()
      default:
        return null
    }
  }

  static doSomethingElse(val: string) { return val; }
}