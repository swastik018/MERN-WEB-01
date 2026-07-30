// const controller01 = require('../models/model01');
let model01 = require('../models/model01');


exports.HomepageOrder = (request,response,next) =>{
  console.log(request.url , request.method);

  model01.fetchAll((OrderDetails) => {
    let FormattedOrders = OrderDetails.map(order =>{
      let body = order.OrderDetails || order;
      let detailedStrings = '';
      if(body && typeof body === 'object')
      {
        detailedStrings = `FirstName : ${body.fname} , LastName : ${body.lname} , EmailAddress : ${body.email} , Model : ${body.model}`;

      }
      else{
        detailedStrings = body || '';
      };
      return{OrderDetails: detailedStrings};
    });
    response.render('structure01',{registerdOrders: FormattedOrders});
  });
};

exports.PostInquiryDetails = (request,response,next) =>{
  console.log(request.url,request.method);
  console.log('--------------------');
  console.log(request.body);
  let {fname , lname , email , model} = request.body;
  let controller01_model = new model01(fname , lname , email , model);
  controller01_model.save();

  console.log('--------------------');

  response.redirect('/');
};

exports.URLnotFound = (request, response) =>{
  console.log(request.url , request.method);
  response.status(404).send('<h1> ENTER A VALID URL </h1>');
};

exports.OrderDetails = model01.fetchAll();