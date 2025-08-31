import type { Product } from '../types/index.js'

// Import products with proper typing
import productsData from '../assets/mock_products.json' with { type: 'json' }
const products = productsData as Product[]

export const getAllProducts = async (req: any, res: any) => {
    try {
        const allProducts = products.slice()
        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            products: allProducts,
            count: allProducts.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const getProductById = async (req: any, res: any) => {
    try {
        const { id } = req.params
        const product = products.find(p => p.id == id)
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                productId: id
            })
        }
        
        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            product: product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
