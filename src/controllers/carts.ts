import { writeFile, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Cart } from '../types/index.js'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Not using this anymore because this reads the json once, implemented a readFile fn to read everytime
import cartsData from '../assets/mock_carts.json' with { type: 'json' }
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