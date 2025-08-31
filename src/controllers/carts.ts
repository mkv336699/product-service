import { writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Cart } from '../types/index.js'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import carts with proper typing
import cartsData from '../assets/mock_carts.json' with { type: 'json' }
const carts = cartsData as Cart[]

export const addToCart = async (req: any, res: any) => {
    try {
        carts.push(req.body)
        
        // Write updated carts back to file
        // Option 1: Write to source assets (may trigger tsc-watch)
        const filePath = join(__dirname, '../../src/assets/mock_carts.json')
        
        // Option 2: Write to data folder outside src (won't trigger tsc-watch)
        // const filePath = join(__dirname, '../../../data/mock_carts.json')
        
        await writeFile(filePath, JSON.stringify(carts, null, 2))
        
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