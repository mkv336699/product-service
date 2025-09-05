import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'
import { addToCart, removeFromCart, getCartByUserId } from '../controllers/carts.js'

const router = Router()

router.get('/', (req, res) => {
	res.json({ success: true, message: 'Product service is healthy and running' })
})

router.get('/products', getAllProducts)

router.get('/products/:id', getProductById)

router.post('/products/carts', addToCart)

router.delete('/products/carts', removeFromCart)

router.get('/products/carts/:userId', getCartByUserId)

export default router