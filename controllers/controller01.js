// const controller01 = require('../models/model01');
const { response } = require('express');
let model01 = require('../models/model01');


exports.HomepageOrder = (request,response,next) =>{
  console.log(request.url , request.method);

  model01.fetchAll().then(([OrderDetails,fields]) => {
      let FormattedOrders = OrderDetails.map(order =>{
      let body = order.OrderDetails || order;
      let detailedStrings = '';
      if(body && typeof body === 'object')
      {
        detailedStrings = `FirstName : ${body.fname} , LastName : ${body.lname} , EmailAddress : ${body.email} , Model : ${body.bmwmodel || body.model}, Payment: ${body.payment},Consent:${body.consent}`;

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
  let {fname , lname , email , model, payment, consent} = request.body;
  let controller01_model = new model01(fname , lname , email , model, payment, consent);
  controller01_model.save().then(() => {
    console.log('--------------------');
    response.redirect('/');
  }).catch(err => {
    console.log(err);
    response.redirect('/');
  });
};

exports.CardetailsID = (request,response,next) =>{
  let CarID = request.params.CarID;

  model01.fetchAll().then(([registerdOrders,fields]) => {
    let filtered = registerdOrders.filter(c => c.id == CarID || c.bmwmodel == CarID || c.model == CarID);
    let FormattedOrders = filtered.map(order => {
      let body = order.OrderDetails || order;
      let detailedStrings = '';
      if(body && typeof body === 'object')
      {
        detailedStrings = `FirstName : ${body.fname} , LastName : ${body.lname} , EmailAddress : ${body.email} , Model : ${body.bmwmodel || body.model}, Payment: ${body.payment} , Consent: ${body.consent}`;
      }
      else{
        detailedStrings = body || '';
      };
      return {OrderDetails: detailedStrings};
    });
    response.render('structure01',{registerdOrders: FormattedOrders});
  });
};

exports.URLnotFound = (request, response) =>{
  console.log(request.url , request.method);
  response.status(404).send('<h1> ENTER A VALID URL </h1>');
};

exports.OrderDetails = model01.fetchAll();