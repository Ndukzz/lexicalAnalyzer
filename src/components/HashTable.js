// Linked Lists

class Node {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
} // End Node

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Different methods
  // Insert first Node
  insertHead(data) {
    this.head = new Node(data, this.head);
    this.size++;
  }

  // Insert Last Node
  insertLast(data) {
    let node = new Node(data);

    let current;

    if (!this.head) {
      this.head = node;
    } else {
      // loop through to the end of list
      current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }

    this.size++;
  }

  //  Insert at index
  insertAtIndex(data, index) {
    // if index is out of range
    if (index > 0 && index > this.size) {
      console.log("Index out of range!!");
      return;
    }

    // if index is 0
    if (index === 0) {
      this.insertHead(data);
      return;
    }
  }

  // Lookup at index
  // print list
  printList() {
    let current = this.head;

    while (current) {
      console.log(current.data);
      current = current.next;
    }
  }
  // Delete at index/last node
  removeAt(index) {
    if (index > 0 && index > this.size) {
      return;
    }

    let current = this.head;
    let previous;
    let count = 0;

    // Remove first
    if (index === 0) {
      this.head = current.next;
    } else {
      while (count < index) {
        count++;
        previous = current;
        current = current.next;
      }

      previous.next = current.next;
    }

    this.size--;
  }
} // End Linked lists

//  Hash function
var hash = (string, max) => {
  var hash = 0;
  for (var i = 0; i < string.length; i++) {
    hash += string.charCodeAt(i);
  }
  return hash % max;
}; // End hash function

class HashTable {
  constructor() {
    this.storage = [];
    this.storageLimit = 5;
  }

  writeTable(depth) {
    console.log(this.storage);
    for (let i = 0; i < this.storage.length; i++) {
      let current = this.storage[i].head;
      while (current.data && current.next !== null) {
        if (current.data.depth === depth) {
          console.log(`These are the variables at depth ${depth} : `);
          console.log(current.data);
        }
        current = current.next;
      }
    }
  }

  insert(lexeme, token, depth) {
    // takes the list of lexeme and hashes each one
    for (let i = 0; i < lexeme.length; i++) {
      let index = hash(lexeme[i], this.storageLimit); // hash the lexeme
      let data = {
        lexeme: lexeme[i],
        token,
        depth,
      };
      // console.log(data);
      // Using the result of the hash as its index in hash table
      if (this.storage[index] === undefined) {
        //  if there is no bucket at that index
        let newList = new LinkedList();
        newList.insertHead(data);
        this.storage[index] = newList;
      } else {
        // If there is a bucket add to it
        this.storage[index].insertHead(data);
      }
    }
    // console.log(this.storage);
  }

  deleteDepth(depth) {
    //  tweak to delete the elements in a specific depth
    console.log("Deleting all variables with depth of ", depth);
    for (let i = 0; i < this.storage.length; i++) {
      let current = this.storage[i].head;
      var listIndex = 0;
      while (current) {
        console.log("Round ", listIndex);
        if (current.data.depth === depth) {
          console.log(current.data);
          this.storage[i].removeAt(listIndex);
        }
        listIndex++;
        current = current.next;
      }
    }
  }

  lookup(lexeme) {
    // use hash to find the location of lexeme
    let hashIndex = hash(lexeme, this.storageLimit);
    let current = this.storage[hashIndex].head;
    console.log("Looking up: ", lexeme);

    while (current) {
      if (current.data.lexeme === lexeme) {
        console.log(current.data);
        break;
      }
      current = current.next;
    }
  }
}
const ht = new HashTable();
console.log();

export default HashTable;
