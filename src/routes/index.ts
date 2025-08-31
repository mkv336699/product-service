import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'
import { addToCart } from '../controllers/carts.js'

const router = Router()

router.get('/', (req, res) => {
	res.json({ success: true, message: 'Product service is healthy and running' })
})

router.get('/products', getAllProducts)

router.get('/products/:id', getProductById)

router.post('/products/cart', addToCart)

export default router