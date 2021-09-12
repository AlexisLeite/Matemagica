require "mate/saver/main";
require "mate/sesion/main";
require 'mate/profesores';

// Está desarrollado el templater para que consiga todas las templates necesarias en forma asíncrona
/* El mate está pensado para recibir un objeto de parte de los profesores al llamar a la función generar
que tenga la función then() para permitirles realizar tareas asíncronas a los profesores también.
*/

class Mate {
  constructor() {
    $@Templates "listadoProfesores,subAreaTrabajo";

    Debugable.call(this);

    this.profes = {Cuentas, Geometria, Hora, Razonamientos, Tablas};
    this.areasTrabajo = [];
    this.saver = new Saver();

    
    this.listadoProfesores = this.templates.listadoProfesores();
    this.listadoProfesores.jq.prependTo('body');

    this.init();
    this.load();
  }

  init() {
    for(let profe of Object.values(this.profes)) {
      this.listadoProfesores.DetallesProfesor({nombre: profe.info.nombre})
        .appendTo(this.listadoProfesores.find("#ListadoProfesores"))
        .css({
          borderColor: getRandomColor()})
        .click(() => {
            new ConfDialog(profe.required, conf => {
              this.new(profe,conf);
          });
        });
    }
  }

  load() {
    for(let save of this.saver.all()) {
      this.new(this.profes[save.get().kind],{},save);
    }
  }

  new(kind, conf={}, revive=false) {
    let nuevoArea = this.templates.subAreaTrabajo({nombre:kind.info.nombre, breve:kind.info.breve}).jq.appendTo('#AreaTrabajo');
    this.areasTrabajo.push(nuevoArea);
    this.clearConsole(1);
    $('#ListadoProfesores').addClass('min');

    let jq = nuevoArea.find('div');
    let newProfe = revive ? kind.fromRevive(jq, revive.get().revive) : new kind(jq, conf);

    newProfe.go().then(res => {
      let answers = res.answers;
      if(!revive) {
        res.kind = kind.name;
        delete res.answers;
        revive = this.saver.add(res);
      }
      
      nuevoArea.find('.Cerrar').click(() => {
        nuevoArea.remove();
        revive.delete();
      })

      for(let respuesta of answers){
        this.dbg(1,{text:respuesta.text,answer:respuesta.answer});
        respuesta.text.focusout(()=> {
          let respuestaVal = parseFloat(respuesta.text.val()), correcto;
          
          if(typeof respuesta.answer == 'function') {
            correcto = respuesta.answer(respuestaVal);
          } else {
            correcto = respuestaVal == respuesta.answer;
          }

          if(correcto){
            respuesta.text.addClass('Correcto');
            respuesta.text.removeClass('Incorrecto');
            respuesta.text.off('focusout');

            if(respuesta.text.closest('.SubAreaTrabajo').find('input:not(.Correcto)').length == 0) {
              revive.finish();
            }
          }
          else if(!isNaN(respuestaVal)) {
            respuesta.text.addClass('Incorrecto');
          } else
            respuesta.text.removeClass('Incorrecto');
        })
      }
    });
  }
}

$(document).ready(() => {
  new Mate();
})