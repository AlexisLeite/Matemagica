require "profes/razonamientos/main";
require "mate/dialog";

function CrearRazonamientos() {
  let template, currentId=0;

  Debugable.call(this);

  $('#AreaTrabajo').attr('id','Admin');

  templater.get('crearRazonamiento').then(res => {

    // Función que genera pruebas con valores aleatorios a partir del razonamiento que se esté probando
    function generarPrueba() {
      crearRazonamientos.clearConsole(1);
      razonamientos.clearConsole(1);

      template.find('.Hide').removeClass('Hide');
      template.find("#CuerpoPrueba").empty();
      razonamientos.generar(template.find('#CuerpoPrueba'), {}, currentId).then(res => {
        for(let respuesta of res) {
          crearRazonamientos.dbg(1,{answer:respuesta.answer, text:respuesta.text[0]});
          respuesta.text.focusout(() => {
            if(val(respuesta.text) == respuesta.answer) {
              respuesta.text.addClass('Correcto');
              respuesta.text.removeClass('Incorrecto');
              respuesta.text.off('focusout');
            } else if(respuesta.text.val() != '')
              respuesta.text.addClass('Incorrecto');
            else
              respuesta.text.removeClass('Incorrecto');
          })
        }
      });
      $.get('/razonamientos/get.php', {id:currentId}, res => {
        razonamiento = JSON.parse(res);
        $('[name="Titulo"]').val(razonamiento.titulo);
        $('[name="Letra"]').val(razonamiento.letra);
        preguntas.clear(false);
        for(let i in razonamiento.preguntas) {
          let pregunta = razonamiento.preguntas[i];
          let respuesta = razonamiento.respuestas[i];
          
          preguntas.add(pregunta,respuesta);
        }
          preguntas.add();
      });
    }

    // Crea un listado de los razonamientos existentes
    function listarRazonamientos() {
      $.get('/razonamientos/listar.php',titulos => {
        template.find('#ListadoRazonamientosExistentes').empty();
        titulos = JSON.parse(titulos);
        for(let titulo of titulos) {
          let item = template.ItemListado(titulo).appendTo(template.find('#ListadoRazonamientosExistentes'));
          item.find('.GenerarRazonamiento').click(() => {
            currentId = titulo.id;
            generarPrueba();
          })
          item.find('.EliminarRazonamiento').click(() => {
            $.get('/razonamientos/eliminar.php',{id:titulo.id},res=> {
              item.remove();
            });
          })
        }
      })
    }

    // Se procesa la plantilla y se establece el comportamiento del botón de generar pruebas
    template = res.crearRazonamiento();
    
    var preguntas = new function PreguntasManager() {
      Debugable.call(this);
  
      let maxPreg=0;
      let jq = template.find('#Preguntas');

      this.addPre = function() {
        this.add().prependTo(jq);
      }
  
      this.add = function(preguntaText='', respuestaText='') {
        let combo = template.Pregunta({NroPregunta: `Pregunta ${maxPreg}`}).appendTo(jq);
        let pregunta = combo.find('input').eq(0);
        let respuesta = combo.find('input').eq(1);
        let subir = combo.find('.Subir');
        let bajar = combo.find('.Bajar');
        let eliminar = combo.find('.Eliminar');

        combo.id = maxPreg++;

        eliminar.click(() => {
          if(jq.find('input[type="text"]').length <= 2) return;
          
          combo.remove();
          crearNuevaPreguntaPorFocusIn();
        });

        subir.click(() => {
          let prev = combo.prev('.Pregunta');
          if(prev.length)
            combo.detach().insertBefore(prev.eq(0));

          crearNuevaPreguntaPorFocusIn();
        });

        bajar.click(() => {
          let next = combo.next('.Pregunta');
          if(next.length)
            combo.detach().insertAfter(next.eq(0));

          crearNuevaPreguntaPorFocusIn();
        });

        let preguntasThis = this;

        function crearNuevaPreguntaPorFocusIn() {
          let preguntas = jq.find('input[type="text"]');

          preguntas.off('focusin');

          preguntas.last().focusin((ev) => {
            preguntasThis.add();
          });
        }
  
        respuesta.val(respuestaText);
        pregunta.val(preguntaText);
  
        crearNuevaPreguntaPorFocusIn();

        return combo;
      }
  
      this.clear = function(nuevaPregunta = true) {
        maxPreg = 0;
        jq.empty();
        if(nuevaPregunta)
          this.add();
      }
    }

    template.jq.appendTo('#Admin');
    template.find('.GenerarRazonamiento').click(() => {
      generarPrueba();
    });
    template.find('#NuevaPreparatoria').click(() => {
      preguntas.addPre();
    })

    // Se crea un listado de los razonamientos
    listarRazonamientos();

    template.find('[type="reset"]').click(ev => {
      preguntas.clear();
      template.find('form input[type="text"], form textarea').val('').first().focus();
      return false;
    })

    template.find('form').submit(ev => {
      ev.preventDefault();
      $.get(`/razonamientos/crear.php?${template.find('form').serialize()}`,res => {
        currentId = res;
        generarPrueba();
        listarRazonamientos();
      })
    })
    preguntas.add();
  })
};
var crearRazonamientos;

$(document).ready(()=> {
  new ConfDialog({password: { title: 'Contraseña', type: 'text' }}, res => {
    $.get('/razonamientos/confirmPassword.php',{password: res.password}, res => {
      if(parseInt(res) == 1)
        crearRazonamientos = new CrearRazonamientos();
    });
  });
})