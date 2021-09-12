require 'profes/geometria/poligonMaker';

class PoligonsHandler {
  draw() {
    this.layer.removeChildren();

    let scaleX = this.width / (this.maxx.x-this.minx.x);
    let scaleY = this.height / (this.maxy.y-this.miny.y);

    let scale = scaleX > scaleY ? scaleY : scaleX;
    scale *= 0.7;


    for(let i=0; i<this.poligonos.length && i<this.stage; i++) {
      if(i == this.poligonos.length-1 || i == this.stage-1) {
        this.poligonos[i].draw(this.layer, scale, 0, {
          stroke: this.stroke,
          strokeWidth: this.strokeWidth
        });
        this.poligonos[i].drawMeassurements(this.layer, scale);
        this.fireDrewPoligon(this.poligonos[i]);
      } else {
        this.poligonos[i].draw(this.layer, scale, 0, {
          stroke: this.drawnPoligonStroke
        });
      }
      //this.poligonos[i].drawCircles(this.layer,scale,0,{stroke:'green'})
    }

    this.layer.x(this.minx.x * scale * -1 + (this.width - (this.maxx.x-this.minx.x) * scale) / 2);
    this.layer.y(this.miny.y * scale * -1 + (this.height - (this.maxy.y-this.miny.y) * scale) / 2);

    if(this.currentDistance > 0)
      this.drawDistances(scale);

    this.layer.batchDraw();
  }

  drawDistances(scale) {
    for(let i=0; i<this.currentDistance; i++) {
      let stroke;
      if(i == this.currentDistance-1) {
        stroke = this.currentDistanceStroke;
        this.fireDrewDistance(Math.round(this.distances[i].distance * 10) / 10);
      } else 
        stroke = this.drawnDistanceStroke;

      let a = dibujarPunto(this.distances[i].a,scale,0,stroke);
      let b = dibujarPunto(this.distances[i].b,scale,0,stroke);

      this.layer.add(a);
      this.layer.add(b);
    }
  }

  next() {
    this.stage ++;
    let diferencia = this.stage - this.ammount;

    
    if(diferencia > 0) {
      this.stage -= diferencia;
      this.currentDistance += diferencia;
    }
    if(this.currentDistance > this.distancesStages) this.currentDistance = this.distancesStages;
    if(this.stage > this.ammount) this.stage--;

    this.draw();
    this.fireChangeStage({stage: this.stage, distance: this.currentDistance});
  }

  prev() {
    if(this.currentDistance > 0) {
      this.currentDistance--;
    }
    else {
      this.stage --;
  
      if(this.stage < 1) this.stage++;
    }

    this.draw();
    this.fireChangeStage({stage: this.stage, distance: this.currentDistance});
  }

  revivePoligons() {
    for(let i=0; i<this.poligonos.length; i++) {
      let nuevoPoligono = new Poligono();
      delete this.poligonos[i].drawing;
      Object.assign(nuevoPoligono, this.poligonos[i]);
      nuevoPoligono.revive();

      this.poligonos[i] = nuevoPoligono;
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height-250;

    this.Stage.width(this.width);
    this.Stage.height(this.height);
    this.draw();
  }

  constructor(params, poligons=false) {
    Object.assign(this, {
      container: 'body',
      currentDistance: 0,
      distancesStages: 2,
      height: 600,
      poligonos: {},
      stage: 1,
      stroke: 'white',
      strokeWidth: 1,
      width: 600,
      drawnPoligonStroke: '#555',
      currentDistanceStroke: 'yellow',
      drawnDistanceStroke: ''
    }, params);

    EasyEvents.call(this);

    // Configurando canvas
    this.Stage = new Konva.Stage({
      container: this.container
    });

    this.layer = new Konva.Layer({}); 
    this.Stage.add(this.layer);

    // Configurando eventos
    this.addEvents(['DrewDistance', 'DrewPoligon', 'ChangeStage']);

    // Configurando polígonos
    if(poligons) {
      this.revivePoligons();
    }

    if(this.distancesStages > this.distances.length) this.distancesStages = this.distances.length;

    this.resize(this.width, this.height);
  }
}