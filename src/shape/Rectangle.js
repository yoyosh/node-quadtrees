module.exports = Rectangle;

function Rectangle (x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rectangle.fromBounds = function (bounds) {
  return new Rectangle(
    bounds.left,
    bounds.top,
    bounds.right - bounds.left,
    bounds.bottom - bounds.top
  );
};

Rectangle.fromCircle = function (circle) {
  var size = circle.radius * 2;

  return new Rectangle(
    circle.x - circle.radius,
    circle.y - circle.radius,
    size,
    size
  );
};

Rectangle.prototype.getBounds = function () {
  return {
    left: this.x,
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height
  };
};

Rectangle.prototype.getCircle = function () {
  return Circle.fromRectangle(this);
};

Rectangle.prototype.split = function (amount) {
  var sqrt = Math.sqrt(amount);

  if(sqrt % 1 != 0)
    throw new Error("Invalid number!");

  var parts = [];

  var part_width = this.width / sqrt,
    part_height = this.height / sqrt;

  for(var i = 0; i < sqrt; i++) {
    for(var j = 0; j < sqrt; j++) {
      parts.push(new Rectangle(
        this.x + (part_width * j),
        this.y + (part_height * i),
        part_width,
        part_height
      ));
    }
  }

  return parts;
};

Rectangle.prototype.contains = function (shape) {
  var bounds = this.getBounds();
  var checkBounds = shape.getBounds();

  if(
    bounds.left >= checkBounds.left ||
    bounds.right <= checkBounds.right ||
    bounds.top >= checkBounds.top ||
    bounds.bottom <= checkBounds.bottom
  ) {
    return false;
  }

  return true;
};

Rectangle.prototype.intersects = function (check) {
  if(check instanceof Rectangle)
    return this.intersectsRectangle(check);
  else
    return check.intersects(this);

  return false;
};

Rectangle.prototype.intersectsRectangle = function (rect) {
  return (
    (
      this.x > rect.x ?
      this.x - rect.x <= (rect.width || 0) :
      rect.x - this.x <= this.width
    ) &&
    (
      this.y > rect.y ?
      this.y - rect.y <= (rect.height || 0) :
      rect.y - this.y <= this.height
    )
  );
};

Rectangle.prototype.intersectsPoint = function (point) {
  return (
    (
      this.x <= point.x &&
      point.x <= (this.x + this.width)
    ) &&
    (
      this.y <= point.y &&
      point.y <= (this.y + this.height)
    )
  );
};
