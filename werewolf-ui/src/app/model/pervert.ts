import { Character } from "./character"

export class Pervert extends Character {
  override type = 'pervert'
  category = 'human'
  name = '老流氓'

  public constructor(init?:Partial<Pervert>) {
    super()
    Object.assign(this, init)
  }
}