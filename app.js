const express= require("express");
const app = express();
const path= require('path')
const port = 5000;
const dotenv = require('dotenv');

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,'view')))
//timestamp
function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    // Month is 0-indexed, so add 1
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}  
const timestamp = getFormattedTimestamp();
console.log(timestamp);

//fetching api credentials
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
const consumer_key=process.env.consumer_key;
const customer_secret=process.env.customer_secret;
//console.log("consumer_key:", consumer_key);
//console.log("customer_secret:", customer_secret);
//token
    async function accessToken(){
        let tokendata="";
        try{
            const encodeToken= await Buffer.from(`${consumer_key}:${customer_secret}`).toString("base64");
            
            const result= await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",{
                method:"get",
                headers:{
                    "Authorization": `Basic ${encodeToken}`,
                    "Content-Type": "application/json"
                }
            })
            if(!result.ok){
                throw new Error("failed to fetch token");
            }
            const data= await result.json();
            const token= data.access_token;
            tokendata += token;
            console.log("tokendata:",tokendata);    
        
        }catch(error){
            console.error(error);
        }   
        
    
        return tokendata;
    }
    
app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"view","superAdmin.html"))
})

//fetching user data and daraja token api key
app.post("/contact", async (req,res)=>{
    const contact= req.body.contact    
    console.log(contact)
   async function stkpush(){
    try{        
        const token = await accessToken();
        const Timestamp= await getFormattedTimestamp();
        const passkey="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        const BusinessShortCode="174379"
        const password= Buffer.from(BusinessShortCode + passkey + Timestamp).toString("base64");
        const url= "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

        const response= await fetch(url,{
            body: JSON.stringify({
                BusinessShortCode: "174379", 
                Password: password, 
                Timestamp: Timestamp, 
                TransactionType: "CustomerPayBillOnline", 
                Amount: 50, 
                PartyA: "254799160218", 
                PartyB: "174379", 
                PhoneNumber: contact, 
                CallBackURL: "https://mydomain.com/path",
                AccountReference: "mudanyijeff", 
                TransactionDesc: "txndesc" 
            }),            
            method:"POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            
        })
        if(!response.ok){
           throw new Error("stk push failed, server error or invalid contact. PLEASE REFRESH AND TRY AGAIN LATER");
           
        }        
        const data = await response.json();
        const progress= data.ResponseDescription
        console.log(progress);
        res.json(progress);

        }catch(error){
        console.error("stk push error:", error);
        let errmsg= error.message
        console.log(errmsg)
        res.json(errmsg)
    }   
    return;

}
stkpush();
}) 

app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}/`)
})