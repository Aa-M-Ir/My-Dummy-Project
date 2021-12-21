const http = require('http');
const express = require('express');
const fs = require('fs');
var bodyParser = require('body-parser');
const { redirect } = require('express/lib/response');
let mongoClient = require('mongodb').MongoClient;
const { mainModule } = require('process');

const app = express();
app.set('view engine', 'ejs');
var urlencodedParser = bodyParser.urlencoded({extended:false});

var uri = "mongodb://localhost:27017/Bank";
const client = new mongoClient(uri);
function connect(){
    client.connect((err)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("connected successfully")
        }
    })
}

connect();
   
    

app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/Bank/Main.html")
});

app.get('/costumer/addAccount', (req, res)=>{
    res.sendFile(__dirname + '/Bank/AddAcc.html');
})

app.post('/costumer/addAccount', urlencodedParser, (req,res)=>{
    client.db('Bank').collection('Users').insertOne(req.body);
    res.send("Sent data")
});


app.get("/costumer/withdraw", function(req, res){
    
    res.sendFile(__dirname + '/Bank/withdraw.html');
});

app.post('/costumer/withdraw', urlencodedParser, (req, res)=>{
    client.db('Bank').collection('Users').findOne({
        accNo: req.body.AccNo,
        password: req.body.password
    }).then((result)=>{
        if(result==null){
            res.send(`<h3> Either Username OR Password Is Incorrect</h3>`);
        }
        else{
        if(Number(req.body.amount)<=Number(result.balance)){
            let bal=Number(result.balance)-Number(req.body.amount);
            let balStr=bal.toString();
            client.db('Bank').collection('Users').updateOne({
                accNo: req.body.AccNo,
                password: req.body.password},
                {$set:{balance:balStr}})
                client.db('Bank').collection('transactions').insertOne(
                    {
                        AccNo: req.body.AccNo,
                        amount: req.body.amount,
                        date: req.body.date,
                        TrType: req.body.TrType
                    });
                res.send('Transaction Successfulll')
        }
        else{
            res.send(`<h3>The Amount You Entered Is Greater Than Your Main Balance</h3>`);
        }
    }
    })
      
})



app.get("/costumer/deposit", function(req, res){
    
    res.sendFile(__dirname + '/Bank/deposit.html');
});

app.post('/costumer/deposit', urlencodedParser, (req, res)=>{
    client.db('Bank').collection('Users').findOne({
        accNo: req.body.AccNo,
    }).then((result)=>{
        if(result==null){
            res.send(`<h3> Account Number Is Incorrect</h3>`);
        }
        else{
        if(Number(req.body.amount)>0){
            let bal=Number(result.balance)+Number(req.body.amount);
            let balStr=bal.toString();
            client.db('Bank').collection('Users').updateOne({
                accNo: req.body.AccNo
            },
                {$set:{balance:balStr}})
                client.db('Bank').collection('transactions').insertOne(
                    {
                        AccNo: req.body.AccNo,
                        amount: req.body.amount,
                        date: req.body.date,
                        TrType: req.body.TrType
                    });
                res.send('Transaction Successfulll')
        }
        else{
            res.send(`<h3>The Amount Is Too Low</h3>`);
        }
    }
    })
      
})


app.get('/costumer/check/trHistory', (req, res)=>{
    res.sendFile(__dirname + '/Bank/trHistory.html')
});


app.post('/costumer/check/trHistory', urlencodedParser, (req, res)=>{
    if(!req.body.date){
        let arr2=[];
        let arr = client.db('Bank').collection('transactions').find({
            AccNo: req.body.AccNo
         }).project({_id:0});

        arr.toArray().then((resp)=>{
            if(resp==""){
                res.send("<h3> No Transaction Matches With The Account Number You Enterred</h3>")
            }
            else{
                res.render('transaction', {myArr: resp});
            }
        });
         
    }
    if(req.body.date){
        let arr = client.db('Bank').collection('transactions').find({
            AccNo: req.body.AccNo,
            date: req.body.date
         }).project({_id:0});

         arr.toArray().then((resp)=>{
            if(resp==""){
                res.send("<h3>Check Dte Or Account Number</h3>")
            }
            else{
                res.render('transaction', {myArr: resp});
            }
        });
    }
 
});




app.get('/costumer/view/account', (req, res)=>{
    res.sendFile(__dirname + '/Bank/viewAcc.html')
});

app.post('/costumer/view/account', urlencodedParser, (req, res)=>{
    client.db('Bank').collection('Users').findOne({
        accNo: req.body.accNo,
        password: req.body.password
    }).then((result)=>{
        if(result==null){
            res.send(`<h3> Account Number Or Password Is Incorrect</h3>`);
        }
        else{
            res.render('viewAccount', {User: result});
        }
  })
});



app.get('/costumer/delete/account', (req, res)=>{
    res.sendFile(__dirname + '/Bank/DeleteAcc.html')
});

app.post('/costumer/delete/account', urlencodedParser, (req, res)=>{
    client.db('Bank').collection('Users').findOneAndDelete({
        accNo: req.body.accNo,
        password: req.body.password
    }).then((resp)=>{
        if(resp.value!==null){
          //  console.log(resp)
            res.send(`<h4>Deleted following account</h4><br>${req.body.accNo}`);
        }
        else{
            res.send('<h3>No Account Matched With Given Data</h3>');
        }
    })
})
app.listen(4000)