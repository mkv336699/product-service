import { writeFile, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Cart, Product } from '../types/index.js'

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

        // Read carts
        let carts2 = JSON.parse(await readFile(filePath, { encoding: 'utf8' }))

        // Append to carts
        carts2.push(req.body)

        // Write updated carts back to file
        await writeFile(filePath, JSON.stringify(carts2, null, 2))

        res.status(201).json({
            success: true,
            message: 'Cart created successfully',
            cart: req.body
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create cart',
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

    for (let product of cart.products) {
        const p = allProducts.find((p: Product) => p.id === product.id)

        if (product.quantity > p.availableQuantity) {
            // break and return error since we don't have required quantities available to fulfill the order
            const err = {
                error: {
                    product: product,
                    availableQuantity: p.availableQuantity
                }
            }
            RabbitMQService.getInstance().publish('orders', err)
        }
        p.availableQuantity -= product.quantity
        p.reservedQuantity = p.reservedQuantity ? p.reservedQuantity + product.quantity : product.quantity
    }

    // write it back to file
    await writeFile(productsFilePath, JSON.stringify(allProducts, null, 2))

    // send carts to orders service
    RabbitMQService.getInstance().publish('orders', { cart })
}