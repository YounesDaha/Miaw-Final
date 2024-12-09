const vehicles = [];
const food = [];
const poison = [];
const obstacles = [];

let debug;

function setup() {
  createCanvas(640, 360);

  for (let i = 0; i < 50; i++) {
    const x = random(width);
    const y = random(height);
    vehicles[i] = new Vehicle(x, y);
  }

  for (let i = 0; i < 40; i++) {
    const x = random(width);
    const y = random(height);
    food.push(createVector(x, y));
  }

  for (let i = 0; i < 20; i++) {
    const x = random(width);
    const y = random(height);
    poison.push(createVector(x, y));
  }

  obstacles.push(new Obstacle(width / 2, height / 2, 50, "green"));

  debug = createCheckbox();
}

function mousePressed() {
  const r = random(20, 50);
  obstacles.push(new Obstacle(mouseX, mouseY, r, "red"));
}

function draw() {
  background(0);

  if (random(1) < 0.2) {
    const x = random(width);
    const y = random(height);
    food.push(createVector(x, y));
  }
  if (random(1) < 0.01) {
    const x = random(width);
    const y = random(height);
    poison.push(createVector(x, y));
  }

  for (let i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4, 4);
  }

  for (let i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4, 4);
  }

  for (let obstacle of obstacles) {
    obstacle.show();
  }

  for (let i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison, obstacles);
    vehicles[i].update();
    vehicles[i].display();

    const newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    if (vehicles[i].dead()) {
      const x = vehicles[i].position.x;
      const y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }
  }
}

class Obstacle {
  constructor(x, y, r, couleur) {
    this.pos = createVector(x, y);
    this.r = r;
    this.color = couleur;
  }

  show() {
    push();
    fill(this.color);
    stroke(0);
    strokeWeight(3);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
    fill(0);
    ellipse(this.pos.x, this.pos.y, 10);
    pop();
  }
}