module.exports = Node;

function Node (range, parent, quadtree) {
  this.range = range;
  this.parent = parent;
  this.quadtree = quadtree;

  this.level = this.parent ? this.parent.level + 1 : 0;

  this.items = [];
  this.nodes = [];
  this.mode = Node.ITEMS;
}

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;

Node.ITEMS = 4;
Node.NODES = 5;

Node.prototype.add = function (items, dontCheck) {
  items = items instanceof Array ? items : [items];

  if(!dontCheck)
    this.subdivideCheck(this.getLength() + items.length);

  for(var i = 0; i < items.length; i++) {
    var item = items[i];

    switch(this.mode) {
      case Node.ITEMS:
        item.__quadnode = this;
        item.__quadnodeindex = this.items.push(item) - 1;
        break;
      case Node.NODES:
        var loc = this.checkLocation(item);

        if(loc < 0)
          break;

        var node = this.nodes[loc];
        node.add(item);
        break;
    }
  }
};

Node.prototype.removeIndex = function (index) {
  if (this.mode != Node.ITEMS ||
    this.getLength() <= index ||
    index < 0)
    return false;

  this.items[index].__quadnode = undefined;
  this.items[index].__quadnodeIndex = undefined;

  if(this.items.length - index != 1) {
    this.items[index] = this.items.pop();
    this.items[index].__quadnodeindex = index;
  } else
    this.items.pop();

  return true;
};

Node.prototype.removeItems = function (items) {
  this.quadtree.remove(items);
};

Node.prototype.clear = function () {
  this.items = [];
  this.nodes = [];
};

Node.prototype.removeRange = function (range, accurate, pred) {
  var arr = this.getRange(range, accurate, pred, null, true);

  this.removeItems(arr);
};

Node.prototype.getRange = function (range, accurate, pred, itemCb, returnArray) {
  returnArray = (returnArray == null ?
    itemCb == null :
    returnArray
  );


  var arr = returnArray ? [] : null;

  switch (this.mode) {
    case Node.ITEMS:
      for(var i = 0; i < this.items.length; i++) {
        var item = this.items[i];

        if(range && accurate ? !range.intersectsPoint(item.position) : false)
          continue;

        if(pred ? !pred.call(null, item) : false)
          continue;

        if(itemCb)
          itemCb.call(null, item);

        if(returnArray)
          arr.push(item);
      }
      break;
    case Node.NODES:
      for(var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];

        if(range ? !range.intersects(node.range) : false)
          continue;

        var nodeArr = node.getRange(range, accurate, pred, itemCb, returnArray);

        if(returnArray && nodeArr)
          arr = arr.concat(nodeArr);
      }
      break;
  }

  return arr;
};

Node.prototype.getAll = function (itemCb, returnArray) {
  return this.getRange(null, false, null, itemCb, returnArray);
};

Node.prototype.checkLocation = function (item) {
  if (item.position.x < this.range.x ||
    item.position.y < this.range.y ||
    item.position.x > (this.range.x + this.range.width) ||
    item.position.y > (this.range.y + this.range.height))
    return -1;

  var loc = 0;

  if(item.position.x > (this.range.x + (this.range.width / 2)))
    loc++;

  if(item.position.y > (this.range.y + (this.range.height / 2)))
    loc += 2;

  return loc;
};

Node.prototype.getLength = function () {
  var len = 0;

  switch(this.mode) {
    case Node.ITEMS:
      len = this.items.length;
      break;
    case Node.NODES:
      for(var i = 0; i < this.nodes.length; i++)
        len += this.nodes[i].getLength();
      break;
  }

  return len;
};

Node.prototype.subdivideCheck = function (length) {
  if(this.level >= this.quadtree.maxLevel)
    return;

  length = (length != null ? length : this.getLength());

  switch(this.mode) {
    case Node.ITEMS:
      if (length > this.quadtree.maxNodeItems)
        this.subdivide();
      break;
    case Node.NODES:
      if (length <= this.quadtree.maxNodeItems)
        this.merge();
      break;
  }
};

Node.prototype.subdivide = function () {
  this.mode = Node.NODES;

  var ranges = this.range.split(4);

  this.nodes = [];
  for(var i = 0; i < 4; i++)
    this.nodes.push(new Node(ranges[i], this, this.quadtree));

  this.add(this.items, true);

  this.items = [];
};

Node.prototype.merge = function () {
  var items = this.getAll(null, true);

  this.clear();

  this.mode = Node.ITEMS;

  this.add(items, true);
};
