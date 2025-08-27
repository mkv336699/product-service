import products from '../assets/mock_products.json' with { type: 'json' }

export const getAllProducts = (req: any) => {
    const p = products.slice()
    return p
}

export const getProductById = (req: any) => {
    const { id } = req.params
    const data = products.find(p => p.id == id)
    return data
}