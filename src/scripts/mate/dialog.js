class ConfDialog {
  constructor(options = {}, then = ()=>{}) {
    let keys = Object.keys(options), conf={};

    if(!keys.length) { then(); return; }

    templater.get('confDialog').then(res => {
      let ventana = res.confDialog();

      // Se crean los campos para configurar
      for(let key of keys) {
        conf[key] = options[key].default ?? null;

        let entrada;
        switch(options[key].type) {
          case 'text': 
            entrada = ventana.Text(options[key]);
            entrada.find('input').keydown(()=> {
              setTimeout(()=> {
                conf[key] = entrada.find('input').val();
              },100);
            })
            break;
          case 'number': 
            entrada = ventana.Text(options[key]);
            entrada.find('input').keydown(()=> {
              setTimeout(()=> {
                let val = parseInt(entrada.find('input').val());
                if(!val || isNaN(val) || val < options[key].min)
                  val = options[key].min ?? 1;

                if(val > options[key].max)
                  val = options[key].max ?? 10;
                  
                conf[key] = val;
              },100);
            })
            break;
          case 'check':
            entrada = ventana.Checkbox(options[key]);
            entrada.find('input').change(() => {
              setTimeout(()=> {
                conf[key] = entrada.find('input').prop('checked')
              },100);
            });
            break;
        }
        entrada.appendTo(ventana.find('.Contenido'));
      }
      
      setTimeout(() => {
        ventana.find('input').eq(0).focus();
      },100);

      // Se crea el botón para continuar
      let submit = ventana.Submit();
      submit.appendTo(ventana.find('.Contenido'));
      submit.click(() => {
        guardarYCerrar();
      });

      function guardarYCerrar() {
        then(conf);
        cerrarVentana();
      }

      function cerrarVentana() {
        ventana.jq.remove();
        $(document).off('keydown',controlarDialog);
      }

      function controlarDialog(ev) {
        switch(ev.originalEvent.code) {
          case 'Space': case 'Enter':
            guardarYCerrar();
            break;
          case 'Escape':
            cerrarVentana();
            break;
        }
      }
      $(document).keydown(controlarDialog);

      // Se muestra la ventana
      ventana.jq.appendTo('body');
      ventana.jq.click(ev => {
        if(ev.target.className == 'VentanaEmergente')
          cerrarVentana();
      })
    })
  }
}