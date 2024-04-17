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
    if (!this.head) {
      this.head = new Node(data);
    } else {
      let current = this.head;
      while (current.next) {
        if (
          current.data.lexeme === data.lexeme &&
          current.data.depth === data.depth
        ) {
          return;
        } else current = current.next;
      }
      this.head = new Node(data, this.head);
      if (
        current.data.lexeme === data.lexeme &&
        current.data.depth === data.depth
      ) {
        console.log(`Variable ${data.lexeme} already declared.`);
        return;
      }
    }
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

// ------------------------------------------------------------------------------

class HashTable {
  constructor() {
    this.storage = [];
    this.storageLimit = 5;
    this.offsetTracker = {
      // depth: offsetTracker
      1: 0,
    };
  }

  writeTable(depth) {
    let depthList = [];
    if (depth) {
      for (let i = 0; i < this.storage.length; i++) {
        let current = this.storage[i].head;
        while (current.data) {
          if (current.data.depth === depth) {
            depthList.push(`Lexeme : ${current.data.lexeme}, Value : ${current.data.value}`);
            // console.log(current.data);
          }
          if (current.next) {
            current = current.next;
          } else {
            break;
          }
        }
      }
      console.log("The lexeme found in depth " + depth + ":");
      depthList.forEach((element) => {
        console.log(element);
      });
      console.log("Exiting depth...");
    } else {
      this.storage.map((node) => {
        let store = node.head;
        while (store.data) {
          console.log(`${store.data.lexeme} : ${store.data.offset}`);
          if (store.next === null) {
            break;
          } else store = store.next;
        }
      });
      console.log(this.storage);
    }
  }

  setValue(lexeme, props) {
    let searchResults = this.lookup(lexeme);
    let data;
    if (!searchResults) {
      console.error(lexeme + " has not been declared!");
      return; // error code
    } else {
      let index = hash(lexeme, this.storageLimit); // hash the lexeme
      let currNode = this.storage[index].head;
      //  if there is no bucket at that index
      while (currNode.data) {
        if (currNode.data.lexeme == lexeme) {
          data = {
            ...currNode.data,
            value: props,
          };
          this.storage[index].head.data = data;
        }
        if (currNode.next) {
          currNode = currNode.next;
        } else {
          break;
        }
      }
    }
    // let searchResults = this.lookup(lexeme);
    // let data = {};
    // console.log(searchResults);
    // if (!searchResults) {
    //   return console.error("Identifier not declared!!");
    // } else {
    //   data = {
    //     ...searchResults,
    //     ...props,
    //   };
    //   console.log(data);
    // }
  }

  insert(lexeme, type, depth, props) {
    // ---------------------------------------

    for (let i = 0; i < lexeme.length; i++) {
      let offset;
      if (depth in this.offsetTracker) {
        this.offsetTracker[depth]++;
        // console.log(this.offsetTracker[depth]);
        offset = this.offsetTracker[depth];
      } else {
        this.offsetTracker = { ...this.offsetTracker, [depth]: 0 };
        this.offsetTracker[depth]++;
        offset = this.offsetTracker[depth];
        // console.log(this.offsetTracker[depth]);
      }

      let index = hash(lexeme[i], this.storageLimit); // hash the lexeme
      let data = {
        lexeme: lexeme[i],
        type,
        offset,
        depth,
        ...props,
      };

      // Using the result of the hash as its index in hash table
      if (this.storage[index] === undefined) {
        //  if there is no bucket at that index
        let newList = new LinkedList();
        newList.insertHead(data);
        this.storage[index] = newList;
      } else if (this.storage[index] != undefined) {
        let current = this.storage[index].head;
        while (current.data) {
          // Check if the data/variable name already exists in the list
          // console.log(data, current.data);
          if (
            data.lexeme == current.data.lexeme &&
            data.depth == current.data.depth
          ) {
            console.error(`Variable ${data.lexeme} already declared.`);
            return;
          } else {
            this.storage[index].insertHead(data);
            // console.log("Passed! " + data.lexeme +" " + data.offset);
          }
          // this.current = this.current.next
          if (current.next != null) {
            current = current.next;
          } else {
            break;
          }
        }
        // If there is a bucket add to it
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

    // console.log(lexeme, " from lookup");
    let hashIndex = hash(lexeme, this.storageLimit);
    let current = this.storage[hashIndex].head;
    // console.log("Looking up: ", lexeme);
      while (current) {
        if (current.data.lexeme === lexeme) {
          // console.log(current.data);
          return current.data;
          break;
        }
        current = current.next;
      }
    if(current !== null) {
      return current.data;
    }
    else {
      const errorMessage = `Variable ${lexeme} is not declared...`;
      return errorMessage;
    }
  }
}

export default HashTable;
