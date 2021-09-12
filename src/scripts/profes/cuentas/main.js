class Cuentas extends Profesor {
  static info = {
    nombre: "Cuentas",
    breve: "Realiza las siguientes cuentas",
  }

  static required = {
    cantidad: { title: 'Cantidad de operaciones', type: 'number' , default: 12, max: 40, min: 4},
    cifrasSuma: { title: 'Cifras de suma', type: 'number', default: 5, max: 6, min: 1 },
    cifrasResta: { title: 'Cifras de resta', type: 'number', default: 4, max: 6, min: 1 },
    cifrasDivision: { title: 'Cifras de división', type: 'number', default: 1, max: 6, min: 1 },
    cifrasMultiplicacion: { title: 'Cifras de multiplicación', type: 'number', default: 3, max: 6, min: 1 },
    restaNegativo: {title: '¿Resta negativo?', type: 'check', default: false }
  }

  init() {
    $@Templates "cuentas";

    this.addPreloader(this.makeData);
  }

  buildView() {
    let res = this.templates.cuentas();
    
    // Este array sustituye el número de operación por el símbolo
    let operator = ['+','x','-','/'];

    for(let cuenta of this.data) {
      let {A, B, operacion} = cuenta;
      cuenta = res.Cuenta({A, B, operacion: operator[operacion]});
      this.append(cuenta);
      this.push({text: cuenta.find('input'), answer: this.process(A, B, operacion)});
    }
  }

  makeData(resolve) {
    this.conf.maximo = {
      suma: 10 ** this.conf.cifrasSuma,
      resta: 10 ** this.conf.cifrasResta,
      multiplicacion: 10 ** this.conf.cifrasMultiplicacion,
      division: 10 ** this.conf.cifrasDivision
    }

    let revive = [];
    for(let i=0; i<this.conf.cantidad/4; i++){
      for(let operacion = 0; operacion<4; operacion++) {
        let A = this.generarValor(this.conf.maximo.suma);
        let B = operacion == 0 ? this.generarValor(this.conf.maximo.suma)
          : operacion == 1 ? this.generarValor(this.conf.maximo.multiplicacion)
          : operacion == 2 ? this.generarValor(this.conf.maximo.resta)
          : this.generarValorDivision();

        if(operacion > 1 && B > A && !this.conf.restaNegativo) {
          let C = A;
          A = B;
          B = C;
        }

        revive.push({A,B,operacion});
      }
    }

    this.set(revive);
    resolve();
  }
  
  // Genera un valor aleatorio con un máximo, no menor de 3
  generarValor(max) {
    let nro = parseInt(Math.random() * (max - max/10) + max/10);
    if(nro < 3) nro = 3;
    return nro;
  }

  // Permite generar valores no repetidos entre 3 y 10
  generarValorDivision() {
    let valor, cuentasDivisiones = Cookies.get('CuentasDivisiones'), valoresRestantes = [];
    if(this.conf.maximo.division == 10) {
      if(!cuentasDivisiones || JSON.parse(cuentasDivisiones).length == 0) 
        for(let i=3; i<10; i++)
          valoresRestantes.push(i);
      else 
        valoresRestantes = JSON.parse(cuentasDivisiones);

      valor = valoresRestantes.splice(rand(0,valoresRestantes.length),1)[0];
      Cookies.set('CuentasDivisiones',JSON.stringify(valoresRestantes));
    }
    else 
      return generarValor(this.conf.maximo.division);

    return valor;
  }
  
  // Realiza la operación
  process(A, B, op) {
    return parseInt(op == 0 ? A + B
      : op == 1 ? A * B
      : op == 2 ? A - B
      : A / B);
  }
}