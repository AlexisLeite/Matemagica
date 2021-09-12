require "profes/hora/reloj";

class Hora extends Profesor {
  static info = {
    nombre: 'Hora',
    breve: 'Lee la pregunta y responde:'
  }

  static required = {
    queHora: { title: 'Cantidad de "qué hora es"', type: 'number', default: 5, max: 20, min: 0 },
    cuantoTiempo: { title: 'Cantidad de "cuánto tiempo pasó"', type: 'number', default: 10, max: 20, min: 0 }
  }

  init() {
    $@Templates "hora/queHoraEs,hora/cuantoTiempo";

    this.makeData();
    this.addPreloader(this.makeClocks, true);
  }

  buildView() {      
    let t = this.templates.queHoraEs();

    for (let reloj of this.relojes.queHora) {
      let el = $(t.QueHoraEs());
      el.appendTo(t.find('.RelojesEjercicio'));
      el.find('.Reloj').append(reloj.stage.content);
      this.dbg(1, { time: reloj.time, horas: reloj.hora, minutos: reloj.minutos });
      this.push({ text: el.find('input').eq(0), answer: reloj.hora });
      this.push({ text: el.find('input').eq(1), answer: reloj.minutos });
    }

    t.jq.appendTo(this.jq);

    t = this.templates.cuantoTiempo();

    for (let relojes of this.relojes.cuantoTiempo) {
      let ejercicio = rand(0, 3);
      let el = $(t[`CuantoTiempo${ejercicio}`]());

      let r0 = relojes[0], r1 = relojes[1];
      let difTime = r0.time > r1.time
        ? r1.time + 60 * 12 - r0.time
        : r1.time - r0.time;

      let horas = Math.floor(difTime / 60);
      let minutos = difTime % 60;
      let segundos = difTime * 60;

      this.dbg(1, { relojes, el, difTime });

      // Se crean elementos DOM
      el.appendTo(t.find('.RelojesEjercicio'));
      el.find('.Reloj1').append(r0.stage.content);
      el.find('.Reloj2').append(r1.stage.content);

      // Se procesan respuestas
      switch (ejercicio) {
        case 0:
          // Se muestran campos de hora y minutos
          this.push({ text: el.find('input').eq(0), answer: horas });
          this.push({ text: el.find('input').eq(1), answer: minutos });
          break;
        case 1:
          // Se muestra campo de minutos solamente
          this.push({ text: el.find('input').eq(0), answer: difTime });
          break;
        case 2:
          // Se muestra campo de segundos solamente
          this.push({ text: el.find('input').eq(0), answer: segundos });
          break;
      }
    }

    t.jq.appendTo(this.jq); 
  }

  /* Método encargado de generar las instancias de reloj necesarias, este método es asíncrono */
  getClock(hour) {
    return new Promise(resolve => {
    });
  }

  makeClocks(resolve) {
    this.relojes = { queHora: [], cuantoTiempo: []};
    let handler = this, promises = [];

    for (let key in this.data.queHora) {
      let hour = this.data.queHora[key];
      promises.push(new Promise(innerResolve => {
        new Reloj($('<div>')[0],180,hour,reloj => {
          handler.relojes.queHora[key] =reloj;
          innerResolve();
        });
      }));
    }

    for (let key in this.data.cuantoTiempo) {
      let hour = this.data.cuantoTiempo[key];
      promises.push(new Promise(innerResolve => {
        new Reloj($('<div>')[0],180,hour[0],reloj1 => {
          new Reloj($('<div>')[0],180,hour[1],reloj2 => {
            handler.relojes.cuantoTiempo[key] = [reloj1,reloj2];
            innerResolve();
          });
        });
      }));
    }

    Promise.all(promises).then(() => {
      resolve();
    });
  }

  /* Métodos encargados de generar los datos necesarios */
  getRandHour() {
    let hora = rand(0, 24);
    let minutos = rand(0, 60);
    minutos -= minutos % 5;

    return hora * 60 + minutos;
  }

  makeData() {
    let data = {queHora:[], cuantoTiempo:[]};

    for (let i = 0; i < this.conf.queHora; i++) {
      data.queHora.push(this.getRandHour());
    }
    for (let i = 0; i < this.conf.cuantoTiempo; i++) {
      data.cuantoTiempo.push([this.getRandHour(),this.getRandHour()]);
    }

    this.set(data);
  }
}