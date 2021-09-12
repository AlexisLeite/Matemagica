require "ext/math";
require "profes/geometria/geometryController";
require "profes/geometria/geometryLogger";
require "profes/geometria/geometryTasks";
require "profes/geometria/percenter";
require "profes/geometria/poligonsHandler";

class GeometryAnswersController {
  constructor(params) {
    Object.assign(this, {
      cantidad: 1,
      jq: $('body'),
      classCorrect: 'Correcto',
      classIncorrect: 'Incorrecto'
    }, params);

    this.jq = this.jq.find('.Respuestas');
    this.draw();
  }

  draw() {
    for(let i=0; i<this.cantidad; i++) {
      $('<div />').appendTo(this.jq);
    }
  }

  correct(i) {
    this.jq.find('div').eq(i).removeClass(this.classIncorrect);
    this.jq.find('div').eq(i).addClass(this.classCorrect);
  }

  incorrect(i) {
    this.jq.find('div').eq(i).addClass(this.classIncorrect);
  }
}

class Geometria extends Profesor {
  static info = {
    nombre: "Geometría",
    breve: "Sigue las instrucciones y al final, se te pedirá que midas una distancia específica en tu dibujo:",
  }

  static required = {
    ammount: { title: 'Cantidad de polígonos', type: 'number', default: 3, max: 10, min: 2 },
    minWidth: { title: 'Longitud mínima', type: 'number', default: 3, max: 5, min: 2 },
    maxWidth: { title: 'Longitud máxima', type: 'number', default: 10, max: 15, min: 5 },
    distancesStages: { title: 'Preguntas', type: 'number', default: 2, max: 4, min: 1 },
  }

  init() {
    $@Templates "geometria";

    this.jq.addClass('Geometria');
    this.template = this.templates.geometria();
    this.addPreloader(this.makeData);
    this.template.jq.appendTo(this.jq);
  }

  buildView() {
    let jq = this.template.jq;
    let controller = new GeometryController(this.jq);
    
    function resolveTask(args) {
      let ret = [];
      for(let i=0; i<args.length; i++) {
        if('kind' in args[i]) {
          ret.push(`Dibuje un ${traduccion[args[i].kind]} de ${args[i].width}cm de lado, como se muestra en la figura.`);
        } else {
          ret.push(`Mide con una regla la distancia entre los puntos marcados en el plano e introdúcela en el cuadro de texto.`);
        }
      }
      return ret;
    }

    // Creando un nuevo PoligonsHandler
    let data = JSON.parse(this.data,math.reviver);
    Object.assign(data, {
      width: parseInt(jq.css('width')) - 10,
      height: window.innerHeight,
      container: jq.find('.GeometryCanvas')[0],
      distancesStages: this.conf.distancesStages
    });
    let poligonsHandler = new PoligonsHandler(data, true);

    $(window).resize(() => {
      poligonsHandler.resize(parseInt(jq.css('width')) - 10, window.innerHeight);
    });

    // Creando lista de respuestas
    let answerController = new GeometryAnswersController({
      jq, cantidad: poligonsHandler.distances.length
    });

    // Creando lista de tareas
    let traduccion = {
      RectTriangle: 'triángulo rectángulo',
      Square: 'cuadrado'
    }

    let geometryTasks = new GeometryTasks({
      tasks: [...resolveTask(poligonsHandler.poligonos), ...resolveTask(poligonsHandler.distances)],
      taskMaker: this.template.Task,
      jq: jq.find('.Tareas')
    });

    // Configurando interfaz de usuario
    controller.show();
    controller.onNext(() => {
      poligonsHandler.next();
    });
    controller.onPrev(() => {
      poligonsHandler.prev();
    });

    let jqPreguntas = jq.find('.Preguntas');
    poligonsHandler.onChangeStage(ev => {
      geometryTasks.set(ev.stage+ev.distance);

      let preguntas = jqPreguntas.find('input').hide();
      if(ev.distance) {
        preguntas.eq(ev.distance-1).show().focus();
      }
    });

    // Creando cuadros de texto
    for(let i=0; i<poligonsHandler.distances.length; i++) {
      let distance = poligonsHandler.distances[i];
      let text = this.template.Pregunta();
      text.appendTo(jqPreguntas);
      this.push(new Answer(
        text,
        function(val) {
          let answer = round(distance.distance,1);
          let margen = 0.2;
          
          let correcto = answer-margen <= val && answer+margen >= val;
          if(correcto) {
            text.removeClass('Pregunta');
            geometryTasks.done(poligonsHandler.poligonos.length+i);
            answerController.correct(i);
          }
          else
            answerController.incorrect(i);

          // clog(answer,val);

          return correcto;
        }
      ));
    }
  }

  makeData(resolve) {
    // Detalles de plantilla
    let logger = new GeometryLogger(this.template.jq, this.template.Log);

    this.conf.maxWidth++; // Ya que la funcion rand no incluye el máximo

    // Configurando el worker
    let worker = new Worker('./src/scripts/profes/geometria/worker.js');
    worker.addEventListener('message', ev => {
      switch(ev.data.action) {
        case 'done':
          logger.remove();
          this.set(ev.data.json);
          resolve();
          break;
        case 'log':
          logger.log(ev.data.text);
          break;
        case 'Clog':
          console.log(...ev.data.args);
          break;
        case 'percent':
          logger.percent(ev.data.percent);
          break;
      }
    })
    worker.postMessage({action:'make',...this.conf});
  }
}