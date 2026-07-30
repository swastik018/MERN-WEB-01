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
      model01.fetchAll((OrderDetails)=>{
        OrderDetails.push(this);
      let homePath = path.join(__dirname,'..','datas','Byer(S)Details.json');
      fs.writeFile(homePath, JSON.stringify(OrderDetails), error =>{
        if (error) {
          console.log(`SOME ERROR OCCURRED WHILE FETCHING THE USERS DATA`,(error));
        }
      });
      });
    };

    static fetchAll(callback)
    {
      let homePath = path.join(__dirname,'..','datas','Byer(S)Details.json');
      fs.readFile(homePath,(error,data)=>{
        console.log('File Read:',error,data);
        if(!error)
        {
          OrderDetails = JSON.parse(data)
        }
       if (typeof callback === 'function')
        {
          callback(OrderDetails);
        } 
      });
    }
};