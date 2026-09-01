let express = require('express');
let router_for_express01 = express.Router();
let HomeController = require('./controllers/controller01');

router_for_express01.get('/',HomeController.HomepageOrder);
router_for_express01.post('/user-details',HomeController.PostInquiryDetails);
router_for_express01.get('/inquiry/:CarID',HomeController.CardetailsID);
router_for_express01.use(HomeController.URLnotFound);


exports.router_for_express01 = router_for_express01;