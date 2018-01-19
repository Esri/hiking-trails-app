
import DetailPanel from './DetailPanel';
import SelectionPanel from './SelectionPanel';
import { State } from '../types';

import '../../style/menu-panel.scss';

export default class MenuPanel {
  constructor(trails, state: State) {
    let selectionPanel = new SelectionPanel(trails, state);
    let detailPanel = new DetailPanel(trails, state);
  }
}