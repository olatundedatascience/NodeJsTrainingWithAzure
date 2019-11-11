class RandomGenerator {
    constructor(size) {
      this.size = size;
    }
  
    static create() {
      return new RandomGenerator(this.size);
    }
  
    generateRandom(min, max) {
      let result = [];
      if (min > max) {
        return 0;
      } else if (min == max) {
        return 0;
      }
      for (var i = min; i < max; i++) {
        let possible = Math.floor(Math.random() + i);
        result.push(possible);
      }
  
      return result[Math.floor(Math.random() * result.length)];
    }
  
    generateArray(arraySize) {
      let result = [];
      for (var i = 0; i < arraySize; i++) {
        result.push(this.generateRandom(i, arraySize));
      }
  
      return result;
    }
  
    generateId(len) {
      let id = "";
      for (var i = 0; i < len; i++) {
        id += this.generateRandom(i, len);
      }
  
      return id;
    }
  
    generateIdUpdate(len = 16) {
      let id = "";
      for (var i = 0; i < len; i++) {
        id += this.generateRandom(0, 10);
      }
  
      return id;
    }
  }
  

  
  module.exports = RandomGenerator;
  
 