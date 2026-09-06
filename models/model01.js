const database = require('../database01');
let OrderDetails = [];

module.exports = class model01{
    constructor(fname,lname,email,model,payment,consent)
    {
      this.fname = fname;
      this.lname = lname;
      this.email = email;
      this.model = model;
      this.payment = payment || null;
      this.consent = consent || null;
    };

    get OrderDetails()
    {
      return this;
    };

    save()
    {
      console.log('NEW INQUIRY FROM SITE->')
     return database.execute('INSERT INTO bmwbyersdetails (fname, lname, email, model, payment, consent) VALUES (?, ?, ?, ?, ?, ?)', [this.fname, this.lname, this.email, this.model, this.payment || null, this.consent || null])
    };

    static fetchAll()
    {
     return database.execute('SELECT * FROM bmwbyersdetails')
    }
};