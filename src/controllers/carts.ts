import { writeFile } from 'fs/promises'
import { join } from 'path'
import type { Cart } from '../types/index.js'

// Import carts with proper typing
import cartsData from '../assets/mock_carts.json' with { type: 'json' }
const carts = cartsData as Cart[]

export const addToCart = async (req: any, res: any) => {
    try {
        const newCart: Cart = {
            id: carts.length + 1,
            products: [],
            totalPrice: 10000
        }
        
        carts.push(newCart)
        
        // Write updated carts back to file
        const filePath = join(__dirname, '../assets/mock_carts.json')
        await writeFile(filePath, JSON.stringify(carts, null, 2))
        
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