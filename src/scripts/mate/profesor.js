/* 

La clase profesor será la base de todos los profesores.

Todos los profesores se ejecutarán mediante la llamada al método go,
el mismo devolverá una Promise que será resuelta inmediatamente en el caso
de que el mismo profesor no se declare asíncrono.

La secuencia de trabajo será la siguiente:

  # Mate llamará al constructor de la clase de profesor cuando sea necesario

    * Cada constructor podrá ser reescrito en las clases herederas de Profesor. Allí es importante 
      siempre llamar a super() para establecer las bases mínimas de Profesor. 

    * Cada profesor deberá establecer en su constructor al menos los siguientes elementos: 

      -> Plantillas necesarias, mediante la cadena especial $@Templates "Plantillas,necesarias"
        ESTA DECLARACIÓN SIEMPRE DEBERÁ ESTAR SEGUIDA DE UN PUNTO Y COMA, SINO NO TENDRÁ EFECTO
      -> Preloaders necesarios, mediante la llamada a addPreloader(preloader,alwaysNeeded);

  # Si existe un revive, Mate llamará a fromRevive en vez de al constructor. Este método estático
    se encargará de crear la instancia de profesor y configurarla como instancia de revive.
    
  # Mate llamará al método go(), este es interno y no debe ser reescrito. 

    * El método go devuelve una promesa a Mate y llama a todos los preloaders.

      ************************************************************************************************
      ************************************************************************************************
      ************************************************************************************************
      SE DEBE GENERAR LA POSIBILIDAD DE ESTABLECER "PASOS" EN EL LLAMADO DE LOS PRELOADERS,
      DE MODO QUE CUANDO TODOS LOS PRELOADERS DEL ESCALÓN 1 ESTÉN LISTOS, SE LLAME A LOS DEL ESCALÓN
      2 Y ASÍ SUCESIVAMENTE...

      ************************************************************************************************
      -> SI EXISTE UN REVIVE, SOLAMENTE SE LLAMARÁN A LOS PRELOADERS DECLARADOS CON alwaysNeeded=true;
      ************************************************************************************************

      -> Es importante destacar que realmente los preloaders sólamente deberán ser utilizados cuando
        existan tareas asíncronas a llevarse a cabo.
      -> El método go esperará a que todos los preloaders terminen, esto lo sabrá mediante cada 
        llamada al método resolve que cada preloader recibirá como parámetro.
      -> Una vez que todos los preloaders hayan terminado, se llamará al método buildView() del 
        profesor. Aquí se procesarán los datos obtenidos mediante los preloaders para obtener la vista
        deseada.

  # El método go no debe reescribirse de ninguna manera. La forma de personalizar el comportamiento
  de los profesores es mediante el establecimiento de preloaders y a través del método buildView();

Cuando el profesor termine 

*/

class Answer {
  constructor(textInput, answer) {
    this.text = textInput;
    this.answer = answer;
  }
}

class returnObject {
  constructor(params) {
    Object.assign(this,{answers:[],revive:{}},params);
  }

  // Agrega respuestas
  push(answer) {
    this.answers.push(answer);
  }

  // Establece el revive
  set(revive) {
    this.revive = revive;
  }
}

class PreloadersManager {
  constructor() {
    this.preloaders = [];
  }

  add(preloader, alwaysNeeded) {
    this.preloaders.push([preloader,alwaysNeeded]);
  }

  all() {
    return this.preloaders.map(el => {
      return new Promise(el[0]);
    });
  }

  alwaysNeeded() {
    let returnObject = [];

    for(let preloader of this.preloaders) {
      if(preloader[1])
        returnObject.push(new Promise(preloader[0]));
    }

    return returnObject;
  }
}

class Profesor {
  static info = {
    nombre: 'Profesor sin nombre',
    breve: 'Aquí debe ir una descripción'
  }

  static required = {
  }

  constructor(jq, conf) {
    // Elementos mínimos de trabajo
    this.jq = jq;
    this.conf = conf ?? {};
    this.returnObject = new returnObject();
    this.preloaders = new PreloadersManager();
    this.fromRevive = false; // Es utilizado para saber cuándo el profesor es a partir de un revive,
    // de forma que el método go sepa si debe llamar a todos los preloaders o sólo los alwaysNeeded.
    
    // Elementos de ayuda de profesor
    Debugable.call(this);

    // Accesos rápidos
    Object.defineProperties(this, {
      data: {
          get() {
          return this.returnObject.revive;
        }
      }
    })

    // Configurables
    this.init();
  }

  static fromRevive(jq,revive) {
    let profesor = new this(jq,{});
    profesor.set(revive);
    profesor.fromRevive = true;
    return profesor;
  }

  /* El método addPreloader deberá generar un array llamado preloaders que será utilizado desde la 
  llamada a go para administrar la carga de información necesaria de forma síncrona o no, concentrando
  todas las tareas previas en un sólo sitio.
  
  El parámetro alwaysNeeded = true indicará al profesor que este método debe ser llamado independientemente
  de que exista o no un revive. */ 
  addPreloader(preloader, alwaysNeeded=false) {
    let handler = this;
    let preloaderPromise = resolve => {
      preloader.call(handler,resolve);
    };
    this.preloaders.add(preloaderPromise,alwaysNeeded);
  }

  // Método utilizado en lugar del constructor para evitar fallas en la inicialización del profesor
  // Este método DEBE SER REESCRITO para establecer las configuraciones de los profesores.
  init(){}

  /* Método llamado desde mate cuando se debe generar una nueva instancia,
  el propósito de que exista éste y no se utilice directamente el constructor
  es la posibilidad de devolver una promesa cuando se invoca. De esta forma se permite a los
  profesores trabajar en forma asíncrona cuando sea necesario. 
  
  Este método no debe ser reescrito ya que es de uso interno de la aplicación, no tiene propósitos
  de personalización. Para personalizar el comportamiento se debe definir el método preload. */
  go() {
    return new Promise(resolve => {
      let preloaders = this.fromRevive ? this.preloaders.alwaysNeeded() : this.preloaders.all();

      Promise.all(preloaders).then(() => {
        /* Se asume que una vez alcanzado este punto todas las tareas asíncronas ya fueron completadas.
        No siendo necesaria la utilización de ninguna promesa más, se llama directamente al método que
        construye la vista y se devuelve el control de la situación a Mate.
        
        Una vez llamado a resolve, tanto la vista como el revive del profesor deben estar correctamente
        declarados de forma que Mate pueda administrar la información sin necesidad de ningún tipo
        de modificación adicional. */
        this.buildView();
        resolve(this.returnObject);
      })
    });
  }
  
  // Accesos rápidos

  /* Permite agregar elementos al jq de trabajo del profesor */  
  append(jq) {
    this.jq.append(jq);
  }

  /* Se agrega una respuesta al object return */
  push(val) {
    this.returnObject.push(val);
  }

  /* Se establecen los datos de salvado  */
  set(revive) {
    this.returnObject.set(revive);
  }
}