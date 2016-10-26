import {Quadtree, QuadtreeInternalNode, QuadtreeLeaf} from 'd3-quadtree';

export function findAll<T>(tree:Quadtree<T>, x:number, y:number, radius = Infinity) {
  var r = [];
  const adder = r.push.bind(r);
  const radius2 = radius * radius;
  //bounding of search radius
  const bb = {x0: x - radius, y0: y - radius, x1: x + radius, y1: y + radius};

  function inDistance(x1:number, y1:number) {
    const dx = x1 - x;
    const dy = y1 - y;
    return (dx * dx + dy * dy) <= radius2;
  }

  function findItems(node:QuadtreeInternalNode<T> | QuadtreeLeaf<T>, x0:number, y0:number, x1:number, y1:number) {
    const xy00In = inDistance(x0, y0);
    const xy01In = inDistance(x0, y1);
    const xy10In = inDistance(x1, y0);
    const xy11In = inDistance(x1, y1);

    if (xy00In && xy01In && xy10In && xy11In) {
      //all points in radius -> add all
      forEach(node, adder);
      return true; //abort
    }


  }

  tree.visit(findItems);
  // TODO implement

  const single = tree.find(x, y, radius);
  return single ? [single] : [];
}

export function forEach<T>(node:QuadtreeInternalNode<T> | QuadtreeLeaf<T>, callback:(d:T)=>void) {
  if (!node) {
    return;
  }
  if (isLeafNode(node)) {
    var leaf = <QuadtreeLeaf<T>>node;
    //see https://github.com/d3/d3-quadtree
    do {
      let d = leaf.data;
      callback(d);
    } while ((leaf = leaf.next) != null);
  } else {
    //manually visit the children
    const inner = <QuadtreeInternalNode<T>>node;
    forEach(inner[0], callback);
    forEach(inner[1], callback);
    forEach(inner[2], callback);
    forEach(inner[3], callback);
  }
}

export function hasOverlap(ox0:number, oy0:number, ox1:number, oy1:number) {
  return (x0:number, y0:number, x1:number, y1:number) => {
    //if the 1er points are small than 0er or 0er bigger than 1er than outside
    if (x1 < ox0 || y1 < oy0 || x0 > ox1 || y0 > oy1) {
      return false;
    }
    //inside or partial overlap
    return true;
  }
}

export function getTreeData<T>(node:QuadtreeInternalNode<T> | QuadtreeLeaf<T>):T[] {
  const r = [];
  forEach(node, r.push.bind(r));
  return r;
}

export function isLeafNode(node:QuadtreeInternalNode<any> | QuadtreeLeaf<any>) {
  return !(<any>node).length
}
