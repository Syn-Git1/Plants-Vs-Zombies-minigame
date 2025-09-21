//global variables
let temp;
let plant=[]; //array for placing class
let peashooter=[]; //array for createPeashooter class
let peaShot=[]; //array for Pea class
let peaSeedW=79;
let peaSeedL=50;
let placingPea=false;
let occupied=false;
let plantLength;
let zombie=[]; //array for zombie class
let spawnNum=0;
let removed=false;
let gameState="menu";
let killNum=0;
let zombieRate=0.8;
let difficulty=1;

//preload variables
let peaIdle;
let peaAttack;
let peaSeed;
let zombieEat;
let zombieWalk;
let pea;
let peaRegular;
let bgMusic;
let plantSound;
let shotSound;
let zombieSound;
let sirenSound;
let loseSound;
let clickSound;
let loseScreen;
let menuBg;
let playB;
let instructionsB;
let menuB;
let font;
function preload(){ //preload images,sounds.fonts
  peaIdle=loadImage("idle.png");
  peaAttack=loadImage("attack.png");
  peaSeed=loadImage("seed1.png");
  peaRegular=loadImage("peaRegular.png");
  pea=loadImage("pea.png");
  zombieEat=loadImage("zombieEat.png");
  zombieWalk=loadImage("zombieWalk.png");
  bgMusic=loadSound("pvz music.mp3");
  plantSound=loadSound("pvz plant.mp3");
  shotSound=loadSound("pvz shot.mp3");
  zombieSound=loadSound("pvz zombie.mp3");
  sirenSound=loadSound("pvz siren.mp3");
  loseSound=loadSound("pvz lose.mp3");
  clickSound=loadSound("click.wav");
  loseScreen=loadImage("loseScreen.png");
  menuBg=loadImage("menuBg.png");
  playB=loadImage("play.png");
  instructionsB=loadImage("instructions.png");
  menuB=loadImage("MenuB.png");
  font=loadFont("zombieFont.TTF");
}
  
function setup() {
  createCanvas(540, 420);
  bgMusic.loop();
  textFont(font);
}

function draw() {
  if(gameState=="menu"){ //menu gamestate
    image(menuBg,0,0);
    image(playB,150,180);
    image(instructionsB,150,280);
  }else if(gameState=="game"){ //game gamestate
  background(75,130,75);
  spawnNum+=zombieRate; //spawn more zombies over time
  if(spawnNum>=400){
    spawnNum=0;
    zombie.push(new CreateZombie());  
  }
    if(killNum==5*difficulty){ //increase difficulty every 5 zombies defeated
      difficulty++;
      zombieRate+=(0.5);
    }
    plantLength=plant.length-1; //stores value for last index of array
    stroke(50,100,50);
    strokeWeight(4);
    Grid.makeGrid(); //makes the grid
    fill(120,160,120);
    noStroke();
    //boundaries 
    rect(0,0,width,2*Grid.xy);
    rect(0,0,Grid.xy,height);
    PeaAnim.animate(); //idle animation (synced)
    ZombieAnim.animate(); //walking animation (synced)
    for(let i=0;i<plant.length;i++){ //class methods for plant array
    plant[i].move();
    plant[i].display();
    }
    for(let i=0;i<peashooter.length;i++){//class methods for peashooter array
    peashooter[i].display();
    peashooter[i].shoot();
    }
    for(let i=peaShot.length-1;i>=0;i--){//class methods for peashot array
    peaShot[i].shootPea();
      if(peaShot[i].shot===true){ //removes pea from array after hitting zombie
       peaShot.splice(i,1);
      }
    }
    for(let i=0;i<zombie.length;i++){//class methods for zombie array
    zombie[i].attack();
    zombie[i].eatAnimate();
    zombie[i].display();
    }
    for(let i=0;i<peashooter.length;i++){ //checks if x and y coordinates of a dead peashooter align with Placing class for removal
      if(peashooter[i].alive==false){
        for(let j=plant.length-1;j>=0;j--) {
          if(peashooter[i].x==plant[j].occupiedX&&peashooter[i].y==plant[j].occupiedY){
            plant.splice(j,1);
            //peashooter.splice(i,1);
            peashooter[i].removed=true;
            break;
          }
        }
      }
    }
    for(let i=zombie.length-1;i>=0;i--){ //remove zombie from array after dying
      if(zombie[i].health<=0){
      zombie.splice(i,1);
        killNum++;
        break;
      }
    }
    stroke(0);
    strokeWeight(5);
    textSize(20);
    fill(200);
    text("Zombies Defeated - "+killNum,310,30);
    image(peaSeed,Grid.xy,Grid.xy/2); //peashooter seed packet

  }else if(gameState=="lose"){ //lose gamestate
    image(loseScreen,0,0);
    stroke(0);
    strokeWeight(1);
    textSize(25);
    text("Click anywhere to return to menu",90,400);
  }else if(gameState=="instructions"){ //instructions gamestate
    background(220,220,170);
    image(menuB,10,20);
    stroke(0);
    strokeWeight(5);
    fill(200);
    textSize(30);
    text("Instructions",170,70);
    textSize(20);
    text("- Press play on the main menu to begin \n- Click on the seed packet in game to plant \npeashooters to defend your garden \n- Zombies will begin to appear and attack \n- If given enough time zombies will eat your \nplants \n- Keep the zombies away from the end of your \ngarden! \n- Have fun",20,150);
  }
}

let Grid={
xy:60, //length and width/x and y of grid
makeGrid: function() {
  //method to draw the grid
  for(let i=0;i<width/Grid.xy;i++){ 
  line((i*Grid.xy),0,(i*Grid.xy),width);
  line(0,(i*Grid.xy),width,(i*Grid.xy));
  }
}
}

let PeaAnim={ //peashooter idle animation (object used for synced animation)
  //attributes
  patchX:0,
  patchY:0,
  patchW:[56,55],
  patchH:51,
  patches:7,
  patchNum:0,
  peaNum:0,
  frames:0,
  rate:10,
  animate: function(){ //animation method
    //move the "patch" on the sprite sheet for animation
    PeaAnim.sprite=peaIdle.get(PeaAnim.patchX,PeaAnim.patchY,PeaAnim.patchW[0],PeaAnim.patchH);
    if(PeaAnim.frames%PeaAnim.rate==0){
      PeaAnim.frames=0;
      if(PeaAnim.patchNum>PeaAnim.patches-1){
        PeaAnim.patchNum=0;
        PeaAnim.patchX=0;
      } else{
        PeaAnim.patchX+=PeaAnim.patchW[0];
        PeaAnim.patchNum++;
      }
    }
    PeaAnim.frames++;
  }
}
let ZombieAnim={  //zombie idle animation (object used for synced animation)
  //attributes
  patchX:0,
  patchY:0,
  patchW:64,
  patchH:72,
  patches:6,
  patchNum:0,
  frames:0,
  rate:10,
  animate: function(){ //animation method
    //move the "patch" on the sprite sheet for animation
    ZombieAnim.sprite=zombieWalk.get(ZombieAnim.patchX,ZombieAnim.patchY,ZombieAnim.patchW,ZombieAnim.patchH);
    if(ZombieAnim.frames%ZombieAnim.rate==0){
      ZombieAnim.frames=0;
      if(ZombieAnim.patchNum>ZombieAnim.patches-1){
        ZombieAnim.patchNum=0;
        ZombieAnim.patchX=0;
      } else{
        ZombieAnim.patchX+=ZombieAnim.patchW+12;
        ZombieAnim.patchNum++;
      }
    }
    ZombieAnim.frames++;
  }
}
class Placing{ //class for placing plants 
  constructor(){
    //attributes
    if(placingPea){
    this.pic=peaRegular;
    }
    this.h=51;
    this.w=56;
    this.x=width/2;
    this.y=height/2;
    this.placed=false;
  }
  move(){ //method for movement of plants while placing
    if(!this.placed){
      if(mouseX>Grid.xy&&mouseX<width&&mouseY>Grid.xy*2&&mouseY<height){ //checks if plant is within boundaries
        for(let i=0;i<width/Grid.xy;i++){ //loops through x values of grid to match with mouseX
          if(mouseX>i*Grid.xy&&mouseX<(i+1)*Grid.xy){
            this.x=Grid.xy*i+(Grid.xy-this.w)/2;
          }
          if(mouseY>i*Grid.xy&&mouseY<(i+1)*Grid.xy){//loops through y values of grid to match with mouseY
            this.y=Grid.xy*i+(Grid.xy-this.h)/2;
          }
        }
      }
    } else if(this.placed) {
      //occupied grid values for later use to avoid multiple placed in same spot
      this.occupiedX=this.x;
      this.occupiedY=this.y;
    }
  }
  display(){
    if(!this.placed){
      image(this.pic,this.x,this.y); //displays plant while placing
    }
  }
}

class CreatePeashooter{
  constructor(x,y){ //perameters for occupied x and y values for starting location
    //attributes
    this.x=x;
    this.y=y;
    this.w=56;
    this.h=51;
    this.health=50;
    this.damage=20;
    this.shotNum=0;
    this.patchX=0;
    this.patchNum=0;
    this.frames=0;
    this.alive=true;
    this.removed=false;
  }
  shoot(){ //shooting method
    for(let i=0;i<zombie.length;i++){ 
      if(this.y==zombie[i].y+17){ //check if zombie is on same path
        this.shotNum++;
        if(this.shotNum>150){
          this.animate(); //shooting animation
        }
        if(this.shotNum==200){
          this.shotNum=0;
          peaShot.push(new Pea(this.x,this.y));//create pea with class
        }
        break;
      } 
    }
  }
  animate(){ //attack animation method
    this.sprite=peaAttack.get(this.patchX,PeaAnim.patchY,PeaAnim.patchW[1],this.h);
    if(this.frames%PeaAnim.rate==0){
      this.frames=0;
      if(this.patchNum>PeaAnim.patches-1){
        this.patchNum=0;
        this.patchX=0;
      } else{
        this.patchX+=PeaAnim.patchW[1];
        this.patchNum++;
      }
    }
    this.frames++;
  }
  display(){ //display method
    if(this.health<=0){
      this.alive=false;
      if(this.removed==true){
       this.y=1000;
      }
      return;
        }
    //display attack or idle animation
    if(this.alive){
      if(this.shotNum<150){
        image(PeaAnim.sprite,this.x,this.y);
      } else if(this.shotNum>150){
        image(this.sprite,this.x,this.y);
      }
    }
  }
}

class Pea{
  constructor(x,y){
    //attributes
    this.pic=pea;
    this.x=x+45;
    this.y=y+10;
    this.speed=5;
    this.shot=false;
  }
  shootPea(){ //shootPea method
     if(this.shot==true){ //stop method from running after shooting zombie
      return;
    }
    //damage zombie if shot 
    if(!this.shot){
    this.x+=this.speed;
    for(let i=0;i<zombie.length;i++){ 
      if(this.x>zombie[i].x&&this.x<zombie[i].x+zombie[i].patchW-10&&this.y-10==zombie[i].y+17){
        this.shot=true;
        zombie[i].health-=20;
        shotSound.play();
        return;
      }
    }
    }
    image(this.pic,this.x,this.y);
  }
}
class CreateZombie{
  constructor(){
    //attributes
    this.h=51;
    this.w=56;
    this.x=580;
    this.y=(Grid.xy*int(random(2,7)))+(Grid.xy-this.h)/2-17;
    this.health=100;
    this.damage=10;
    this.speed=0.5;
    this.patchW=57;
    this.patchX=0;
    this.patchNum=0;
    this.frames=0;
    this.attackNum=0;
    this.target=0;
    this.targetFound=false;

  }
  attack(){ //attack method
    //check if zombie is infront of peashooter
    this.targetFound=false
      if(this.x>Grid.xy-this.patchW/2){
        for(let i=0;i<peashooter.length;i++){ 
          if(this.x==peashooter[i].x+20&&this.y+17==peashooter[i].y){
            this.target=peashooter[i];
            this.targetFound=true;
            this.speed=0;
            this.attackNum++;
            
            break;
          }
          }
        this.x-=this.speed;//move zombie
        } else{
          gameState="lose";
          loseSound.play();
        }
        if(this.targetFound==false||this.target.removed==true){ //reset speed after peashooter is dead
          this.speed=0.5;
          this.target=0;
        }
        if(this.attackNum==100){ //slowly damage peashooter
              this.target.health-=this.damage;
              this.attackNum=0;
        }
  }
  eatAnimate(){ //method for eating animation
      if(this.speed==0){
        this.sprite=zombieEat.get(this.patchX,ZombieAnim.patchY,this.patchW,ZombieAnim.patchH);
        if(this.frames%ZombieAnim.rate==0){
        this.frames=0;
        if(this.patchNum>ZombieAnim.patches-1){
          this.patchNum=0;
          this.patchX=0;
          zombieSound.play();
        } else{
          this.patchX+=this.patchW+12;
          this.patchNum++;
        }
        }
        this.frames++;
      }
  }
  display(){ //display method
    //display eating or walking animation
    if(this.speed==0.5){
    image(ZombieAnim.sprite,this.x,this.y);
    } else if(this.speed==0){
      image(this.sprite,this.x,this.y);
    }
  }
}
function reset(){
  plant.splice(0,plant.length);
  peashooter.splice(0,peashooter.length);
  peaShot.splice(0,peaShot.length);
  zombie.splice(0,zombie.length);
  killNum=0;
}
function mousePressed(){ //mousepressed function
  if(gameState=="menu"){
    if(mouseX>150&&mouseX<355&&mouseY>180&&mouseY<235){ //switch to main game
      gameState="game";
      clickSound.play();
      sirenSound.play();
    }
    if(mouseX>150&&mouseX<355&&mouseY>280&&mouseY<335){ //switch to main game
      gameState="instructions";
      clickSound.play();
    }
  }else if(gameState=="lose"){
    reset();
    gameState="menu";
    clickSound.play();
  } else if(gameState=="instructions"){
    if(mouseX>15&&mouseX<115&&mouseY>25&&mouseY<55){
      gameState="menu";
      clickSound.play();
    }
  }
  if(gameState=="game"){
  if(mouseX>Grid.xy&&mouseX<Grid.xy+peaSeedW&&mouseY>(Grid.xy/2)&&mouseY<(Grid.xy/2)+peaSeedL&&!placingPea){ //check if peashooter seed is pressed, add element from array to placing class
      placingPea=true;
      plant.push(new Placing()); 
    clickSound.play();
  }
  //check if plant being placed is over an occupied grid square
  for(let i=0;i<plant.length;i++){  
    for(let j=0;j<plant.length;j++){  
      occupied=false;
      if(plant[i].x==plant[j].occupiedX&&plant[i].y==plant[j].occupiedY){
        occupied=true;
        break;
      }
    }
    if(!plant[i].placed&&mouseX>Grid.xy&&mouseX<width&&mouseY>Grid.xy*2&&mouseY<height&&!occupied){ //if within boundaries and spot not occupied, place plant
      plant[i].placed=true;
      placingPea=false;
    }
  }
  }
}
function mouseReleased(){//used to add peashooter to class after plant occupied X and Y have been updated
  for(let i=0;i<plant.length;i++){  
      if(plant[plantLength].placed==true&&!occupied){
        peashooter.push(new CreatePeashooter(plant[plantLength].occupiedX,plant[plantLength].occupiedY))
        plantSound.play();
        break;
    }
  }

}
