class GeometryLogger {
  constructor(jq, logMaker) {
    this.maxLogs = 12;
    this.logMaker = logMaker;
    
    this._percent = 0;
    let percentDiv = jq.find('.GeometryPercenter');
    this.percenter = new Percenter(percentDiv);

    this.jq = jq.find('.GeometryLogger');

    let th = this;
  }

  log(text) {
    this.jq.append(this.logMaker({Log: text}));

    let divs = this.jq.find('div');
    if(divs.length > this.maxLogs)
      divs.eq(0).remove();
  }

  percent(percent) {
    this.percenter.set(percent);
  }

  remove() {
    this.jq.remove();
    this.percenter.remove();
  }
}