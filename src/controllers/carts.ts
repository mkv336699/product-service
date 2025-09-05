import { writeFile, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Cart, Product, ProductRef } from '../types/index.js'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Not using this anymore because this reads the json once, implemented a readFile fn to read everytime
import cartsData from '../assets/mock_carts.json' with { type: 'json' }
import RabbitMQService from '../services/rabbitmq.service.js'
const carts = cartsData as Cart[]

export const addToCart = async (req: any, res: any) => {
    try {
        const filePath = join(__dirname, '../../src/assets/mock_carts.json')
        const productsFilePath = join(__dirname, '../../src/assets/mock_products.json')

        // Read carts and products
        let carts: Cart[] = JSON.parse(await readFile(filePath, { encoding: 'utf8' }))
        let allProducts: Product[] = JSON.parse(await readFile(productsFilePath, { encoding: 'utf8' }))

        // Extract payload
        const { userId, productId, quantity } = req.body

        // Validate required fields
        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, productId, quantity'
            })
        }

        // Validate product exists
        const product = allProducts.find(p => p.id === Number(productId))
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                productId: Number(productId)
            })
        }

        // Validate quantity
        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            })
        }

        // Find existing cart for user
        let userCart = carts.find(c => c.userId === Number(userId))

        if (userCart) {
            // Update existing cart
            const existingProductIndex = userCart.products.findIndex(p => p.id === Number(productId))
            
            if (existingProductIndex >= 0) {
                // Update quantity of existing product
                const existingProduct = userCart.products[existingProductIndex]
                if (existingProduct) {
                    existingProduct.quantity += Number(quantity)
                }
            } else {
                // Add new product to cart
                userCart.products.push({ id: Number(productId), quantity: Number(quantity) })
            }

            // Recalculate total price
            userCart.totalPrice = userCart.products.reduce((sum, ref) => {
                const product = allProducts.find(p => p.id === ref.id)
                return sum + (product ? product.price * ref.quantity : 0)
            }, 0)
        } else {
            // Create new cart for user
            const newCartId = carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1
            const newProductRef: ProductRef = { id: Number(productId), quantity: Number(quantity) }
            
            userCart = {
                id: newCartId,
                userId: Number(userId),
                products: [newProductRef],
                totalPrice: product.price * Number(quantity)
            }
            
            carts.push(userCart)
        }

        // Write updated carts back to file
        await writeFile(filePath, JSON.stringify(carts, null, 2))

        res.status(201).json({
            success: true,
            message: 'Product added to cart successfully',
            cart: userCart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add product to cart',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const getCartById = async (cartId: string) => {
    const cartsFilePath = join(__dirname, '../../src/assets/mock_carts.json')
    const productsFilePath = join(__dirname, '../../src/assets/mock_products.json')

    // Read carts
    let carts = JSON.parse(await readFile(cartsFilePath, { encoding: 'utf8' }))
    let cart = carts.find((c: Cart) => c.id === Number(cartId))

    // block available products
    let allProducts = JSON.parse(await readFile(productsFilePath, { encoding: 'utf8' }))

    for (let productRef of cart.products) {
        const p = allProducts.find((p: Product) => p.id === productRef.id)
        if (!p) {
            continue
        }

        if (productRef.quantity > p.availableQuantity) {
            // break and return error since we don't have required quantities available to fulfill the order
            const err = {
                error: {
                    product: productRef,
                    availableQuantity: p.availableQuantity
                }
            }
            RabbitMQService.getInstance().publish('orders', err)
        }
        p.availableQuantity -= productRef.quantity
        p.reservedQuantity = p.reservedQuantity ? p.reservedQuantity + productRef.quantity : productRef.quantity
    }

    // write it back to file
    await writeFile(productsFilePath, JSON.stringify(allProducts, null, 2))

    // send carts to orders service
    RabbitMQService.getInstance().publish('orders', { cart })
}

export const getCartByUserId = async (req: any, res: any) => {
    const cartsFilePath = join(__dirname, '../../src/assets/mock_carts.json')
    const productsFilePath = join(__dirname, '../../src/assets/mock_products.json')

    // Read carts
    let carts: Cart[] = JSON.parse(await readFile(cartsFilePath, { encoding: 'utf8' }))
    let cart = carts.find((c: Cart) => c.userId === Number(req.params.userId))

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found',
            cart: null
        })
    }

    // Optionally, enrich products with catalog info on read (without persisting)
    const allProducts: Product[] = JSON.parse(await readFile(productsFilePath, { encoding: 'utf8' }))
    const enriched = cart.products.map(ref => {
        const p = allProducts.find(ap => ap.id === ref.id)
        return {
            id: ref.id,
            quantity: ref.quantity,
            price: p?.price,
            title: p?.title
        }
    })

    return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        cart: { ...cart, products: enriched }
    })
}