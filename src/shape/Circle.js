const Rectangle = require("./Rectangle");

module.exports = Circle;

function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
}

Circle.fromBounds = function(bounds) {
  var radius = (bounds.right - bounds.left) / 2;

  return new Circle(
    bounds.left + radius,
    bounds.top + radius,
    radius
  );
};

Circle.fromRectangle = function(rect) {
  var radius = rect.width / 2;

  return new Circle(
    rect.x + radius,
    rect.y + radius,
    radius
  );
};

Circle.prototype.getBounds = function() {
  return {
    left: this.x - this.radius,
    top: this.y - this.radius,
    right: this.x + this.radius,
    bottom: this.y + this.radius
  };
};

Circle.prototype.getRectangle = function() {
  return Rectangle.fromCircle(this);
};

Circle.prototype.split = function(amount) {
  var splits = this.getRectangle().split(amount);

  for (var i = 0; i < splits.length; i++)
    splits[i] = splits[i].getCircle();

  return splits;
};

Circle.prototype.contains = function(check) {
  if (check instanceof Circle)
    return this.containsCircle(check);
  else if (check instanceof Rectangle)
    return this.containsRectangle(check);

  return false;
};

Circle.prototype.containsRectangle = function(rect) {
  var bounds = rect.bounds();

  return (
    this.intersectsPoint(bounds.left) &&
    this.intersectsPoint(bounds.right) &&
    this.intersectsPoint(bounds.top) &&
    this.intersectsPoint(bounds.bottom)
  );
};

Circle.prototype.containsCircle = function(circle) {
  var distance = Math.sqrt(
    Math.pow(circle.x - this.x, 2) +
    Math.pow(circle.y - this.y, 2)
  );
  var radiusDiff = Math.abs(circle.radius - this.radius);

  return distance < radiusDiff;
};

Circle.prototype.intersects = function(check) {
  if (check instanceof Circle)
    return this.intersectsCircle(check);
  else if (check instanceof Rectangle)
    return this.intersectsRectangle(check);

  return false;
};

Circle.prototype.intersectsRectangle = function(rect) {
  var distX = Math.abs(this.x - (rect.x + (rect.width / 2)));
  var distY = Math.abs(this.y - (rect.y + (rect.height / 2)));

  if ((distX > ((rect.width / 2) + this.radius)) ||
    (distY > ((rect.height / 2) + this.radius)))
    return false;

  if ((distX <= (rect.width / 2)) ||
    (distY <= (rect.height / 2)))
      return true;

  return (Math.pow(distX - (rect.width / 2), 2) +
    Math.pow(distY - (rect.height / 2), 2) <=
    Math.pow(this.radius, 2));
};

Circle.prototype.intersectsCircle = function(circle) {
  var distX = this.x - circle.x;
  var distY = this.y - circle.y;
  var radSum = circle.radius + this.radius;

  return (distX * distX) + (distY * distY) <= (radSum * radSum);
};

Circle.prototype.intersectsPoint = function(point) {
  return Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2) <= Math.pow(this.radius, 2);
};
