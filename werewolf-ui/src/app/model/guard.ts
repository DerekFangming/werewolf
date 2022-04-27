import { Character } from "./character";

export class Guard extends Character {
  type = 'guard'
  name = '守卫'

  public constructor(init?:Partial<Guard>) {
    super()
    Object.assign(this, init);
  }
}