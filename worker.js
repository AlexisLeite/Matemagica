importScripts('./src/scripts/misc.js');
importScripts('./src/scripts/ext/math.js');

math.config({
  number: 'BigNumber',      // Default type of number:
                            // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 64             // Number of significant digits for BigNumbers
});

class Point {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
}

class Poligono {
  constructor(params) {
    Object.assign(this, {
      x: 200,
      y: 200,
      rotation: 0,
      points: []
    }, params);
  }

  calculate() {
    let points = [];
    for(let i=0; i<this.points.length-1; i++) {

      let x = bn(this.points[i]);
      let y = bn(this.points[i+1]);
      let rotation = bn(this.rotation);


      let dist = math.evaluate('sqrt(x^2+y^2)', {x, y});
      let alpha = math.evaluate('atan2(y,x) + rotation', {x, y, rotation});

      let xCalculado = math.evaluate('cos(alpha) * dist', {alpha,dist});
      let yCalculado = math.evaluate('sin(alpha) * dist', {alpha,dist});
      
      points.push(new Point(xCalculado, yCalculado));

      i++;
    }

    this.calculatedPoints = points;
  }

  rasterize() {
    let rasterized = [];

    for(let point of this.calculatedPoints) {
      rasterized.push(math.number(point.x) * 20 + this.x);
      rasterized.push(math.number(point.y) * 20 + this.y);
    }

    return rasterized;
  }
}

class Cuadrado extends Poligono {
  constructor(params) {
    super(params);

    Object.assign(this, {
      width: 5
    });


    this.points = [0,0, this.width,0, this.width,this.width, 0,this.width, 0,0];

    this.calculate();
  }

  inArea(x,y) {
    x = bn(x);
    y = bn(y);

    

    return false;
  }
}

class PoligonHandler {
  constructor(ammount) {
    for(let i=0; i<ammount; i++) {
      switch(rand(0,1)) {
        case 0: //Dibujar un cuadrado

          break;
        case 1: //Dibujar un triangulo
          break;
      }
    }
  }
}

var ph;
self.addEventListener('message',(ev) => {
  switch(ev.data.action) {
    case 'make':
      ph = new Cuadrado({
        width: rand(3,5),
        rotation: ev.data.rotation || 0 });

      postMessage({action: 'points', points: ph.rasterize()});

      break;

    case 'inArea':
      postMessage({action: 'inArea', inArea: ph.inArea(ev.data.x, ev.data.y)})
      break;
  }
});