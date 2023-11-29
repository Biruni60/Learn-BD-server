const express=require("express")
const cors=require("cors")
require('dotenv').config()
const app =express()
const port=process.env.PORT ||5000
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  
app.use(cors());
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fjhyf9f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    

    const userCollection=client.db("learnDB").collection("users")
    const classCollection=client.db("learnDB").collection("classes")
    const paymentCollection=client.db("learnDB").collection("enrolled")
    const assignmentCollection=client.db("learnDB").collection("assignment")
    const evaluationCollection=client.db("learnDB").collection("evaluation")
    const submissionCollection=client.db("learnDB").collection("submission")
    const appliedCollection=client.db("learnDB").collection("applied")
    //user
    
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
     

    app.get('/userprofile/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log(user);
      res.send(user)
    })

    


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.get('/users/teacher/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let teacher = false;
      if (user) {
        teacher = user?.role === 'teacher';
      }
      res.send({ teacher });
    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });
      app.put('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }   
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


    // classes
    //all
    app.get('/addedclasses', async (req, res) => {
      const query={isPending:"accepted"}
      const result = await classCollection.find(query).toArray();
      res.send(result);
     }); 
     //student
     app.get('/classdetail/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await classCollection.findOne(query);
    
      res.send(result);
    })

    app.get("/myclass",async(req,res)=>{
      const email = req.query.email;
      const query = { email: email };
      
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })


    app.get("/myassignments",async(req,res)=>{
      const id = req.query.id;
      const query = { classId:id };
      
      const result = await assignmentCollection.find(query).toArray();
      res.send(result);
    })


    app.post('/evaluation', async (req, res) => {
      const item = req.body;
      const result = await evaluationCollection.insertOne(item);
      res.send(result);
    });

    app.post('/submission', async (req, res) => {
      const item = req.body;
      const result = await submissionCollection.insertOne(item);
      res.send(result);
    });
    app.post('/apply', async (req, res) => {
      const item = req.body;
      const result = await appliedCollection.insertOne(item);
      res.send(result);
    });
    
    app.get('/apply/:email',async(req,res)=>{
      const email=req.params.email 
    
        const query={email:email}
        const options={
          projection:{isPending:1}
        }
        const result=await appliedCollection.findOne(query,options)
        res.send(result)
      
    })


//  admin
    
   app.get('/classes', async (req, res) => {
   const result = await classCollection.find().toArray();
   res.send(result);
  }); 
 
  app.put('/approveclass/:id', async (req, res) => {
    const id = req.params.id;
    const data=req.body.item
    console.log(id,data);
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        isPending:data
      }
    }   
    const result = await classCollection.updateOne(filter, updatedDoc);
    res.send(result);
  })

  app.get('/feedback/:id', async (req, res) => {
    const id =req.params.id
    const query={classId:id}
    const result = await evaluationCollection.find(query).toArray();
    res.send(result);
   }); 
  app.get('/feedback', async (req, res) => {
    const result = await evaluationCollection.find().toArray();
    res.send(result);
   }); 
  
     //Teachers
    app.post('/classes', async (req, res) => {
      const item = req.body;
      const result = await classCollection.insertOne(item);
      res.send(result);
    });
   
    app.get('/classes/:email',async(req,res)=>{
      const email=req.params.email 
    
        const query={email:email}
        const result=await classCollection.find(query).toArray()
        res.send(result)
      
    })
    
    app.put('/classes/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
                title:item.title,
                name:item.name,
                email:item.email,
                price:item.price,
                description:item.description,
                image:item.image,
        }
      }

      const result = await classCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
   

    app.delete('/classes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await classCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/teacher-stats/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {classId:id}
      const enrollment=await paymentCollection.find(query).toArray()
      const assignment=await assignmentCollection.find(query).toArray()
      const submission=await submissionCollection.find(query).toArray()
      res.send({enrollment,assignment,submission})
    })
    app.get('/statistics', async (req, res) => {
      const users = await userCollection.estimatedDocumentCount();
      const classes = await classCollection.estimatedDocumentCount();
      const enrollments = await paymentCollection.estimatedDocumentCount();
      console.log(users,classes,enrollments);
      res.send({users,classes,enrollments})
    })

    //teacher request

    app.get('/teacherrequest', async (req, res) => {
      const result = await appliedCollection.find().toArray();
      res.send(result);
     }); 

     app.put('/approveteacher/:id', async (req, res) => {
      const id = req.params.id;
      const data=req.body.item
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          isPending:data
        }
      }   
      const result = await appliedCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.put('/users/maketeacher/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = {email:email };
      const updatedDoc = {
        $set: {
          role: 'teacher'
        }
      }   
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //assignmentnode
    app.post('/addassignments', async (req, res) => {
      const item = req.body;
      const result = await assignmentCollection.insertOne(item);
      res.send(result);
    });

    // payment
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });
    

    app.get('/payments/:email', async (req, res) => {
      const query = { email: req.params.email }
      if (req.params.email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/paymentclass', async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      res.send( paymentResult);
    })

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})