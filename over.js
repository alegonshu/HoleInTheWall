class Scene5 extends Phaser.Scene {
    constructor () {
        super('Over');
  
  
  
    }
  
    preload() {
        this.load.image("background", "assets/images/hole-bg.png");
    }
    create() {
        // this.background = this.add.image(0, 0, "background");
        // this.background.setOrigin(0, 0);
        // this.background.displayHeight = window.innerHeight;
        // this.background.displayWidth = window.innerWidth;

        this.add.text(350,300, "GAME OVER", {
            font: "70px Arial", 
            fill: "#ff0044"
        });
        this.add.text(500,400, "RAISE YOUR RIGHT HAND TO PLAY AGAIN", {
            font: "30px Arial", 
            fill: "yellow"
        });

        let count = 7; // initial countdown value in seconds
        const countdownEl = this.add.text(10, 10, count, { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
    
        function update() {
          count--;
          countdownEl.setText(count);
          if (count === 0) {
            this.time.removeEvent(timer); // stop the timer when countdown reaches 0
          }
        }
    
        const timer = this.time.addEvent({
          delay: 1000, // repeat every 1000 milliseconds (1 second)
          callback: update,
          callbackScope: this,
          loop: true
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Instructions');
          });
    }
    update() {
        // console.log(verify);
        if (handCheck()) {
            setTimeout(() => {
                if (verify) {
                    this.scene.start('Instructions');
                }
            }, 2000);
        }
        
        setTimeout(this.scene.start('startGame'), 7000);
        
    }
  }