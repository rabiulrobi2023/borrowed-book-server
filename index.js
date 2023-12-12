const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;
app.use(cors({
    origin: ["https://bright-kulfi-37243b.netlify.app"]
}
    
));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bta6ici.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
 
async function run() {
    try {
        // await client.connect();
        const categoryCollection=client.db('assignment-11').collection('category')
        const booksCollection =client.db('assignment-11').collection('books')
        const borrowCollection = client.db('assignment-11').collection('borrow')

        app.get('/all-books',async(req,res)=>{
            const result=await booksCollection.find().toArray()
            res.send(result)
           
        })
        app.get('/avail-book',async(req,res)=>{
            const result=await booksCollection.find({quantity:{$gt:0}}).toArray()
            res.send(result)
          
        })

        app.get('/category',async(req,res)=>{
            const cursor=categoryCollection.find()
            const result=await cursor.toArray()
            res.send(result)
        })

        app.post("/books", async (req, res) => {
            const newproducts = req.body;
            const result = await booksCollection.insertOne(newproducts)
            res.send(result)
        })


        app.get("/books", async (req, res) => {
            const query = { category: req.query.category }
            const cursor = booksCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
            console.log(result)
         
        })
        
        app.get("/single-book/:id", async (req, res) => {
          
            const query = { _id: new ObjectId(req.params.id) }
            const result = await booksCollection.findOne(query)
            res.send(result)
   
        })

        app.get("/books/:id",async(req,res)=>{
            console.log(req.params)
            const query=req.params.id
            const result=await booksCollection.findOne({_id: new ObjectId(query)})
            res.send(result)

        })

        // ===========Update Product===========


        // ==Decrease=
        app.put("/booksQuantityUpdate", async (req, res) => {
            const filter = { _id: new ObjectId(req.query._id) }
            const options = { upsert: true }
            const updateBookQuantity = req.body;
            const books = {
                $set: {
                    mainId:updateBookQuantity.mainId,
                    bookName:updateBookQuantity.bookName,
                    quantity:updateBookQuantity.decreaseQuantity,
                    authorName:updateBookQuantity.authorName,
                    description:updateBookQuantity.description,
                    category: updateBookQuantity.category,
                    rating: updateBookQuantity.rating,
                    bookImage: updateBookQuantity.bookImage
                 
                },
            }
            const result = await booksCollection.updateOne(filter, books, options)
            res.send(result)

        })

        // ==Iecrease=
        app.put("/booksQuantityIncrease", async (req, res) => {
            const filter = { mainId:req.query.mainId}
            const update = { $inc: { quantity: 1 } }
            const result = await booksCollection.updateOne(filter,update )
            res.send(result)

        })

        // ===Some Field===
        app.put("/update-some", async (req, res) => {
            const filter = { _id: new ObjectId(req.query._id) }
            const options = { upsert: true }
            const updateBookInfo = req.body;
            const books = {
                $set: {
                   
                    bookName:updateBookInfo.bookName,
                    quantity:updateBookInfo.quantity,
                    authorName:updateBookInfo.authorName,
                    category:updateBookInfo.category,
                    rating:updateBookInfo.rating,
                    bookImage:updateBookInfo.bookImage  
                },
            }
            const result = await booksCollection.updateMany(filter, books, options)
            res.send(result)
        })



        // ==========================BorrowedBook========================
        app.post("/borrow", async (req, res) => {
            const result = await borrowCollection.insertOne(req.body)
            res.send(result)
            
        })

        app.get('/borrowBookBymainId',async(req,res)=>{
            const query={mainId:req.query.mainId}
            const result=await borrowCollection.findOne(query)
            res.send(result)

        })

        app.get("/borrow",async(req,res)=>{
            const query={email: req.query.email}
            const result = await borrowCollection.find(query).toArray()
            res.send(result)
            
        })

        app.delete("/borrow",async(req,res)=>{
            const query={_id: new ObjectId (req.query._id)}
            const result= await borrowCollection.deleteOne(query)
            res.send(result)
        })

        
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.listen(port, () => {
    console.log(`Server is running on port:${port}`)

})

