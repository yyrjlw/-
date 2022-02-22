import { SQLiteObject } from '@ionic-enterprise/secure-storage'
import { reactive } from 'vue'

const observers: IObserver[] = []
interface IObserver {
  stateName: keyof State,
  update: Function
}
class State{
  initialized = false
}
export default {
  state: reactive({
    ...new State(),
    appDB:null as SQLiteObject | null
  }),
  addObserver(observer:IObserver) {
    observers.push(observer)
  },
  setInitialized(newValue: boolean) {
    this.state.initialized = newValue
    for (const item of observers) {
      if (item.stateName==='initialized') {
        item.update()
      }
    }
  },
  setAppDB(newValue: SQLiteObject) {
    this.state.appDB=newValue;
  }
}
