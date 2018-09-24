class Update {
    constructor(message, complete, abortable = false) {
      this.message = message;
      this.complete = complete;
      this.abortable = abortable;
    }
  }
  
export default Update;