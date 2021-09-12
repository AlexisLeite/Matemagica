function degrees(radians) {
  return math.evaluate('radians * 180 / pi', {radians:bn(radians)});
}

function radians(degrees) {
  return math.evaluate('degrees * pi / 180', {radians:bn(degrees)});
}

math.config({
  number: 'BigNumber',      // Default type of number:
                            // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 64             // Number of significant digits for BigNumbers
})

class Surface {

  constructor(a,b) {
    if(a && b) {
      this.a = a;
      this.b = b;
      
      this.distXa = math.evaluate('ax - bx', {ax: a.x,bx: b.x});
      this.distYa = math.evaluate('ay - by', {ay: a.y,by: b.y});
      
      this.distXb = math.evaluate('ax - bx', {ax: b.x,bx: a.x});
      this.distYb = math.evaluate('ay - by', {ay: b.y,by: a.y});
  
      this.length = math.evaluate('sqrt(distXa^2+distYa^2)',{distXa: this.distXa, distYa: this.distYa});
  
      this.rotation = math.evaluate('atan2(distY,distX)', {distX: this.distXa,distY: this.distYa});
      this.rotationA = math.evaluate('atan2(distY,distX)', {distX: this.distXb,distY: this.distYb});
  
      this.rotationB = this.rotation;
    }
  }

  getPercent(porcion) {
    return { 
      x: math.evaluate('distXa * porcion + bx',{distXa: this.distXa, porcion, bx: this.b.x}), 
      y: math.evaluate('distYa * porcion + by',{distYa: this.distYa, porcion, by: this.b.y})
    }
  }

  getPoint(ammount) {
    let porcion = math.divide(ammount,this.length);
    return this.getPercent(porcion);
  }
}

class Poligono {
  calc(x,y) {
    x = bn(x); y = bn(y);
    let dist = math.evaluate("sqrt(x^2 + y^2)",{x,y});
    let alpha = math.evaluate("atan2(y,x) + rotation", {
      x,y,rotation: bn(this.rotation)
    });

    return {x: math.evaluate('cos(alpha) * dist + x', {alpha,dist, x:bn(this.x)}), 
      y: math.evaluate('sin(alpha) * dist + y', {alpha,dist, y:bn(this.y)})};
  }

  circleFtCircle(colCircle,colCircleTarget) {
    let xOwn = bn(colCircle.x);
    let yOwn = bn(colCircle.y);
    let xTarget = bn(colCircleTarget.x);
    let yTarget = bn(colCircleTarget.y);

    let radiusOwn = bn(colCircle.radius);
    let radiusTarget = bn(colCircleTarget.radius);

    let distX = math.evaluate('xTarget-xOwn',{xTarget,xOwn});
    let distY = math.evaluate('yTarget-yOwn',{yTarget,yOwn});
    let dist = math.evaluate('sqrt(distX^2 + distY^2)',{distX,distY});

    if(math.smaller(dist, math.sum(radiusOwn, radiusTarget))) 
      return true;
    return false;
  }

  collides(targets) {
    for(let target of targets) {
      if(this.circleFtCircle(this.outerCircle,target.outerCircle)) {
        for(let colCircle of this.colideCircles) {
          for(let colCircleTarget of target.colideCircles) {
            if(this.circleFtCircle(colCircle,colCircleTarget))
              return true;
          }
        }
      }
    }
    return false;
  }

  constructor(params) {
    Object.assign(this, {
      stroke: 'white',
      strokeWidth: 1,
      rotation: bn(0),
      x: bn(0),
      y: bn(0),
      width: bn(rand(3,11))
    }, params);

    this.drawing = {destroy: ()=> {}}
  }

  draw(layer, scale=1, offset=0, params={}) {
    let points = this.rasterize(scale, offset);

    this.drawing.destroy();

    this.drawing = new Konva.Line({
      points,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      closed: true,
      ...params
    });

    layer.add(this.drawing);
    layer.batchDraw();
  }

  drawCircles(layer, scale=1, offset=0, params={}) {
    scale = bn(scale);
    for(let circle of this.colideCircles) {
      layer.add(new Konva.Circle({
        radius: nb(circle.radius) * scale,
        x: nb(circle.x * scale),
        y: nb(circle.y * scale),
        ...params
      }))
    }
  }

  drawMeassurements(layer, scale=1, offset=0, params={}) {
    scale = bn(scale);
    for(let surface of this.surfaces) {
      if(surface.length != this.width) continue;

      let mid = surface.getPercent(0.5);
      let newPoint = {
      }

      layer.add(new Konva.Text({
        x: math.evaluate('(cos(alpha + pi/2) * 1 + x) * scale + offset - 7', {x:mid.x, alpha:surface.rotation, scale, offset}),
        y: math.evaluate('(sin(alpha + pi/2) * 1 + y) * scale + offset - 7', {y:mid.y, alpha:surface.rotation, scale, offset}),
        text: nb(math.round(surface.length,2)),
        stroke: 'white',
        fontSize: 13,
        strokeWidth: 1,
        fontStyle: 'normal',
        fontFamily: 'verdana'
      }))
    }
  }

  destroy() {
    this.drawing.destroy();
  }

  getSurface() {
    if(this.publicSurfaces.length == 0) return false;

    return this.publicSurfaces.splice(rand(this.publicSurfaces.length),1)[0];
  }

  rasterize(scale=1, offset=0) {
    let points = [];
    for(let i=0; i<this.points.length; i++) {
      points.push(math.number(this.points[i]) * scale + offset);
    }
    return points;
  }

  rasterizeCollideCircles(scale=1, offset=0) {
    let circles = [];
    for(let circle of this.colideCircles) {
      circles.push(new Circle({
        x: nb(circle.x) * scale + offset,
        y: nb(circle.y) * scale + offset,
        radius: circle.radius * scale,
      }));
    }
    return circles;
  }

  rasterizeOuterCircle(scale=1, offset=0) {
    let circle = new Circle({
      x: this.outerCircle.x * scale + offset,
      y: this.outerCircle.y * scale + offset,
      radius: this.outerCircle.radius * scale
    });
    return circle;
  }

  revive() {
    for(let i=0; i<this.surfaces.length; i++) {
      let nuevaSurface = new Surface();
      Object.assign(nuevaSurface, this.surfaces[i]);

      this.surfaces[i] = nuevaSurface;
    }
  }

  setCircles() {}

  setPoints() {}

  setSurfaces() {
    this.surfaces = [];
    this.publicSurfaces = [];
    this.minx = this.maxx = this.miny = this.maxy = {x:0, y:0};

    for(let i=0; i<this.points.length-2; i++) {
      let x = this.points[i];
      let y = this.points[++i];

      let nbx = nb(x);
      let nby = nb(y);

      if(nbx < this.minx.x) this.minx = {x: nbx, y:nby};
      if(nby < this.miny.y) this.miny = {x: nbx, y:nby};
      if(nbx > this.maxx.x) this.maxx = {x: nbx, y:nby};
      if(nby > this.maxy.y) this.maxy = {x: nbx, y:nby};

      let x1 = this.points[i+1];
      let y1 = this.points[i+2];

      this.surfaces.push(new Surface({x,y}, {x:x1,y:y1}));
      this.publicSurfaces.push(new Surface({x,y}, {x:x1,y:y1}));
    }
  }
}

class Circle {
  constructor(params) {
    Object.assign(this, {
      radius: 10,
      x: 0,
      y: 0
    }, params);
  }
}

class Square extends Poligono {
  setCircles() {
    this.outerCircle = new Circle({
      ...this.calc(this.width / 2, this.width / 2),
      radius: (Math.sqrt(this.width**2 + this.width**2) / 2) / 100 * 95,
    });
    this.colideCircles = [
    ];
    let divide = 2;
    for(let i = 0; i < divide; i++) {
      for(let j = 0; j < divide; j++) {
        if(i != 0 && j != 0 && i != divide-1 && j != divide-1) continue;
        this.colideCircles.push( new Circle({
          ...this.calc((this.width / (divide * 2)) * (j * 2 + 1), (this.width / (divide * 2)) * (i * 2 + 1)),
          radius: this.width / (divide * 2) 
        }));
      }
    }
  }

  setPoints() {
    this.points = [...Object.values(this.calc(0,0)), 
      ...Object.values(this.calc(this.width,0)), 
      ...Object.values(this.calc(this.width,this.width)), 
      ...Object.values(this.calc(0,this.width)),
      ...Object.values(this.calc(0,0))];
  }

  constructor(params) {
    super(params);

    Object.assign(this, {
      kind: 'Square'
    }, params);

    this.setPoints();
    this.setSurfaces();
    this.setCircles();
  }
}

class RectTriangle extends Poligono {
  customDraw(layer, scale, offset) {
  }

  setCircles() {
    let points = this.rasterize(1);
    let x = (points[0] + points[2] + points[4]) / 3;
    let y = (points[1] + points[3] + points[5]) / 3;
    let radiusX = Math.abs(x - points[0]);
    let radiusY = Math.abs(y - points[1]);
    let radius = radiusX < radiusY ? radiusY : radiusX;

    this.outerCircle = new Circle({x,y,radius});
    this.colideCircles = [];

    let surfacesGroups = [];
    for(let i=0; i<this.surfaces.length-1; i++) {
      surfacesGroups.push([this.surfaces[i],this.surfaces[i+1]]);
    }
    surfacesGroups.push([this.surfaces[this.surfaces.length-1],this.surfaces[0]]);

    for(let surfaceGroup of surfacesGroups) {
      let a = surfaceGroup[0];
      let b = surfaceGroup[1];

      if(math.larger(b.rotationA,a.rotationB))
        a.rotationB = math.sum(a.rotationB, math.pi, math.pi)
        
      
      let alphabeta = { alpha: a.rotationB, beta: b.rotationA };
      let alpha = math.evaluate('(alpha+beta)/2', alphabeta);

      let x = nb(math.evaluate('cos(alpha) * 2 + xa',{alpha, xa: b.a.x}));
      let y = nb(math.evaluate('sin(alpha) * 2 + ya',{alpha, ya: b.a.y}));

      let pointInSide = a.getPoint(0.5);
      let pointCenter = {
        x: math.evaluate('xa + cos(alpha) * 0.5', {xa:a.b.x, alpha}),
        y: math.evaluate('ya + sin(alpha) * 0.5', {ya:a.b.y, alpha})
      }

      let distX = math.subtract(pointCenter.x, pointInSide.x);
      let distY = math.subtract(pointCenter.y, pointInSide.y);

      let radius = math.evaluate('sqrt(distX^2+distY^2) * 0.5',{distX,distY});

      this.colideCircles.push(new Circle({
        x: nb(pointCenter.x),
        y: nb(pointCenter.y),
        radius: nb(radius)
      }));
    }

    points = [0.4,0.6];
    for(let point of points) {
      point = this.hipotenusa.getPercent(point);
      let posCircleMid = {
        x: math.evaluate('(xmid + cos(alpha) * (height / 4))', {
          xmid: point.x,
          height: this.height,
          alpha: math.sum(this.hipotenusa.rotationA, math.divide(math.pi,2))
        }),
        y: math.evaluate('(ymid + sin(alpha) * (height / 4))', {
          ymid: point.y,
          height: this.height,
          alpha: math.sum(this.hipotenusa.rotationA, math.divide(math.pi,2))
        })
      }

      this.colideCircles.push(new Circle({
        radius: nb(math.evaluate('(height / 4) * 0.8', { height: this.height})),
        x: nb(posCircleMid.x),
        y: nb(posCircleMid.y)
      }));
    }
  }

  setPoints() {
    this.points = [...Object.values(this.calc(0,0)), 
      ...Object.values(this.calc(this.width,0)), 
      ...Object.values(this.calc(this.width,this.width)), 
      ...Object.values(this.calc(0,0)) ];

    this.height = this.width;
  }

  setSurfaces() {
    super.setSurfaces();

    this.hipotenusa = {length: 0};
    for(let surface of this.surfaces) {
      if(math.larger(surface.length,this.hipotenusa.length))
        this.hipotenusa = surface;
    }
  }

  constructor(params) {
    super(params);

    Object.assign(this, {
      kind: 'RectTriangle'
    }, params);

    this.setPoints();
    this.setSurfaces();
    this.setCircles();
  }
}

class PoligonsMaker {
  constructor(params) {
    Object.assign(this,{
      ammount: 5,
      variety: [ Square, RectTriangle ],
      eventsHandler: ()=>{},
      logsHandler: ()=> {},
      percentHandler: ()=>{},
      minWidth: 3,
      maxWidth: 11
    },params);

    this.minx = this.maxx = this.miny = this.maxy = {x:0, y:0};
    this.inicializado = false;

    this.eventsHandler('Inicializando');
    this.makePoligons();
  }

  assignMeassurements(poligon) {
    this.eventsHandler('Comprobando límites');
    let minx = nb(poligon.minx.x);
    let maxx = nb(poligon.maxx.x);
    let miny = nb(poligon.miny.y);
    let maxy = nb(poligon.maxy.y);
    if(minx < this.minx.x) this.minx = poligon.minx;
    if(miny < this.miny.y) this.miny = poligon.miny;
    if(maxx > this.maxx.x) this.maxx = poligon.maxx;
    if(maxy > this.maxy.y) this.maxy = poligon.maxy;
  }

  initPoligons() {
    this.poligonos = [ this.newPoligon() ];

    if(this.inicializado)
      this.eventsHandler('Reinicializando polígonos');
    else
      this.eventsHandler('Inicializando polígonos');
    this.inicializado = true;
  }

  makePoligons() {
    this.eventsHandler('Iniciando producción de polígonos');
    this.eventsHandler('Primer polígono creado');
    this.initPoligons();
    let lastPoligono = this.poligonos[0], nuevoPoligono;

    this.assignMeassurements(lastPoligono);

    let count = 1; 

    while(count < this.ammount) {
      let surface = false;

      this.eventsHandler('Comprobando superficies');
      while(!surface) {
        if(!lastPoligono) {
          this.initPoligons();
          lastPoligono = this.poligonos[0];
        }
        surface = lastPoligono.getSurface();
        if(!surface) {
          this.poligonos.pop();
          --count;
        }
        lastPoligono = this.poligonos[this.poligonos.length - 1];
        this.eventsHandler('Intentando con una nueva superficie');
      }

      let parametros = {
        rotation:surface.rotation, 
        x:surface.b.x, 
        y:surface.b.y,
      }
      
      this.eventsHandler('Creando nuevo polígono');
      let nuevoPoligono = this.newPoligon(parametros);
      this.eventsHandler('Nuevo polígono creado');

      let collides = nuevoPoligono.collides(this.poligonos);
      if(!collides) {
        this.assignMeassurements(nuevoPoligono);
        this.poligonos.push(nuevoPoligono);
        lastPoligono = nuevoPoligono;
        ++count;
        this.shoutPercent(count);
        this.eventsHandler('Polígono satisfactorio');
      } else {
        this.eventsHandler('Polígono inviable');
      } 
    }

    this.setDistances();
  }

  newPoligon(parametros={}) {
    this.eventsHandler('Parámetros de nuevo polígono recibidos');
    Object.assign(parametros, {
      width: rand(this.minWidth, this.maxWidth)
    });
    let poligono = Reflect.construct(rand(this.variety),[parametros]);
    
    return poligono;
  }

  setDistances() {
    let poligonMaker = this;

    this.eventsHandler('Reconociendo distancias');
    this.distances = new function() {
      this.distances = [];

      this.push = function(distance) {
        poligonMaker.eventsHandler('Intentando establecer nueva distancia');

        let index=-1;
        for(let i=0; i<this.distances.length; i++) {
          if(math.deepEqual(this.distances[i].distance, distance.distance)) {
            poligonMaker.eventsHandler(`Imposible encontrar índice de distancia: ${distance.distance}`);
            return;
          }

          if(index<0 && math.smaller(this.distances[i].distance, distance.distance)) {
            poligonMaker.eventsHandler('Encontrado índice de distancia');
            index = i;
          }
        }

        if(index < 0) index = this.distances.length-1;

        this.distances.splice(index,0,distance);
      }
    };

    let cantPoints = 0;
    for(let i=0; i<this.poligonos.length; i++) {
      cantPoints += this.poligonos[i].points.length;
    }

    for(let i=0; i<this.poligonos.length-1; i++) {
      for(let j=i+1; j<this.poligonos.length; j++) {
        for(let k=0; k<this.poligonos[i].points.length-1; k++) {
          let xa = this.poligonos[i].points[k];
          let ya = this.poligonos[i].points[++k];
          for(let l=0; l<this.poligonos[j].points.length-1; l++) {
            let xb = this.poligonos[j].points[l];
            let yb = this.poligonos[j].points[++l];

            this.distances.push({
              distance: nb(math.distance([xa,ya],[xb,yb])),
              a: {x: xa, y: ya},
              b: {x: xb, y: yb}
            });

            this.shoutPercent(i*k,cantPoints,true);
          }
        }
      } 
    }

    this.distances = this.distances.distances;
    this.distances.splice(this.distancesStages);
  }

  shoutPercent(count, distances=0, distance=false) {
    if(distance) {
      this.percentHandler(50+50*count/distances);
    }
    else
      this.percentHandler(50*count/this.ammount);
  }
}