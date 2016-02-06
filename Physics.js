


var DIM = 30;
var VELOCITY = 30; /* distance covered */
var WIDTH = window.innerWidth-VELOCITY-DIM;
var HEIGHT = window.innerHeight-VELOCITY/2-DIM;
var MASS = 10; /* kg */
var GRAVITY = 5;

var ENERGY = 12500; /* assume same energy */
var JUMPVELOCITY = Math.sqrt(2*ENERGY/MASS); /* E=(1/2)mv^2 */



var MovingSquare = React.createClass({
    render: function() {
        var style = {
            position: "absolute",
            marginLeft: this.props.horz,
            marginTop: this.props.vert
        };

        var sqStyle = {
            width: DIM + "px",
            height: DIM + "px", 
            backgroundColor: this.props.color,
            position: "absolute",
            border: "solid 1px #000"
        };

        return <div style={style}><div style={sqStyle}></div></div>;
    }
});

var Coin = React.createClass ({
    render: function() {
        var style = {
            position: "absolute",
            marginLeft: this.props.horz,
            marginTop: this.props.vert
        };

        return <img src="slack-imgs.com.gif" style={style} width="50px;" />;
    }
});

var App = React.createClass ({
    getInitialState: function() {
        var min = VELOCITY;
        var coins = [];

        for (var i=0; i<10; i++) {
            var horz = Math.floor(Math.random() * (WIDTH - min + 1)) + min;
            var vert = Math.floor(Math.random() * (HEIGHT - min + 1)) + min;

            var coin = <Coin horz={horz} vert={vert} />;
            coins.push( coin );
        }
        console.log(coins);

        return {
            coins: coins ,
            horz: WIDTH/2,
            vert: HEIGHT,
            color: "blue",
            vi: 0,
            vf: GRAVITY,
            map: [], /* keys pressed */
            horzDir: "none",
            vertDir: "none",
            numJumps: 0,
            start: 0,
            elapsed: 0
        };
    },

    start: function(e) {
        this.setState ({
            start: Date.now()
        });
        console.log(e.target.className);

        e.target.className = "hidden";
        document.getElementById("timer").className = "show";
    },

    componentDidMount: function() {0
        ReactDOM.findDOMNode(this).offsetParent.addEventListener('keypress', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            var map = this.state.map;
            map[intKey] = e.type == "keypress";

            this.setState ({
                map: map
            });
            this.move();
        }.bind(this));
        ReactDOM.findDOMNode(this).offsetParent.addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            var map = [];
            map[intKey] = e.type == "keypress";

            this.setState ({
                map: map
            });
            this.move();
        }.bind(this));

        this.timer = setInterval(this.tick, 50);
    },

    fallDown: function() {
        var vi = this.state.vi;
        var vf = this.state.vf;
        var t = (vf-vi)/GRAVITY;
        var d = 10; /* always move 1m = 10px */

        this.setState ({
            vert: this.state.vert+d,
            vi: vf,
            vf: Math.sqrt(Math.pow(vi, 2)+(2*GRAVITY*d))
        });

        if (this.state.horzDir=="right") {
            this.setState ({
                horz: this.state.horz+(VELOCITY/6)
            });
        }
        else if (this.state.horzDir=="left") {
            this.setState ({
                horz: this.state.horz-(VELOCITY/6)
            });
        }
        this.checkCollision();

        /* if prompted for a double jump, stop falling */
        if(this.state.numJumps>1) {
            this.setState ({
                numJumps: -1 /* no more jumping allowed */
            });
            return;
        }

        /* if you hit a wall, fall down normally */
        if (this.state.horzDir!=="none" && (this.state.horz<=0 || this.state.horz>=WIDTH)) {
            this.setState ({
                horzDir: "none",
                vi: 0,
                vf: GRAVITY,
            });
            this.fallDown();
        }
        /* if you havent hit the ground, keep falling */
        else if (this.state.vert<HEIGHT)
            setTimeout(this.fallDown, t);
        /* if you hit the ground, set everything back to its default value */
        else {
            this.setState ({
                horzDir: "none",
                vertDir: "none",
                numJumps: 0
            });
        }
    },

    fallUp: function() {
        var vi = this.state.vi;
        var vf = this.state.vf;
        var t = Math.abs((vf-vi)/GRAVITY);
        var d = 10; /* always move 1m = 10px */

        this.setState ({
            vert: this.state.vert-d,
            vi: vf,
            vf: Math.sqrt(Math.pow(vi, 2)-(2*GRAVITY*d))
        });

        if (this.state.horzDir=="right") {
            this.setState ({
                horz: this.state.horz+(VELOCITY/6) /* TODO - change with speed */
            });
        }
        else if (this.state.horzDir=="left") {
            this.setState ({
                horz: this.state.horz-(VELOCITY/6) /* TODO - change with speed */
            });
        }
        this.checkCollision();

        /* if you havent hite th */
        if (this.state.horz<=0 || this.state.horz>=WIDTH) {
            this.setState ({
                horzDir: "none",
                vi: 0,
                vf: GRAVITY,
                vertDir: "down"
            });
            this.fallDown();
        }
        else if (this.state.vf>0)
            setTimeout(this.fallUp, t);
        else {
            this.setState ({
                vi: 0,
                vf: GRAVITY,
                vertDir: "down"
            });
            this.fallDown();
        }
    },

    move: function() {
        var map = this.state.map;
        var right = map[100] && this.state.horz<WIDTH;
        var left = map[97] && this.state.horz>VELOCITY;
        var jump = map[32] && (this.state.vert>=HEIGHT || this.state.horz>=WIDTH || this.state.horz<=0);
        var doubleJump = map[32] && this.state.numJumps!==-1;

        if (jump) {
            if (right) {
                this.setState ({
                    horzDir: "right"
                });
            }
            else if (left) {
                this.setState ({
                    horzDir: "left"
                });
            }

            this.setState ({
                vi: JUMPVELOCITY,
                vf: Math.sqrt(Math.pow(JUMPVELOCITY, 2)-(2*GRAVITY*10)),
                vertDir: "up",
                numJumps: this.state.numJumps+1
            });
            this.fallUp();
        }
        else if (doubleJump) {
            this.setState ({
                vi: JUMPVELOCITY,
                vf: Math.sqrt(Math.pow(JUMPVELOCITY, 2)-(2*GRAVITY*10)),
                vertDir: "up",
                numJumps: this.state.numJumps+1
            });
            this.fallUp();
        }
        else if (right) { /* right - D */
            for (var i=0; i<VELOCITY; i++) {
              this.setState ({
                horz: this.state.horz+1
            });
              this.checkCollision();
          }
      }
      else if (left) { /* left - A */
          for (var i=0; i<VELOCITY; i++) {
              this.setState ({
                horz: this.state.horz-1
            });
              this.checkCollision();
          }
      }
  },

  checkCollision: function() {
    for (var i=0; i<this.state.coins.length; i++) {
        var s = this.state.coins[i];
        /* collides with anohter coin */
        if ((this.state.horz<s.props.horz+DIM && this.state.horz>s.props.horz-DIM) && (this.state.vert<s.props.vert+DIM && this.state.vert>s.props.vert-DIM)) {
            /* mix hex color */
            this.state.coins.splice(i, 1);
            this.setState ({
                coins: this.state.coins
            });

            if (this.state.coins.length==0) {
                document.getElementById("timer").className = "hidden";
                var time = (Math.round(Date.now() - this.state.start)/1000).toFixed(3);
                document.getElementById("info-div").innerHTML += "<br><h1>You finished in: " + time + " seconds</h1>";
            }

            break;
        }
    }
},

tick: function(){

    // This function is called every 50 ms. It updates the 
    // elapsed counter. Calling setState causes the component to be re-rendered

    this.setState({
        elapsed: new Date() - this.state.start
    });
},


render: function() {
   var elapsed = Math.round(this.state.elapsed);

    // This will give a number with one digit after the decimal dot (xx.x):
    var seconds = (elapsed / 1000).toFixed(3);

    return (<div>
        <div id="info-div" className="info-div">
        <p className="info">Physics: Can do jump/double jump and move. No wall jumps yet...(;T^T)<br/>
        Use controls A/D (move right/left) space (jump)<br/><br/>
        Gravity = {GRAVITY}<br/>
        Mass = {MASS}</p>
        <button onClick={this.start}>START</button>
        <p id="timer" className="hidden">Timer: <b>{seconds} seconds</b></p>
        </div>
        {this.state.coins}
        <MovingSquare horz={this.state.horz} vert={this.state.vert} color={this.state.color}/>
        </div>
        );
}
});


ReactDOM.render(
    <App />,
    document.getElementById("main")
    );


