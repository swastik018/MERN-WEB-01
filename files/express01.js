let express = require('express');
let bodyParser = require('body-parser');
let handler = express();



let PORT = 3021;
handler.listen(PORT,()=>{
  console.log(`A new INQUIRY ARRIVES ON THE PORT: http://localhost:${PORT}`);
})