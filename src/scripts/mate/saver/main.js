require 'mate/saver/stackItem';

class Stack {
  constructor(name) {
    this.nextKey = 0;

    this.savesName = name;
    
    this.stack = {};

    EasyEvents.call(this);

    this.addEvents(['delete','finish']);
    this.load();
  }

  add(data,save=true) {
    let handler = this, nextKey = this.generateNextKey();

    let no = new StackItem(data);

    no.onDelete(data => {
      handler.fireDelete(data);
      delete handler.stack[nextKey];
      handler.set();
    });
    no.onFinish(data => {
      handler.fireFinish(data);
      delete handler.stack[nextKey];
      handler.set();
    });

    this.stack[nextKey] = no;

    if(save) this.set();

    return no;
  }

  all() {
    return Object.values(this.stack);
  }

  generateNextKey () {    
    return this.nextKey++;
  }

  load() {
    let saveData = localStorage.getItem(this.savesName);
    saveData = saveData ? JSON.parse(saveData) : [];

    for(let save of saveData) {
      this.add(save, false);
    }
  }

  set() {
    let all = this.all().map(el => { return el.get() });
    localStorage.setItem(this.savesName,JSON.stringify(all));
  }
}

class Saver {
  constructor() {
    this.current = new Stack('MateSaves');
    this.finished = new Stack('MateFinished');
    this.closed = new Stack('MateClosed');

    this.current.onDelete(data => {
      this.closed.add(data);
    });

    this.current.onFinish(data => {
      this.finished.add(data);
    });
  }

  add(data,save=true) {
    let item = this.current.add(data,save);
    return item;
  }

  all() {
    return this.current.all();
  }
}