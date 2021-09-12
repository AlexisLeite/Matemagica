class GeometryTasks {
  constructor(props) {
    Object.assign(this, {
      tasks: [],
      jq: $('body'),
      taskMaker: () => {}
    }, props);

    this.generar();
    this.set(1);
  }

  done(i) {
    this.jq.find('li').eq(i).addClass('permanentDone');
  }

  generar() {
    for(let task of this.tasks) {
      this.taskMaker({Text: task}).appendTo(this.jq);
    }
  }

  set(stage) {
    stage--; // stage is 1 based index
    if(stage > this.tasks.length) stage = this.tasks.length;

    let lis = this.jq.find('li');
    for(let i=0; i<stage; i++) {
      lis.eq(i).addClass('done');
      lis.eq(i).removeClass('current');
      lis.eq(i).removeClass('left');
    }

    lis.eq(stage).addClass('current');
    lis.eq(stage).removeClass('done');
    lis.eq(stage).removeClass('left');

    for(let i=stage+1; i<this.tasks.length; i++) {
      lis.eq(i).addClass('left');
      lis.eq(i).removeClass('current');
      lis.eq(i).removeClass('done');
    }
  }
}