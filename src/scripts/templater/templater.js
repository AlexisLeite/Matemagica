var templater = new function() {
  var Debug = false;

  this.parse = function(text, data=[]) {
    while(res = text.match(/\{([a-zA-Z]+)\}/)) {
      let replace = res[1] in data ? data[res[1]] : '';
      text = text.replace(res[0],replace);
    }
    return text;
  }

  this.set = function(name, content) {
    let templates = {};
      
    let plantilla = $(`<div>${content}</div>`);
    plantilla.find('.Template').each((i, el) => {
      el = $(el);
      let id = el.attr('id') ?? 'noId';
      el.detach().removeClass('Template').removeAttr('id').addClass(id);
      templates[id] = function(data) {
        let html = el[0].outerHTML;
        return $(templater.parse(html,data));
      }
    });

      
    let objectReturn = function(data = {}) {
      let plantillaProcesada = $(templater.parse(plantilla.html(), data));
      let objectReturn = {
        jq: plantillaProcesada,
        find: function(...args) {
          return plantillaProcesada.find(...args);
        }
      }
      Object.assign(objectReturn, templates);
      return objectReturn;
    };
    plantillasGuardadas[name] = objectReturn;

    return objectReturn;
  }

  let plantillasGuardadas = {};
  var trabajando = false;

  this.getSync = (template) => {
    let collectionReturn = {};
    let plantillas = template.split(',');

    for(let i=plantillas.length-1; i>=0; i--) {
      let plantilla = plantillas[i];
      if(plantilla in plantillasGuardadas) {
        plantillas.splice(i,1);
        collectionReturn[plantilla] = plantillasGuardadas[plantilla];
      }
    }
    return collectionReturn;
  }

  // La función get devolverá las templates requeridas, pero solamente deberá trabajar una vez que todas las
  // llamadas anteriores hayan terminado
  this.get = (template) => {
    if(Debug) clog(' ')
    if(Debug) clog('%cTEMPLATER','color:green; font-size:12pt')
    if(Debug) clog('templater.get',{template});

    function conseguirTemplate() {
      trabajando = true;
      if(typeof(template) != typeof('asdf')) return false;
  
      template = template.replaceAll(' ','');
      
      let collectionReturn = {};
      let plantillas = template.split(',');
      if(Debug) clog('conseguirTemplate',{plantillas});
  
      for(let i=plantillas.length-1; i>=0; i--) {
        let plantilla = plantillas[i];
        if(Debug) clog('comprobando plantillas guardadas',{existe:plantilla in plantillasGuardadas,plantillasGuardadas: Object.keys(plantillasGuardadas),plantilla});
        if(plantilla in plantillasGuardadas) {
          plantillas.splice(i,1);
          collectionReturn[plantilla] = plantillasGuardadas[plantilla];
        }
      }

      if(Debug) clog('plantillas return',{collectionReturn,plantillas});
      if(plantillas.length != 0) 
        $.get('src/scripts/templater/templater.php',{plantillas}, ret => {
          let plantillas = JSON.parse(ret);
          if(Debug) clog('get finalizado',{plantillas,keys:Object.keys(plantillas)});

          for(let p in plantillas) {
            templater.set(p,plantillas[p]);
            collectionReturn[p] = plantillasGuardadas[p];
          }
          }).fail(() => {
          if(errorCallback)
            errorCallback();
        }).always(()=> {
          trabajando = false;
          if(doneCallback) {
            if(Debug) clog(doneCallback);
            doneCallback(collectionReturn);
          } else
            if(Debug) clog('no hay done');
        });
      else
        setTimeout(()=> {
          trabajando = false;
          if(doneCallback)
            doneCallback(collectionReturn);
        }, 200);
  
    }

    function intentarConseguirTemplate() {
      if(Debug) clog('intentarConseguirTemplate',{trabajando:trabajando});
      if(trabajando) {
        if(Debug) clog('no conseguido',{trabajando:trabajando});
        setTimeout(() => {
          intentarConseguirTemplate();
        },200);
      } else {
        trabajando = true;
        if(Debug) clog('conseguido',{trabajando:trabajando});
        conseguirTemplate();
      }

      return new function() {
        this.then = (callback) => {
          if(Debug) clog('done establecido');
          doneCallback = callback;
          return this;
        }
        this.error = (callback) => {
          errorCallback = callback;
          return this;
        }
      }
    }

    let doneCallback, errorCallback;
    return intentarConseguirTemplate();
  }
}