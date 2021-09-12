class Reloj {
  ready(cb) {
    this.callback = cb;
  }

  set(time, minutos = null) {
    if(minutos) // Es porque se utiliza set (hora,minutos)
      time = time*60+minutos;

    time = time%(12*60);

    // Se establece la hora
    let rotacionHoras = Math.floor((time / 60) * (360 / 12));

    let rotacionMinutos = Math.floor((time % 60) * (360 / 60));

    this.time = time;
    this.hora = Math.floor(time / 60) % 12;
    this.minutos = (time % 60);

    this.figuraMinutos.rotation(rotacionMinutos - 90);
    this.figuraHoras.rotation(rotacionHoras - 90);
    this.clock.batchDraw();
  }

  scale(scale) {
    this.stage.scaleX(scale);
    this.stage.scaleY(scale);
    this.stage.width(parseInt(this._width * scale))
    this.stage.height(parseInt(this._height * scale))
    this.stage.batchDraw();
  }

  width(width) {
    this.scale(width / 600);
  }

  constructor(area, width,  time, cb=null) {
    this.callback = cb;
    this._width = 600;
    this._height = 600;

    // Time should be between 0 and 24*60
    // area must be an instance of jQuery or a valid selector or DOM element

    this.stage = new Konva.Stage({
      container: area,
      width: 600,
      height: 600
    });

    var clock = new Konva.Layer({
      x: 300,
      y: 300
    });
    this.stage.add(clock);
    this.clock = clock;

    let reloj = this;

    Konva.Image.fromURL('./clock.png', function (nodo) {
      nodo.setAttrs({
        x: -300,
        y: -300,
        scaleX: 1,
        scaleY: 1,
      });
      clock.add(nodo);
      nodo.zIndex(0);
      clock.batchDraw();
    });

    let loadHora = false, loadMinutos = false;

    function finCarga() {
      reloj.set(time);
      reloj.scale(width / 600);

      if(reloj.callback)
        reloj.callback(reloj);
    }

    Konva.Image.fromURL('./hora.png', function (nodo) {
      reloj.figuraHoras = nodo;
      nodo.setAttrs({
        offsetX: 28,
        offsetY: 43,
        scaleX: 0.75,
        scaleY: 0.75
      });
      clock.add(nodo);
      nodo.moveToTop();
      clock.batchDraw();

      if(loadMinutos) finCarga();
      else loadHora = true;
    });

    Konva.Image.fromURL('./minutos.png', function (nodo) {
      reloj.figuraMinutos = nodo;
      nodo.setAttrs({
        offsetX: 30,
        offsetY: 30,
        scaleX: 0.75,
        scaleY: 0.75
      });
      clock.add(nodo);
      nodo.moveToTop();
      clock.batchDraw();

      if(loadHora) finCarga();
      else loadMinutos = true;
    });
  }
}