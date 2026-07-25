let express = require('express');
let bodyParser = require('body-parser');
let handler = express();
let path = require('path');
let {router_for_express01} = require('./router_for_express01');

handler.set('view engine' , 'ejs');
handler.set('views','views');

handler.use(bodyParser.urlencoded({ extended: true }));
handler.use(bodyParser.json());

handler.use(express.static(__dirname));
handler.use(router_for_express01);

let PORT = 3021;
handler.listen(PORT,()=>{
  console.log(`A NEW INQUIRY ARRIVES ON THE PORT: http://localhost:${PORT}`);
})