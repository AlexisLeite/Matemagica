# Matematic

Matematic será una aplicación basada en web para desarrollar las habilidades matemáticas del niño.

## Cómo se comunican Mate y los profesores

Cada profesor se registra y entrega datos acerca de su controlador y su nombre.

Cuando mate debe mostrar el contenido generado por alguno de los profesores, le entregará un div en el cual el mismo podrá colocar los elementos que sean necesarios.

Los ejercicios deberán ser corregidos respuesta a respuesta por cada profesor. Una respuesta no contestada nunca deberá ser tomada como erronea. Cada profesor mantendrá un registro de sus preguntas bien y mal contestadas. Cada vez que un profesor recibe una respuesta, informa a Mate para que éste actualice las estadísticas.

Para contar con esta funcionalidad, los profesores deberán ofrecer una intervaz orientada a eventos en donde cada respuesta produzca un evento con información sobre la actuación del estudiante. Mate deberá usar esta información como le parezca.

Interfaz de profesor:

- generar(div~jq)
- onAnswer(callback~function)

## Razonamientos

Los razonamientos se basarán en letras de ejercicios con variables que serán reemplazadas por valores generados en forma aleatoria. Estas variables serán explicadas en una fórmula por quien crea los ejercicios que será a su vez la respuesta al problema.

let cuenta = 'A*H/K+B+E+G-(C*D/E+F*(G-H))*(B+C)';

El anterior es un ejemplo de fórmula compleja que será usada para resolver un ejercicio.
Su resolución depende de muchos factores pero uno de los más importantes es el de la separación de términos y otro es el de encapsulamiento de paréntesis.

Los paréntesis se guardan en un array con la estructura
parentesis = [[texto, evaluacion]];
Esto permite insertar el texto cuando sea necesario y conocer una evaluación del mismo a futuro.

La separación de términos se hace sustituyendo la evaluación de los paréntesis sino no sería posible.

Cuenta A-(B+C)
razonamientos.js:16 A-CTA0 [Array(2)]
razonamientos.js:16 Terminos 5000 10000 2 1
razonamientos.js:16 (2) [Array(2), Array(2)]
razonamientos.js:118 (3) [0, {…}, "TNO0TNO1"]

A = rand(2000,20000)
14262
limites = [4262, 13262]
(2) [4262, 13262]
B = rand(limites[0]/2,limites[1]/2)
6274
C = rand(limites[0]/2,limites[1]-B)
6931
A-(B+C)
1057

A = rand(2000,20000)
17801
limites = [7801,16801]
(2) [7801, 16801]
B = rand(limites[0]/2,limites[1]/2)
7750
C = rand(limites[0]/2,limites[1]-B)
4494

### A partir de este momento es necesario desarrollar un mecanismo para evaluar el valor potencial de cada término

## Tablas

Las tablas se harán todas en una tabla.

## Cuentas

### Listado de componentes

#### Botones

- #GenerarCuentas
- #Corregir

#### Cuadros de texto

- #CantidadCuentas
- #CifrasA
- #CifrasSuma
- #CifrasResta
- #CifrasDivision
- #CifrasMultiplicacion

#### Delimitadores (divs)

- #Plantilla
- #Controles
- #ResultadosParciales
  - #Correctas
  - #Incorrectas
- #ResultadosFinales
  - #Promedio
- #Cuentas
- #ControlesCorregir

#### Mecanismo para encontrar el número adecuado

El tutor eligirá la cantidad de cifras que desea que tengan las cuentas, ese número deberá ser de esa cantidad exacta de cifras para ofrecer una dificultad acorde.

Si elige 1 cifra: deberá ser entre 0 y 9.
Si elige 2 cifras: deberá ser entre 10 y 99.
Si elige 3 cifras: deberá ser entre 100 y 999.

##### ¿Cómo llegar a ese número?

El márgen en el cual se encuentra ese número será entre el mayor de la cantidad anterior de cifras + 1 hasta el mayor de esa cantidad de cifras. Ejemplo: 3 cifras. El mínimo es 99+1 y el máximo es 999. Entonces si hacemos Math.random() * (999 - 100) + 100 siempre obtendríamos un número dentro de ese rango. Así la fórmula correcta sería:

```js

 Math.random() * (10 ** cifras - 10 ** (cifras-1)) + 10 ** (cifras-1)

```

#### Modo de corregir las cuentas

Al presionar en el botón de corregir, se comparan los resultados introducidos no contestados o incorrectos con sus respectivos resultados correctos y de coincidir, se eliminan de la lista de cuentas restantes.

Una vez que se eliminaron todas las cuentas de la pila de cuentas restantes, se da por terminado el trabajo. En esta situación se podrían contabilizar todos los errores que tuvo el estudiante de manera muy sencilla. También se podría tener un total de cuentas realizadas correctamente.

Una vez que se tienen los datos acerca de aciertos, errores y promedios se pueden reportar a una estructura mayor o simplemente borrar y comenzar nuevamente.
