import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'

const router = Router()

router.get('/', (req, res) => {
	res.json({ success: true, message: 'Product service is healthy and running' })
})

router.get('/products', (req, res) => {
	const data = getAllProducts(req)
    res.send({ data })
})

router.get('/products/:id', (req, res) => {
	const data = getProductById(req)
	res.json({ data })
})

export default router