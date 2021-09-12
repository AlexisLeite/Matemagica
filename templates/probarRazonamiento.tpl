<div>
  <div id="Conf"><h2>Configuración</h2>
    <span>Suma: <input type='text' value='5' id='CifrasSuma' placeholder="Cifras suma"></span>
    <span>Resta: <input type='text' value='4' id='CifrasResta' placeholder="Cifras resta"></span>
    <span>Multiplicacion: <input type='text' value='3' id='CifrasMultiplicacion' placeholder="Cifras multiplicacion"></span>
    <span>División: <input type='text' value='2' id='CifrasDivision' placeholder="Cifras division"></span>
    <input type="button" id="Generar" value="Generar">
  </div>
  <div id="Cuerpo">
    <h2>{Titulo}</h2>
    {Letra}
    <div id="GPreguntas"></div>
    <input type="button" id="Corregir" value="Corregir">
  </div>
  <div class="Pregunta">
    {Pregunta} <br>
    <input type="text" placeholder="Introduzca su respuesta">
  </div>
</div>