<div>
  <div id="ListadoRazonamientosExistentes" class="SubAreaTrabajo"></div>
  <div class="SubAreaTrabajo Hide" id="Pruebas"><input class="GenerarRazonamiento" type="button" value="Generar">
  <div id="CuerpoPrueba"></div></div>
  <div class="SubAreaTrabajo">
    <form>
    <h2>Crear nuevo razonamiento</h2>
    <hr>
    <input autocomplete="off" placeholder='Titulo' type='text' name='Titulo'>
    <textarea placeholder="Letra del ejercicio" name='Letra'></textarea>
    <input type="button" value="Nueva pregunta preparatoria" id="NuevaPreparatoria">
    <div id='Preguntas'>
    </div>
    <input type='reset' name='Nuevo' value='Nuevo'>
    <input type='submit' name='Crear' value='Crear'>
    </form>
  </div>
</div>

<div class="Template Pregunta" id="Pregunta">
  <h4>{NroPregunta}</h4>
  <input type='text' autocomplete="off" placeholder="Pregunta" name="Preguntas[]">
  <input type='text' autocomplete="off" placeholder="Respuesta" name="Respuestas[]">
  <input type='button' class="Eliminar" value="Eliminar">
  <input type='button' class="Subir" value="Subir">
  <input type='button' class="Bajar" value="Bajar">
</div>

<div class="Template ItemListado" id="ItemListado">{id}: {titulo} <button class='EliminarRazonamiento'>Eliminar</button><button class='GenerarRazonamiento'>Generar</button></div>