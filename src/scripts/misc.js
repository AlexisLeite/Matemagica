function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var val = function(id) {
  if(typeof id == 'string')
    return parseInt($(`#${id}`).val());
  else
    return parseInt(id.val());
}

function bn(n) {
  return math.bignumber(n);
}

function nb(n) {
  return math.number(n);
}

function dibujarPunto(punto, scale=1, offset=0, stroke='red') {
  puntox = nb(punto.x) * scale;
  puntoy = nb(punto.y) * scale;
  let a = new Konva.Line({
    points: [puntox-10 + offset,puntoy-10 + offset, puntox+10 + offset, puntoy+10 + offset],
    stroke
  });
  let b = new Konva.Line({
    points: [puntox+10 + offset,puntoy-10 + offset, puntox-10 + offset, puntoy+10 + offset],
    stroke
  });
  let ret = new Konva.Group();
  ret.add(a);
  ret.add(b);

  return ret;
}

function rand(min,max=null) {
  if(typeof min == typeof 0 && max != null)
    return Math.floor(Math.random()*(max-min)+min);
  else if(max == null && typeof min == 'number')
    return rand(0,min);
  else if('length' in min)
    return min[rand(0,min.length)];
}

function mayor(...args) {
  let mayor = -Infinity;
  for(let arg of args) 
    if(arg > mayor) mayor = arg;
  return mayor;
}

function menor(...args) {
  let menor = Infinity;
  for(let arg of args) 
    if(arg < menor) menor = arg;
  return menor;
}

function round(number, decimals) {
  return Math.round(number * (10 ** decimals)) / (10 ** decimals);
}


function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function EasyEvents() {
  this.addEvent = function(name) {
    this[`on${ucFirst(name)}Callbacks`] = [];
    this[`on${ucFirst(name)}`] = function(cb) {
      if(typeof cb == 'function')
        this[`on${ucFirst(name)}Callbacks`].push(cb);
    }
    this[`fire${ucFirst(name)}`] = function(...args) {
      for(let cb of this[`on${ucFirst(name)}Callbacks`])
        cb(...args);
    }
  }

  this.addEvents = function(events) {
    for(let event of events) {
      this.addEvent(event);
    }
  }
}

// Elementos utilizados para realizar debug
var maxDebugable = 0, ultimoDebugador;
function Debugable(nombre = 'Debugable', level=0) {
  this.nombre = this.constructor.name;
  this.cookieName = `Debug${this.nombre}`;
  this.level = level == 0 ? (Cookies.get(this.cookieName) ?? level) : level;
  this.strict = false;

  this.setDebugLevel = function(level) {
    this.level = level;
    Cookies.set(this.cookieName,level);
  }

  this.setStrict = function(strict) {
    this.strict = strict;
  }

  this.checkLevel = function(level) {
    return (level <= this.level && !this.strict) || (level == this.level && this.strict);
  }

  this.clearConsole = function(level=0) {
    if(this.checkLevel(level)) {
      console.clear();
    }
  }

  this.dbg = function(level, ...args) {
    if(this.checkLevel(level)) {
      if(ultimoDebugador != this.nombre) {
        ultimoDebugador = this.nombre;
        console.log('');
        console.log(`%cDebug de ${this.nombre}`,'color: green; font: bold 13pt verdana');
      }
      console.log(...args);
    }
  }
}