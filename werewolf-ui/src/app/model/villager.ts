import { Character } from "./character";

export class Villager extends Character {
  type = 'villager'
  name = '村民'

  public constructor(init?:Partial<Villager>) {
    super()
    Object.assign(this, init);
  }
}