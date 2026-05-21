const express= require("express");
const app = express();
const path= require('path')
const port = 5000;
const dotenv = require('dotenv');
dotenv.config();
const {MongoClient, ObjectId}= require("mongodb") // const {MongoClient}= require("mongodb")
const url = "mongodb://mudanyi:2024Japheth@ac-fwaq8g6-shard-00-00.moxtnys.mongodb.net:27017,ac-fwaq8g6-shard-00-01.moxtnys.mongodb.net:27017,ac-fwaq8g6-shard-00-02.moxtnys.mongodb.net:27017/?ssl=true&replicaSet=atlas-tq1wnq-shard-0&authSource=admin&appName=Nairobi-kioski"
const url2 ="mongodb+srv://mudanyi:2024Japheth@nairobi-kioski.moxtnys.mongodb.net/?appName=Nairobi-kioski"
const client = new MongoClient(url2);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,'view')))

let connectedDatabase;
// 1. Convert connection check into an Express middleware
app.use(async (req, res, next) => {
    try {
        // If the client isn't connected to the server yet, connect it
        if (!connectedDatabase) {
            await client.connect();
            connectedDatabase = client.db('ecommerce');
            console.log("Successfully connected to MongoDB");
        }
        // Attach the database instance directly to the request object
        req.db = connectedDatabase;
        next();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"view","landing.html"))
})
app.get("/cart2", (req,res)=>{
    res.sendFile(path.join(__dirname,"view","cart.html"))
})
app.get("/admin", (req,res)=>{
    res.sendFile(path.join(__dirname,"view","superAdmin.html"))
})

app.post('/', async (req, res)=>{
    const productName = req.body.product
    const productPrice = Number(req.body.price)
    //console.log(productName)
    const dataObject = {
        product: productName,
        price:productPrice
    }  
    try {        
        let collection = req.db.collection("products");
        await collection.insertOne(dataObject)
        let response = await collection.find().sort({ $natural: -1 }).limit(1).toArray()
        //console.log(response)
        res.status(201).json(response)
    } catch (error) {
        console.log(error.message)  
        res.status(500).json({ error: "Internal server error" });
    }
    
})

//retrieving all stored data when page loads
app.get("/products", async(req, res)=>{
    try {        
        const collection = req.db.collection("products");
        //await collection.deleteMany({});
        const data = await collection.find().toArray()
        //console.log(data)
        res.json(data)
    } catch (error) {
        console.log(error.message)
    }
})

//customer adding products to cart
app.post("/cart", async(req, res)=>{
    const productID = req.body.itemID
    const quantity = Number(req.body.quantity)
    //console.log("product_id",productID)
    //console.log("quantity:", quantity)
    try {
        const collection = req.db.collection("products");
        const results= await collection.findOne({ _id: new ObjectId(productID)})
        //console.log(results)

        const Cartcollection =req.db.collection("cart");
        const cartObject = { _id:productID, product: results.product, price:Number(results.price), Qty:quantity}
        await Cartcollection.insertOne(cartObject)
        const cartData = await Cartcollection.find().sort({ $natural: -1 }).limit(1).toArray();
        //console.log(cartData)
        //console.log("products in the cart")
        const updatedCart = await collection.find({}).toArray();
        //console.log(updatedCart)
        res.json(cartData)

    } catch (error) {
        console.log(error.message)
    }
})
app.patch("/cart", async(req, res)=>{
    const one_product_id= req.body.product_id
    const product_quantity= req.body.qty
    //console.log(one_product_id)
    if (!one_product_id || product_quantity === undefined) {
        return res.status(400).json({ error: "Missing product_id or qty" })
    }
    try {
        const collection = req.db.collection("cart");
       
        const queryFilter = { _id: one_product_id };

        const result = await collection.updateOne(
            queryFilter, // Match condition (adjust "id" to "_id" if using MongoDB's default IDs)
            { $set: { Qty: product_quantity } } // Only update the qty field
        )
        //console.log(result)
        const updatedCart = await collection.find({}).toArray();
        //console.log(updatedCart)
        res.status(200).json({ message: "Quantity updated successfully", result })
    } catch (error) {        
        res.status(500).json({ error: "Internal server error", details: error.message })
    }

})
app.delete("/cart", async(req, res)=>{
    const product_id = req.body.product_id;
    if (!product_id) {
        return res.status(400).json({ error: "Missing product ID" });
    }
    try {
        const collection =  req.db.collection("cart");
         
        const result = await collection.deleteOne({ _id: product_id });
        const updatedCart = await collection.find({}).toArray();
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Item not found in cart" });
        }
        //console.log(updatedCart)
        res.status(200).json({ message: "Item removed from cart successfully", result })

    } catch (error) {
        
    }


})

app.get("/cart_documents", async(req, res)=>{
    try {
        const collection =  req.db.collection("cart");
        
        let documents= await collection.countDocuments({})
        //console.log(documents)
        res.json(documents)
    } catch (error) {
        
    }
})
app.get("/cart_GrandTotal_price", async(req, res)=>{
    try {
        const collection = req.db.collection("cart")
        const result = await collection.aggregate([
            {
                $group: {
                    _id: null, // null means group everything into a single total
                    grandTotal: { 
                        // For each document, multiply price by Qty, then sum them up
                        $sum: { $multiply: [ "$price", "$Qty" ] } 
                    }
                }
            }
        ]).toArray();
        // If the cart is empty, result will be an empty array. Handle that case:
        const totalAmount = result.length > 0 ? result[0].grandTotal : 0;
        //console.log(totalAmount)
        res.json(totalAmount);
    } catch (error) {
        console.error("Aggregation failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})
//retrieving all cart stored data
app.get("/cart", async(req, res)=>{
    try {        
        const collection =req.db.collection("cart")
        //await collection.deleteMany({});
        const cartData = await collection.find().toArray()
       //console.log(cartData)
        res.json(cartData);
    } catch (error) {
        console.log(error.message)
    }
})

app.post("/order", async(req, res)=>{
    const items= req.body.items
    const total_Amount= req.body.total_Amount
    const location= req.body.location
    let order_object= {
        items: items,
        total_Amount:total_Amount,
        location:location,
        orderDate: new Date(), // Automatically record when the order happened
        status: "Pending"
    }
    
    try {
        const collection = req.db.collection("orders")    
        const result= await collection.insertOne(order_object)

        // Optional: Clear the user's cart here since they just checked out!
        await req.db.collection("cart").deleteMany({});
        console.log(order_object)
        res.json(order_object);
    } catch (error) {
        
    }
})
app.get("/order", async(req, res)=>{
    try {        
        const collection = req.db.collection("orders")   
        //await collection.deleteMany({});
        const Order_data = await collection.find().toArray()
       //console.log(cartData)
        res.json(Order_data);
    } catch (error) {
        console.log(error.message)
    }
})

//usefull checker
app.get("/check-types", async (req, res) => {
    try {
        const collection = req.db.collection("cart");

        // Find documents where Qty is a string OR price is a string
        const brokenDocuments = await collection.find({
            $or: [
                { Qty: { $type: "string" } },
                { price: { $type: "string" } }
            ]
        }).toArray();

        res.json({
            message: `Found ${brokenDocuments.length} broken items containing strings instead of numbers.`,
            badData: brokenDocuments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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
const consumer_key="PdqfJHYTvcAQ54i4u2BUPf82Sft1G2IoxnmvG2FF83DUsHEd"
const customer_secret="I7ohmfaFUYg4BrCzop79gjXqddAhGBzNFdH5KoCRhWxLT4lkylBEGIWJAEWM8HRO"
console.log("consumer_key:", consumer_key);
console.log("customer_secret:", customer_secret);
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