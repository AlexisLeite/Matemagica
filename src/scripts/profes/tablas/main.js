class Tablas extends Profesor {
  static info = {
    nombre: 'Tablas',
    breve: 'Completa todas las celdas, multiplicando ambos números señalados entre si.'
  }

  static required = {
  }

  init() {
    this.addPreloader(this.makeData);
  }

  buildView() {
    let tablas = this.data[0];
    let numeros = this.data[1];

    // Se colocan los campos de texto
    let tabla = [], tablaJq = $('<table id="EjercicioTablas" />');
    for(let x=0; x<=tablas.length; x++) {
      let tr = $('<tr />');
      tabla[x] = [];
      for(let y=0; y<=numeros.length; y++) {
        if(x==0) {
          if(y==0) 
            tabla[x][y] = $('<th />');
          else
            tabla[x][y] = $(`<th>${numeros[y-1]}</th>`);
        }
        else {
          if(y==0) 
            tabla[x][y] = $(`<th>${tablas[x-1]}</th>`);
          else {
            tabla[x][y] = $(`<td><input type="text"></td>`);
            tr.append(tabla[x][y]);
            tabla[x][y].focusin(()=> {
              $('.Highlight').removeClass('Highlight');
              tabla[0][y].addClass('Highlight');
              tabla[x][0].addClass('Highlight');
            });

            tabla[x][y].find('input').keydown(key => {
              let nuevoX, nuevoY;
              switch(key.key) {
                case "ArrowUp":
                  nuevoX = x-1 < 1 ? (numeros.length) : x-1;
                  tabla[nuevoX][y].find('input').focus();
                  break;
                case "ArrowDown":
                  nuevoX = x+1 > numeros.length ? 1 : x+1;
                  tabla[nuevoX][y].find('input').focus();
                  break;
                case "ArrowLeft":
                  nuevoY = y-1 < 1 ? tablas.length : y-1;
                  tabla[x][nuevoY].find('input').focus();
                  break;
                case "ArrowRight":
                case "Enter":
                  nuevoY = y+1 > tablas.length ? 1 : y+1;
                  tabla[x][nuevoY].find('input').focus();
                  break;
                }
            })
            this.push(new Answer(tabla[x][y].find('input'), parseInt(tabla[0][y].text()) * parseInt(tabla[x][0].text())));
            continue;
          }
        }
        tr.append(tabla[x][y]);
      }
      $(tablaJq).append(tr);
    }
    this.append(tablaJq);
  }

  makeData(resolve) {
    let numeros = [], numeros2 =[], tablas = [];

    // Se preparan las cabeceras
    for(let i=3; i<10; i++) {
      numeros.push(i);
      numeros2.push(i);
    }
    while(numeros.length) {
      let i = Math.floor(Math.random() * numeros.length);
      tablas.push(numeros[i]);
      numeros.splice(i,1);
    }
    while(numeros2.length) {
      let i = Math.floor(Math.random() * numeros2.length);
      numeros.push(numeros2[i]);
      numeros2.splice(i,1);
    }

    this.set([tablas,numeros]);

    resolve();
  }
}
