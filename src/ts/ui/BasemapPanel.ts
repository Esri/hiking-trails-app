import * as dom from 'dojo/dom';
import { State } from '../types';

export default class BasemapPanel {

  container: any;

  constructor(state: State) {
    this.container = dom.byId('basemapPanel');
  }
}
