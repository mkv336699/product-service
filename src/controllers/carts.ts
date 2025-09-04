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

        // Read carts
        let carts2: Cart[] = JSON.parse(await readFile(filePath, { encoding: 'utf8' }))
        let allProducts: Product[] = JSON.parse(await readFile(productsFilePath, { encoding: 'utf8' }))

        // Normalize incoming body to only references
        const incoming = req.body as Partial<Cart> & { products: Array<Partial<Product> & Partial<ProductRef>> }
        const productRefs: ProductRef[] = (incoming.products || []).map(p => ({ id: Number(p.id), quantity: Number((p as any).quantity ?? 1) }))

        // Calculate totalPrice using product catalog
        const totalPrice = productRefs.reduce((sum, ref) => {
            const product = allProducts.find(ap => ap.id === ref.id)
            const price = product ? product.price : 0
            return sum + price * ref.quantity
        }, 0)

        const newCart: Cart = {
            id: Number(incoming.id ?? (carts2.length ? Math.max(...carts2.map(c => c.id)) + 1 : 1)),
            userId: Number(incoming.userId ?? 0),
            products: productRefs,
            totalPrice
        }

        // Append to carts
        carts2.push(newCart)

        // Write updated carts back to file
        await writeFile(filePath, JSON.stringify(carts2, null, 2))

        res.status(201).json({
            success: true,
            message: 'Cart created successfully',
            cart: newCart
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