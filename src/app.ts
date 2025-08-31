import express from 'express'
import router from './routes/index.js'
import RabbitMQService from './services/rabbitmq.service.js';

const app = express()
app.use(express.json());

RabbitMQService.getInstance().initialize()

app.use('/', router)

app.listen(3000, () => console.log("Product service started at port 3000"))