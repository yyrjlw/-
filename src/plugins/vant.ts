import { App } from '@vue/runtime-core'
import {
  NavBar,
  Icon,
  List,
  Toast,
  Cell,
  CellGroup,
  Image,
  Lazyload,
  Divider ,
  Form,
  Field,
  Button,
  Picker,
  Popup,
  DatetimePicker,
  Col,
  Row,
  Uploader,
  Sidebar, 
  SidebarItem,
  Collapse, 
  CollapseItem,
  Dialog,
  Tag,
  Checkbox,
  CheckboxGroup,
  Grid,
  GridItem,
  Overlay ,
  Badge
} from 'vant'

export default {
  install (vue: App): void {
    vue.use(NavBar)
    vue.use(Icon)
    vue.use(List)
    vue.use(Toast)
    vue.use(Cell)
    vue.use(CellGroup)
    vue.use(Image)
    vue.use(Lazyload)
    vue.use(Divider)
    vue.use(Form)
    vue.use(Field)
    vue.use(Button)
    vue.use(Picker)
    vue.use(Popup)
    vue.use(DatetimePicker)
    vue.use(Col)
    vue.use(Row)
    vue.use(Uploader)
    vue.use(Sidebar)
    vue.use(SidebarItem)
    vue.use(Collapse)
    vue.use(CollapseItem)
    vue.use(Dialog)
    vue.use(Tag)
    vue.use(Checkbox)
    vue.use(CheckboxGroup)
    vue.use(Grid)
    vue.use(GridItem)
    vue.use(Overlay)
    vue.use(Badge)
  }
}
