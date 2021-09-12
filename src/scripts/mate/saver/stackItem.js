class StackItem {
  constructor(data) {
    this.data = data;

    EasyEvents.call(this);

    this.addEvents(['delete','finish']);
  }

  delete() {
    this.fireDelete(this.data);
  }

  finish() {
    this.fireFinish(this.data);
  }

  get() {
    return this.data;
  }
}