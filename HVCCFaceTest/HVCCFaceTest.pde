PImage img;

void setup() {
  size(640, 480);
  img = loadImage("http://www.libsdl.org/projects/SDL_image/docs/demos/lena.jpg");
  frameRate(2);
}

void draw() {
  HVCCFace f = getHVCCFace("http://192.168.1.100:8080/", 0);
  background(0);

  if (f != null) {
    imageMode(CENTER);
    image(img, f.x, f.y, f.size, f.size);
  }
}

