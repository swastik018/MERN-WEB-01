const { error } = require('console');
let fs = require('fs');
let path = require('path');
let OrderDetails = [];

module.exports = class model01{
    constructor(fname,lname,email,model)
    {
      this.fname = fname;
      this.lname = lname;
      this.email = email;
      this.model = model;
    };

    get OrderDetails()
    {
      return this;
    };

    save()
    {
      OrderDetails.push(this);
      let homePath = path.join(__dirname,'..','datas','Byer(S)Details.json');
      fs.writeFile(homePath, JSON.stringify(OrderDetails), error =>{
        if (error) {
          console.log(`SOME ERROR OCCURRED WHILE FETCHING THE USERS DATA`,(error));
        }
      });
    };

    static fetchAll()
    {
      return OrderDetails;
    }
};