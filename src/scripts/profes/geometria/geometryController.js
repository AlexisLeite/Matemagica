class GeometryController {
  constructor(jq) {
    EasyEvents.call(this);

    this.jq = jq.find('.Controles');

    this._prev = this.jq.find('input').eq(0);
    this._next = this.jq.find('input').eq(1);

    this._prev.hide();
    this._next.hide();

    // Configurando eventos
    this.addEvents(['Prev','Next']);

    let geoCon = this;
    this._next.click(() => {
      geoCon.fireNext();
    });
    this._prev.click(() => {
      geoCon.firePrev();
    });
  }

  $(query) {
    return this.jq.find(query);
  }

  show() {
    this._prev.show();
    this._next.show();
  }
}