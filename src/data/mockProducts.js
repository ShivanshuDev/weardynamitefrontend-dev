const categories = ['Apparel', 'Accessories', 'Footwear']
const subCategoriesMap = {
  Apparel: ['T-Shirts', 'Hoodies', 'Jackets', 'Bottoms', 'Sweaters', 'Shirts', 'Outerwear'],
  Accessories: ['Hats', 'Bags', 'Belts', 'Wallets'],
  Footwear: ['Sneakers', 'Boots', 'Formals'],
}
const subCategories = ['T-Shirts', 'Hoodies', 'Jackets', 'Bottoms', 'Sweaters', 'Shirts', 'Outerwear', 'Hats', 'Bags', 'Belts', 'Wallets', 'Sneakers', 'Boots', 'Formals']
const colorsMap = {
  'Pitch Black': '#000000', 'Ghost White': '#ffffff', 'Crimson Red': '#ff0000', 'Navy Blue': '#0000ff', 
  'Olive Green': '#556b2f', 'Classic Grey': '#808080', 'Mustard Yellow': '#ffdb58', 'Sand Beige': '#f5f5dc',
  'Deep Purple': '#800080', 'Charcoal': '#36454f'
}
const colorNames = Object.keys(colorsMap)
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const fits = ['Oversized', 'Regular Fit', 'Slim Fit', 'Boxy Fit', 'Relaxed Fit']
const neckTypes = ['Crew Neck', 'V-Neck', 'Polo Collar', 'High Neck', 'Hooded', 'Round Neck']
const occasions = ['Casual Wear', 'Partywear', 'Streetwear', 'Gym & Sports', 'Semi-Formal', 'Office Wear', 'Regular Use']

const PHOTO_IDS = [
  '1521572163474-6864f9cf17ab', '1556821840-3a63f95609a7', '1594633312681-425c7b97ccd1', '1588850567045-1612b804af4b',
  '1591047139829-d91aecb6caea', '1576871337622-98d48d38537c', '1544816155-12df9643f363', '1552346154-21d32810aba3',
  '1576871337632-b9aef4c17ab9', '1541099649105-f69ad21f3246', '1576566588028-4147f3842f27', '1552902865-b72c031ac5ea',
  '1586363104864-50e2246b7211', '1551028719-00167b16eac5', '1635397174557-3588fef6b1fc', '1596755094514-f87e34085b2c',
  '1553062407-98eeb94c6a62', '1614613535308-eb5fbd3d2c17', '1503342217505-b0a15ec3261c', '1491553895911-0055eca6402d',
  '1542291026-7eec264c27ff', '1523275335684-37898b6baf30', '1485968579580-b6d095142e6e', '1505740420928-5e560c06d30e',
  '1503341455253-b2e72fbb0dbb', '1441984904996-e0b6ba687e07', '1483985988355-763728e1935b', '1523381210434-271e8be1f52b',
  '1576566588028-4147f3842f27', '1556196148-de530cba9974', '1571513722275-4b41940f54b8', '1581375074612-d7af0f67ca8f',
  '1590117560339-01742a2618ef', '1511707171634-5f897ff02aa9', '1526170315830-14dd51013c41', '1553531384-397cf00b20be',
  '1560243563-0c40b3ef527c', '1562157876-21f44c8ed23a', '1598033129183-c405072da647', '1603541454133-569b91316f73',
  '1605333556536-eebdb8aecebf', '1612423284922-2970a29bd481', '1617137968427-85924c800a22', '1618354691792-d1d429fa2797',
  '1620799140408-edc6dcb6d633', '1622470953794-aa01db4b2568', '1631542470650-62e92c24e6a0',
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const generateMockProducts = () => {
  const products = []
  const statusCycle = ['Active', 'In Stock', 'Under Review', 'Out of Stock', 'Delivered']
  
  for (let i = 1; i <= 200; i++) {
    const category = categories[i % categories.length]
    const subCats = subCategoriesMap[category]
    const subCategory = subCats[i % subCats.length]
    const color = colorNames[i % colorNames.length]
    const fit = fits[i % fits.length]
    const neckType = neckTypes[i % neckTypes.length]
    const occasion = occasions[i % occasions.length]
    const status = statusCycle[i % statusCycle.length]
    
    const price = Math.floor(Math.random() * 2000) + 499

    products.push({
      id: i,
      name: `Premium ${color} ${subCategory}`,
      subtitle: `The Ultimate ${occasion} Essential`,
      category,
      subCategory,
      description: `Elevate your ${occasion.toLowerCase()} with our Premium ${color} ${subCategory}. Crafted from high-density 240+ GSM organic cotton for durability and comfort.`,
      price: price,
      salePrice: Math.random() > 0.6 ? price - 200 : price,
      colors: [colorsMap[color]],
      colorNames: [color],
      size: getRandomItems(sizes, 4),
      fit,
      neckType,
      occasion,
      status,
      stock: status === 'Out of Stock' ? 0 : Math.floor(Math.random() * 100) + 10,
      images: [
        `https://images.unsplash.com/photo-${PHOTO_IDS[i % PHOTO_IDS.length]}?q=80&w=800&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-${PHOTO_IDS[(i + 1) % PHOTO_IDS.length]}?q=80&w=800&auto=format&fit=crop`
      ],
      featured: i <= 20,
      keywords: [color.toLowerCase(), subCategory.toLowerCase(), fit.toLowerCase(), occasion.toLowerCase(), 'regular use'],
      dateAdded: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    })
  }

  return products
}

export const mockProducts = generateMockProducts()

export const filterOptions = {
  category: categories,
  subCategory: subCategories,
  color: colorNames,
  size: sizes,
  fit: fits,
  neckType: neckTypes,
  occasion: occasions
}
