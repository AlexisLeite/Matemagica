class Percenter {
  constructor(jq) {
    this.jq = jq;
    this.jq.show();
    this.jq.css('width','0%');
    this.barra = $('<div class="PercenterBarra">0%</div>');
    this.barra.appendTo(this.jq);
    this.percent = 0;
  }

  remove() {
    this.jq.remove();
  }

  set(percent) {
    percent = parseInt(percent);
    if(percent <= this.percent) return;

    this.percent = percent;

    this.barra.html(`${percent}%`);
    this.jq.css('width',`${percent}%`);
  }
}