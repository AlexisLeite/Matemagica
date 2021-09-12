require 'mate/profesor';

class Razonamientos extends Profesor {
  static info = {
    nombre: "Razonamientos",
    breve: "Lee la letra del ejercicio y responde las preguntas que se te plantean al final."
  }

  static required = {
    cifrasMaximo: { title: 'Cifras del valor máximo', type: 'number', default: 7, max: 8, min: 1},
    cifrasSuma: { title: 'Cifras de suma', type: 'number', default: 5, max: 6, min: 1 },
    cifrasResta: { title: 'Cifras de resta', type: 'number', default: 4, max: 6, min: 1 },
    cifrasDivision: { title: 'Cifras de división', type: 'number', default: 1, max: 6, min: 1 },
    cifrasMultiplicacion: { title: 'Cifras de multiplicación', type: 'number', default: 3, max: 6, min: 1 },
    restaNegativo: {title: '¿Resta negativo?', type: 'check', default: false }
  }

  init() {
    $@Templates "razonamiento";
    
    this.addPreloader(this.preloadExercise);
  }

  preloadExercise(resolve) {
    let handler = this;
    $.get('./razonamientos/get.php', res => {
      (() => {
        this.razonamiento = JSON.parse(res);
      
        this.conf.tope = 10 ** this.conf.cifrasMaximo;
        if(!('maximo' in this.conf)) {
          this.conf.maximo = {
            suma: 10 ** (this.conf.cifrasSuma),
            resta: 10 ** (this.conf.cifrasResta),
            multiplicacion: 10 ** (this.conf.cifrasMultiplicacion),
            division: 10 ** (this.conf.cifrasDivision)
          }
        }
    
        let conf = this.conf;
        let razonamiento = this.razonamiento;
    
        // Aquí se debería declarar toda la información necesaria para realizar un revive correcto
        let variables = {
          Titulo: razonamiento.titulo, 
          Letra: razonamiento.letra, 
          stackRespuestas: razonamiento.respuestas, 
          stackPreguntas: razonamiento.preguntas
        };
    
        // Resolver todas las respuestas
        for(let r in razonamiento.respuestas) {
          let res = razonamientos.resolverCuenta(razonamiento.respuestas[r],0,conf.tope,variables,conf);
          razonamiento.respuestas[r] = res.total;
          Object.assign(variables,res.variables);
        }
    
        // Por motivos estratégicos es mejor plantear las últimas preguntas primero, por lo que
        // antes de mostrarlas deben invertirse
        razonamiento.preguntas = razonamiento.preguntas.reverse();
        razonamiento.respuestas = razonamiento.respuestas.reverse();
    
        // Ocultar las respuestas que solo son para preparar el razonamiento y no para plantear al usuario
        for(let i=razonamiento.preguntas.length-1; i>=0; i--) {
          if(razonamiento.preguntas[i] == '') {
            razonamiento.preguntas.splice(i,1);
            razonamiento.respuestas.splice(i,1);
          }
        }
    
        // Enviar los resultados a mate
        variables.id = razonamiento.id;
        this.set(variables);
      }).call(handler);

      resolve();
    });
  }

  buildView() {
    let plantilla = this.templates;

    let variables = this.data;
    let jqGenerado = plantilla.razonamiento(variables);
    this.append(jqGenerado.jq);

    // Crear las preguntas y agregarlas al documento
    for(let r in this.data.stackPreguntas) {
      let preguntaJq = jqGenerado.Pregunta(Object.assign({Pregunta: this.data.stackPreguntas[r]},variables));
      this.push({text: preguntaJq.find('input'), answer: this.data.stackRespuestas[r]});
      preguntaJq.appendTo(jqGenerado.find('.Preguntas'));
    }
  }
}

var razonamientos = new function Razonamientos() {
  Debugable.call(this);

  var proximaVariable = 'X';
  let confDefault = {
    cifrasSuma: 5,
    cifrasResta: 5,
    cifrasMaximo: 7,
    cifrasMultiplicacion: 3,
    cifrasDivision: 1,
    restaNegativo: false,
    divideReales: false,
    tope: 6
  } 

  // Método que se deja por compatibilidad con sistema anterior
  this.generar = (jq, conf, id) => {
    Object.assign(confDefault,conf);
    conf = confDefault;

    let doneCallback, razonamiento, plantilla;

    conf.tope = 10 ** conf.cifrasMaximo;
    if(!('maximo' in conf)) {
      conf.maximo = {
        suma: 10 ** (conf.cifrasSuma),
        resta: 10 ** (conf.cifrasResta),
        multiplicacion: 10 ** (conf.cifrasMultiplicacion),
        division: 10 ** (conf.cifrasDivision)
      }
    }

    function procesarRazonamiento() {
      let variables = {Titulo: razonamiento.titulo, Letra: razonamiento.letra}, coleccionReturn=[],
        respuestasReverso =[];

      // Resolver todas las respuestas
      for(let r in razonamiento.respuestas) {
        let res = razonamientos.resolverCuenta(razonamiento.respuestas[r],0,conf.tope,variables,conf);
        razonamiento.respuestas[r] = res.total;
        Object.assign(variables,res.variables);
      }

      let jqGenerado = plantilla.razonamiento(variables);
      jqGenerado.jq.appendTo(jq);

      // Por motivos estratégicos es mejor plantear las últimas preguntas primero, por lo que
      // antes de mostrarlas deben invertirse
      razonamiento.preguntas = razonamiento.preguntas.reverse();
      razonamiento.respuestas = razonamiento.respuestas.reverse();

      // Ocultar las respuestas que solo son para preparar el razonamiento y no para plantear al usuario
      for(let i=razonamiento.preguntas.length-1; i>=0; i--) {
        if(razonamiento.preguntas[i] == '') {
          razonamiento.preguntas.splice(i,1);
          razonamiento.respuestas.splice(i,1);
        }
      }

      // Crear las preguntas y agregarlas al documento
      for(let r in razonamiento.preguntas) {
        let preguntaJq = jqGenerado.Pregunta(Object.assign({Pregunta: razonamiento.preguntas[r]},variables));
        coleccionReturn.push({text: preguntaJq.find('input'), answer: razonamiento.respuestas[r]});
        preguntaJq.appendTo(jqGenerado.find('.Preguntas'));
      }

      // Enviar los resultados a mate
      if(doneCallback) doneCallback(coleccionReturn);
    }

    $.get('/razonamientos/get.php', {id}, res => {
      razonamiento = JSON.parse(res);
      if(plantilla)
        procesarRazonamiento();
    });
    templater.get('razonamiento').then(res => {
      plantilla = res;
      if(razonamiento) 
        procesarRazonamiento();
    })
  
    return new function() {
      this.then = function(cb) {
        doneCallback = cb;
      }
    }
  }
  
  this.resolverCuenta = function(cuenta, min=3, max=1000, variables={}, conf = confDefault, resetProximaVariable=true) {
    if(resetProximaVariable) {
      proximaVariable = 'X';
    }

    let cuentaInicial = cuenta;
    function encapsularParentesis(cuenta) {
      let parentesis = [], nuevaCuenta='';
      for(let i=0; i<cuenta.length; i++) {
        if(cuenta[i] == '(') {
          let nParentesis = '', parentesisAbiertos=0;
          while(i<cuenta.length) {
            nParentesis += cuenta[i];
            if(cuenta[i] == '(') parentesisAbiertos++;
            else if(cuenta[i] == ')') parentesisAbiertos--;
            
            // Se determina el valor de cada cuenta, se utilizará antes de asignar sus márgenes
            if(parentesisAbiertos==0) {
              nParentesis = nParentesis.slice(1,-1);
              nuevaCuenta += `PAR${parentesis.length}`;
              parentesis.push({
                str: nParentesis,
                ev: evaluar(nParentesis)});
              break;
            }
            i++;
          }
        }
        else
          nuevaCuenta += cuenta[i];
      }
    
      return [nuevaCuenta,parentesis];
    }
    
    function evaluar(termino) {
      termino = termino.replaceAll(/PAR[0-9]+/g,'A');
      termino = termino.replaceAll(/(\+|^)[a-zA-Z]+/g,'+' + conf.maximo.suma);
      termino = termino.replaceAll(/\([a-zA-Z]+/g,'(' + conf.maximo.suma);
      termino = termino.replaceAll(/\-[a-zA-Z]+/g,'-' + conf.maximo.resta);
      termino = termino.replaceAll(/\*[a-zA-Z]+/g,'*' + conf.maximo.multiplicacion);
      termino = termino.replaceAll(/\/[a-zA-Z]+/g,'/' + conf.maximo.division);
      return eval(termino);
    }
  
    razonamientos.dbg(1,"%cProcesando cuenta: %s","color:red", cuenta);
    razonamientos.dbg(1,{min,max});
  
    let parentesis = [], nuevaCuenta='', terminos=[], res;
    
    while(res = cuenta.match(/([0-9]+)/)) {
      variables[proximaVariable] = (res[1]);
      cuenta = cuenta.replace(res[0], proximaVariable);
      proximaVariable = proximaVariable + 'X';
    }
  
    // Primero se encapsulan los paréntesis para que no interfieran y puedan ser resueltos
    // como una cuenta aparte
    res = encapsularParentesis(cuenta);
    parentesis = res[1];
    nuevaCuenta = res[0];
  
    for(let i in variables) 
      cuenta = cuenta.replace(i, variables[i]);
  
    // Luego se separan términos
    cuenta = '';
    let terminosSumando=0, 
      terminosRestando=0, 
      totalSumaPotencial=0, 
      totalRestaPotencial=0;
  
    terminos = [...nuevaCuenta.matchAll(/(^|[\+\-])([^\+\-]+)/g)];
    for(let i in terminos) {
      let suma = true;
      terminos[i] = {
        str: terminos[i][0],
        ev: terminos[i][1] == '-' ? -conf.maximo.resta : conf.maximo.suma};
  
      razonamientos.dbg(2,terminos[i]);
      if(terminos[i].ev >= 0) {
        terminosSumando++;
        totalSumaPotencial+=terminos[i].ev;
      } else {
        terminosRestando++;
        totalRestaPotencial -= terminos[i].ev;
        suma = false;
      }
      terminos[i].suma = suma;
    }
  
    let totalSuma = 0, totalResta = 0, total=0;
    /* Hay 3 límites distintos para el máximo:
      - El límite que establece la función en sus parámetros
      - El límite de suma que establece la configuración
      - Lo que puede llegar a sumar cada término con respecto a la proporcionalidad que representa entre todos los sumandos
  
    Límites para el mínimo:
      - El límite que establece la función en sus parámetros
    */
  
    function resolverTermino(termino,min,max,variables) {
      razonamientos.dbg(2, {cuentaInicial, termino, min, max});
      let Min = min, Max = max;
      if(min > max) min = max / Math.sqrt(2);
      if(['+','-'].indexOf(termino[0]) != -1)
        termino = termino.slice(1);
  
      let multiplos = [...termino.matchAll(/(?:^|\*)((?:PAR[0-9+])|[a-zA-Z]+)/g)];
      let divisores = [...termino.matchAll(/\/((?:PAR[0-9+])|[a-zA-Z]+)/g)];
      let totalDivision = 1, totalMultiplicacion = 1;
  
      if(multiplos.length+divisores.length == 1) {
        let factor = multiplos.length ? multiplos[0] : divisores[0];
        if(res = factor[1].match(/^PAR([0-9]+)$/)) {
          res = razonamientos.resolverCuenta(parentesis[res[1]].str,min,max,variables,conf, false);
          Object.assign(variables,res.variables);
          totalMultiplicacion = res.total;
        } else if(factor[1] in variables){
          totalMultiplicacion = variables[factor[1]];
        } else {
          variables[factor[1]] = totalMultiplicacion = rand(min,max);
        }
      }
      else {
        for(let divisor of divisores) {
          let minimo = 3, maximo = conf.maximo.division, res, letra=divisor[1];
          if(res = divisor[1].match(/^PAR([0-9]+)$/)) {
            res = razonamientos.resolverCuenta(parentesis[res[1]].str,minimo,maximo,variables,conf,false);
            Object.assign(variables,res.variables);
            divisor = res.total;
          } else if(divisor[1] in variables){
            divisor = variables[divisor[1]];
          } else {
            divisor = variables[divisor[1]] = rand(minimo,maximo);
          }
          razonamientos.dbg(2, {cuentaInicial, divisor: letra,minimo,maximo,val:divisor});
          min *= divisor;
          max *= divisor;
          totalDivision *= divisor;
        }
    
        function multiploRand(min,max,val) {
          min = Math.ceil(min/val);
          max = Math.floor(max/val);
          return rand(min,max) * val;
        }
        
        let divisionNatural = false;
        let multiplosOrdenados = [];
        for(let i=multiplos.length-1; i>=0; i--) 
          if(multiplos[i][1] in variables){
            multiplosOrdenados.push(multiplos[i]);
            multiplos.splice(i,1);
          }
  
        multiplos = [...multiplosOrdenados,...multiplos];
  
        for(let i=0; i<multiplos.length; i++) {
          let multiplo = multiplos[i], cant = multiplos.length - i, res, letra=multiplos[i][0];
          let minimo, maximo;
          razonamientos.dbg(2, {cuentaInicial, min,max});

          maximo = menor(conf.maximo.multiplicacion, max  ** (1/cant));
          minimo = menor(conf.maximo.multiplicacion / 10,
            maximo / Math.sqrt(2));
  
    
          if(res = multiplo[1].match(/^PAR([0-9]+)$/)) {
            res = razonamientos.resolverCuenta(parentesis[res[1]].str,minimo,maximo,variables,conf,false);
            Object.assign(variables,res.variables);
            multiplo = res.total;
          } else if(multiplo[1] in variables){
            multiplo = variables[multiplo[1]];
          } else if(!conf.divideReales && !divisionNatural) {
            multiplo = variables[multiplo[1]] = multiploRand(minimo,maximo,totalDivision);
            divisionNatural = true;
          } else {
            multiplo = variables[multiplo[1]] = rand(minimo,maximo);
          }
          razonamientos.dbg(2, {cuentaInicial, multiplo: letra,minimo,maximo,val:multiplo});
          max /= multiplo;
          min /= multiplo;
          totalMultiplicacion *= multiplo;
        }
  
      }
      razonamientos.dbg(2, {cuentaInicial, val:totalMultiplicacion/totalDivision,Min,Max});
      return {variables, val:Math.floor(totalMultiplicacion/totalDivision)};
    }
  
    for(let termino of terminos) {
      let porcentajeTotal, maximo, minimo, val;
      
      if(termino.suma) { // Resolver los términos que suman
  
        porcentajeTotal = termino.ev / totalSumaPotencial;
        totalSumaPotencial -= termino.ev;
  
        // Se establece el mínimo y el máximo para el término
        maximo = menor(conf.maximo.suma,(max+totalResta-totalSuma+totalRestaPotencial) * porcentajeTotal);
        if(totalSumaPotencial) {
          minimo = 0;
        }
        else {
          minimo = mayor(0,menor(conf.maximo.suma/Math.sqrt(2), min + totalResta - totalSuma + totalRestaPotencial/2));
        }
        
        val = resolverTermino(termino.str,minimo,maximo,variables);
        razonamientos.dbg(2, {cuentaInicial, suma:true,str:termino.str,minimo,maximo,val:val.val});
        Object.assign(variables,val.variables);
        val = val.val;
        totalSuma+=val;
      }
      else { //Resolver los términos que restan
        porcentajeTotal = (termino.ev*-1) / totalRestaPotencial;
  
        // Se establece el mínimo y el máximo para el término
        maximo = menor(conf.maximo.resta,
          (totalSuma + totalSumaPotencial - totalResta - min) * porcentajeTotal);
  
        if(!conf.restaNegativo) {
          maximo = menor(maximo,
            totalSuma);
          minimo = mayor(0,
            (totalSuma - totalResta - max) * porcentajeTotal);
        } else
          minimo = mayor(0,
            (totalSuma + totalSumaPotencial - totalResta - max) * porcentajeTotal);
        
        razonamientos.dbg(2, {cuentaInicial, resta:true,str:termino.str,minimo,maximo});
        razonamientos.dbg(2, {cuentaInicial, totalSuma,totalResta,min,totalSumaPotencial});
        val = resolverTermino(termino.str,minimo,maximo,variables);
        razonamientos.dbg(2, {cuentaInicial, val:val.val});
        Object.assign(variables,val.variables);
        val = val.val;
        totalRestaPotencial += termino.ev;
        totalResta+=val;
      }
    }
  
    total = totalSuma-totalResta;
    razonamientos.dbg(1, {cuentaInicial, min, max, val:total});
    razonamientos.dbg(1, {cuentaInicial, variables});
    return {total,variables};
  }
}