const Node = require("./QuadNode");

var nextId = 1;

module.exports = QuadTree;

function QuadTree (range, maxNodeItems, maxLevel) {
  this.id = nextId++;

  this.maxNodeItems = maxNodeItems;
  this.maxLevel = maxLevel;

  this.root = new Node(range, null, this);
}

QuadTree.prototype.add = function (items) {
  this.root.add(items);
};

QuadTree.prototype.remove = function (items) {
  items = items instanceof Array ? items : [items];

  for(var i = 0; i < items.length; i++) {
    var item = items[i];

    var node = item["__quadnode" + this.id];
    var index = item["__quadnodeindex" + this.id];

    if((!node) || (index == null)) {
      continue;
    }

    node.removeIndex(index);
  }

  return items;
};

QuadTree.prototype.removeRange = function (range, accurate, pred) {
  return this.root.removeRange(range, accurate, pred);
};

QuadTree.prototype.update = function (items) {
  items = items instanceof Array ? items : [items];

  for(var i = 0; i < items.length; i++) {
    var item = items[i];

    var node = item["__quadnode" + this.id];

    if(!node || (node.checkLocation(item) >= 0))
      continue;

    this.remove(item);
    this.add(item);
  }

  return items;
};

QuadTree.prototype.clear = function () {
  this.root.clear();
};

QuadTree.prototype.getLength = function () {
  return this.root.getLength();
};

QuadTree.prototype.getRange = function (range, accurate, pred, itemCb, returnArray) {
  return this.root.getRange(range, accurate, pred, itemCb, returnArray);
};

QuadTree.prototype.getAll = function (itemCb, returnArray) {
  return this.root.getAll(itemCb, returnArray);
};
