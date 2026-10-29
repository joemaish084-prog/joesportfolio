// Something outside React (Chrome's built-in Translate, "Listen to this page",
// tag-manager scripts) can move or wrap nodes React rendered. React then calls
// removeChild/insertBefore on a node whose parent changed, the browser throws
// NotFoundError and the whole app unmounts. Skip those mismatched calls instead.
// Workaround from https://github.com/facebook/react/issues/11538.
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn("Skipped removeChild of a node moved outside React", child);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("Appended instead of insertBefore a node moved outside React", referenceNode);
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export {};
