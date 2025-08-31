import express from 'express'
import router from './routes/index.js'

const app = express()
app.use(express.json());

app.use('/', router)

app.listen(3000, () => console.log("Product service started at port 3000"))