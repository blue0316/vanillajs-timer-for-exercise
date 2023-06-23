const ONE_SECOND = 1000;
const ticker = rxjs.interval(ONE_SECOND);

Timer = function () {
  let audio = new Audio("./assets/sound/notification.mp3");
  let audio2 = new Audio("./assets/sound/one_min_alert.mp3");

  const t = {
    sub$: 0,
    counter: 0,
    seq: [],
    times: [],
    names: [],
    namesNC: [],
    travels: [],
    gifs: [],
    seqCursor: 0,
    travelFlag: false,
    eventSubject: new rxjs.BehaviorSubject({}),
    set: (seq) => {
      t.stop();
      t.seq = seq;
      t.seqCursor = 0;
      if (t.seq.length > 0) {
        t.eventSubject.next({
          name: 'initialized',
          tick: 0,
          tickLeft: t.seq[t.seqCursor] - t.counter,
          cursor: t.seqCursor,
          seq: t.seq
        });
      }
    },
    start: () => {
      t.sub$ = ticker.subscribe(_ => {
        ++t.counter;

        if((t.seq[t.seqCursor] - t.counter) % 60 == 0 || t.counter >= t.seq[t.seqCursor]) {
          audio.play();
          document.querySelector('#alert-flag').setAttribute("style","display: block; background-color: red;");
          setTimeout(() => {
            document.querySelector('#alert-flag').setAttribute("style","display: none;");
          }, 2000)
        }

        t.eventSubject.next({
          name: 'tick',
          tick: t.counter,
          tickLeft: t.seq[t.seqCursor] - t.counter,
          cursor: t.seqCursor,
          seq: t.seq
        });

        if (t.counter >= t.seq[t.seqCursor]) {
          t.seqCursor++;
          t.counter = 0;
          if (t.seqCursor >= t.seq.length) {
            t.eventSubject.next({
              seq: t.seq,
              cursor: 0,
              name: 'finally'
            });
            t.stop();
          } else {
            t.eventSubject.next({
              name: 'ended',
              seq: t.seq,
              cursor: t.seqCursor
            });
          }
        }
      });
      t.eventSubject.next({
        name: 'started'
      });
    },
    startSeries: (names, times, travels, gifs) => {
      let image = document.getElementById('gif-img');
      t.seq = times;
      t.times = [...times];
      t.names = [...names];
      t.namesNC = [...names];
      t.gifs = [...gifs];
      t.travels = travels;
      t.num = times.filter(item => item > 0).length;
      t.travels[t.num - 1] = false
      t.travelGifNum = 0;
      t.sub$ = ticker.subscribe(_ => {
        document.querySelector("#name").innerHTML = t.names[t.seqCursor];
        document.querySelector("#current").innerHTML = t.seqCursor + 1;
        document.querySelector("#total").innerHTML = times.filter(el => el !== 0).length;
        if(t.namesNC[t.seqCursor + 1] !== "") {
          document.querySelector("#up-next").innerHTML = t.namesNC[t.seqCursor + 1];
        } else {
          document.querySelector("#up-next").innerHTML = "No More";
        }
        if (gifs[t.seqCursor] > -1) {
          console.log(gifs[t.seqCursor])
          console.log(training[gifs[t.seqCursor]])
          if (t.travelFlag) {
            if(image.src !== traveling[t.travelGifNum].route) {
              image.src = traveling[t.travelGifNum].route;
            }
          } else {
            if(image.src !== training[gifs[t.seqCursor]].route) {
              image.src = training[gifs[t.seqCursor]].route;
            }
          }
        } else {
          if (image.src !== "./assets/images/no-gifs.jpg") {
            image.src = "./assets/images/no-gifs.jpg"
          }
        }
        ++t.counter;

        if (t.seq[t.seqCursor] > 0) {
          if((t.seq[t.seqCursor] - t.counter) % 60 == 0 || t.counter >= t.seq[t.seqCursor]) {
            if(t.seq[t.seqCursor] - t.counter === 0) {
              audio.play();
              document.querySelector('#name').setAttribute("style","font-size: 48pt;");
              setTimeout(() => {
                document.querySelector('#name').setAttribute("style","font-size: 48pt;");
              }, 2000);
            } 
            if(t.seq[t.seqCursor] - t.counter === 60) {
              audio2.play();
              document.querySelector('#name').setAttribute("style","font-size: 48pt;");
              setTimeout(() => {
                document.querySelector('#name').setAttribute("style","font-size: 48pt;");
              }, 2000);
            }
          }

          if((t.seq[t.seqCursor] - t.counter) < 60 && !t.travelFlag) {
            document.getElementById('main').classList.add('main-alert');
          } else {
            document.getElementById('main').classList.remove('main-alert');
          }
  
          t.eventSubject.next({
            name: 'tick',
            tick: t.counter,
            tickLeft: t.seq[t.seqCursor] - t.counter,
            cursor: t.seqCursor,
            seq: t.seq
          });
  
          if (t.counter >= t.seq[t.seqCursor]) {
            if(t.travels[t.seqCursor] && !t.travelFlag) {
              t.names[t.seqCursor] = "Travel to " + t.names[t.seqCursor + 1];
              t.travelFlag = true;
              t.travelGifNum = Math.round(Math.random() * 16);
              t.seq[t.seqCursor] = 30;
              t.counter = 0;
            } else {
              t.travelFlag = false;
              t.seqCursor++;
              t.counter = 0;
              if (t.seqCursor >= t.seq.length) {
                t.eventSubject.next({
                  seq: t.seq,
                  cursor: 0,
                  name: 'finally'
                });
                t.stop();
              } else {
                t.eventSubject.next({
                  name: 'ended',
                  seq: t.seq,
                  cursor: t.seqCursor
                });
              }
            }
          }
        } else {
          t.seqCursor++;
          t.counter = 0;
          if (t.seqCursor >= t.seq.length) {
            t.eventSubject.next({
              seq: t.seq,
              cursor: 0,
              name: 'finally'
            });
            t.seqCursor = 0;
            document.querySelector('#main').classList.remove('main-alert');
            t.stop();
          } else {
            t.eventSubject.next({
              name: 'ended',
              seq: t.seq,
              cursor: t.seqCursor
            });
            t.seqCursor = 0;
            document.querySelector('#main').classList.remove('main-alert');
            t.stop()
          }
        }
      });
      t.eventSubject.next({
        name: 'started'
      });
    },
    reset: () => {
      t.counter = 0;
      t.seqCursor = 0;
      t.seq = [];
      t.sub$.unsubscribe();
    },
    stop: () => {
      if (t.sub$) {
        t.counter = 0;
        t.seqCursor = 0;
        t.sub$.unsubscribe();
      }
      t.eventSubject.next({
        seq: t.seq,
        cursor: 0,
        tick: t.counter,
        tickLeft: t.seq[t.seqCursor] - t.counter,
        name: 'stopped'
      });
      t.seqCursor = 0;
      document.querySelector('#current').innerHTML = times.filter(el => el !== 0).length;times.filter(el => el !== 0).length;
      document.querySelector('#main').classList.remove('main-alert');
      document.querySelector('#time-left').innerHTML = '00:00';
      document.querySelector('#name').innerHTML = 'End';
    },
    pause: () => {
      if (t.sub$) {
        t.sub$.unsubscribe();
      }
      t.eventSubject.next({
        seq: t.seq,
        cursor: 0,
        tick: t.counter,
        tickLeft: t.seq[t.seqCursor] - t.counter,
        name: 'paused'
      });
    },
    plus: () => {
      t.counter = t.counter - 30;
    },
    next: () => {
      if (t.seqCursor < t.num - 1) {
        t.names = [...t.namesNC];
        t.seq = [...t.times];
        ++t.seqCursor;
        t.counter = 0;
        t.travelFlag = false;
      } else {
        t.stop();
      }
    },
    prev: () => {
      if(t.travelFlag) {
        t.names = [...t.namesNC];
        t.seq = [...t.times];
        t.travelFlag = false;
        t.counter = 0;
      } else {
        if(t.seqCursor > 0) {
          t.names = [...t.namesNC];
          t.seq = [...t.times];
          t.counter = 0;
          --t.seqCursor;
        } else {
          t.stop();
        }
      }
    },
    event: () => {
      return t.eventSubject;
    },
    sets: () => {
      return t.seq.length;
    }
  };
  return t;
}
