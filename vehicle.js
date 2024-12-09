class Vehicle {
  constructor(x, y, dna) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, -2);
    this.position = createVector(x, y);
    this.r = 4;
    this.maxspeed = 5;
    this.maxforce = 0.5;

    this.health = 1;

    this.dna = dna || [
      random(-2, 2), // Food weight
      random(-2, 2), // Poison weight
      random(0, 100), // Food perception
      random(0, 100), // Poison perception
    ];
  }

  update() {
    this.health -= 0.005;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  clone() {
    if (random(1) < 0.002) {
      return new Vehicle(this.position.x, this.position.y, this.dna.slice());
    }
    return null;
  }

  eat(list, nutrition, perception) {
    let record = Infinity;
    let closest = null;

    for (let i = list.length - 1; i >= 0; i--) {
      const d = this.position.dist(list[i]);
      if (d < 5) {
        list.splice(i, 1);
        this.health += nutrition;
      } else if (d < record && d < perception) {
        record = d;
        closest = list[i];
      }
    }

    if (closest) {
      return this.seek(closest);
    }
    return createVector(0, 0);
  }

  seek(target) {
    const desired = p5.Vector.sub(target, this.position).setMag(this.maxspeed);
    const steer = p5.Vector.sub(desired, this.velocity).limit(this.maxforce);
    return steer;
  }

  avoid(obstacles) {
    let closestObstacle = null;
    let minDist = Infinity;

    for (let obstacle of obstacles) {
      const distToObstacle = p5.Vector.dist(this.position, obstacle.pos);
      if (distToObstacle < obstacle.r + this.r && distToObstacle < minDist) {
        minDist = distToObstacle;
        closestObstacle = obstacle;
      }
    }

    if (closestObstacle) {
      let avoidanceForce = p5.Vector.sub(this.position, closestObstacle.pos);
      avoidanceForce.normalize();
      avoidanceForce.mult(map(minDist, 0, 100, this.maxforce, 0.1));
      return avoidanceForce;
    }
    return createVector(0, 0);
  }

  behaviors(good, bad, obstacles) {
    const steerG = this.eat(good, 0.2, this.dna[2]);
    const steerB = this.eat(bad, -1, this.dna[3]);
    const steerAvoid = this.avoid(obstacles);

    steerG.mult(this.dna[0]);
    steerB.mult(this.dna[1]);
    steerAvoid.mult(3);

    this.applyForce(steerG);
    this.applyForce(steerB);
    this.applyForce(steerAvoid);
  }

  dead() {
    return this.health < 0;
  }

  display() {
    const angle = this.velocity.heading() + PI / 2;
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    const col = lerpColor(color(255, 0, 0), color(0, 255, 0), this.health);
    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }

  boundaries() {
    const d = 25;
    let desired = null;

    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired) {
      desired.normalize().mult(this.maxspeed);
      const steer = p5.Vector.sub(desired, this.velocity).limit(this.maxforce);
      this.applyForce(steer);
    }
  }
}