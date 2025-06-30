/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear existing data
  await knex('posts').del();
  await knex('products').del();

  // Get existing users and categories
  const users = await knex('users').select('id').limit(5);
  const categories = await knex('categories').select('id');
  
  if (users.length === 0 || categories.length === 0) {
    console.log('No users or categories found. Please ensure you have users and categories before running this seed.');
    return;
  }

  // Sample product data
  const products = [
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Minimalist Black Sneakers',
      slug: 'minimalist-black-sneakers',
      description: 'Clean, modern sneakers perfect for any outfit. Made with premium materials for comfort and durability.',
      price: 89.99,
      category_id: categories[0].id,
      seller_id: users[0].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop']),
      tags: JSON.stringify(['sneakers', 'black', 'minimalist', 'casual']),
      is_active: true,
      status: 'active',
      inventory_quantity: 50,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Vintage Denim Jacket',
      slug: 'vintage-denim-jacket',
      description: 'Classic denim jacket with a vintage wash. Perfect for layering and adding style to any look.',
      price: 65.00,
      category_id: categories[0].id,
      seller_id: users[1] ? users[1].id : users[0].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop']),
      tags: JSON.stringify(['denim', 'jacket', 'vintage', 'casual']),
      is_active: true,
      status: 'active',
      inventory_quantity: 25,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      category_id: categories[0].id,
      seller_id: users[2] ? users[2].id : users[0].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop']),
      tags: JSON.stringify(['headphones', 'wireless', 'audio', 'tech']),
      is_active: true,
      status: 'active',
      inventory_quantity: 15,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Minimalist Watch',
      slug: 'minimalist-watch',
      description: 'Elegant minimalist watch with leather strap. Perfect for both casual and formal occasions.',
      price: 149.99,
      category_id: categories[0].id,
      seller_id: users[3] ? users[3].id : users[0].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop']),
      tags: JSON.stringify(['watch', 'minimalist', 'leather', 'accessories']),
      is_active: true,
      status: 'active',
      inventory_quantity: 30,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Organic Cotton T-Shirt',
      slug: 'organic-cotton-tshirt',
      description: 'Soft, comfortable organic cotton t-shirt. Sustainable fashion at its best.',
      price: 29.99,
      category_id: categories[0].id,
      seller_id: users[4] ? users[4].id : users[0].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop']),
      tags: JSON.stringify(['tshirt', 'organic', 'cotton', 'sustainable']),
      is_active: true,
      status: 'active',
      inventory_quantity: 100,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ];

  // Insert products
  const insertedProducts = await knex('products').insert(products).returning('*');
  console.log(`Inserted ${insertedProducts.length} products`);

  // Sample posts data
  const posts = [
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[0].id,
      product_id: insertedProducts[0].id,
      caption: 'Just got these amazing sneakers! The quality is incredible and they go with everything. Perfect for my minimalist style.',
      media: JSON.stringify([{type: 'image', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['sneakers', 'style', 'minimalist']),
      is_active: true,
      type: 'product',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[1] ? users[1].id : users[0].id,
      product_id: insertedProducts[1].id,
      caption: 'Vintage vibes with this classic denim jacket. Perfect for the cooler weather coming up!',
      media: JSON.stringify([{type: 'image', url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['denim', 'vintage', 'fashion']),
      is_active: true,
      type: 'product',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[2] ? users[2].id : users[0].id,
      product_id: insertedProducts[2].id,
      caption: 'These headphones changed my commute completely. The noise cancellation is next level!',
      media: JSON.stringify([{type: 'image', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['headphones', 'tech', 'commute']),
      is_active: true,
      type: 'product',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[3] ? users[3].id : users[0].id,
      product_id: insertedProducts[3].id,
      caption: 'Timeless elegance. This watch completes any outfit, whether casual or formal.',
      media: JSON.stringify([{type: 'image', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['watch', 'elegant', 'timeless']),
      is_active: true,
      type: 'product',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[4] ? users[4].id : users[0].id,
      product_id: insertedProducts[4].id,
      caption: 'Supporting sustainable fashion with this organic cotton tee. Looks good, feels good, does good!',
      media: JSON.stringify([{type: 'image', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['sustainable', 'organic', 'fashion']),
      is_active: true,
      type: 'product',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[0].id,
      product_id: insertedProducts[0].id,
      caption: 'Check out how these sneakers look on foot! The fit is perfect and they are so comfortable.',
      media: JSON.stringify([{type: 'video', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['sneakers', 'review', 'video']),
      is_active: true,
      type: 'story',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[1] ? users[1].id : users[0].id,
      product_id: insertedProducts[1].id,
      caption: 'LIVE NOW: Styling session with vintage denim! Ask me questions and get 20% off!',
      media: JSON.stringify([{type: 'live', url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['live', 'styling', 'sale']),
      is_active: true,
      type: 'live_announcement',
      votes_count: 12,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: users[2] ? users[2].id : users[0].id,
      product_id: insertedProducts[2].id,
      caption: 'Unboxing and first impressions of these wireless headphones. Sound quality test coming up!',
      media: JSON.stringify([{type: 'video', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'}]),
      tags: JSON.stringify(['unboxing', 'tech', 'review']),
      is_active: true,
      type: 'story',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ];

  // Insert posts
  const insertedPosts = await knex('posts').insert(posts).returning('*');
  console.log(`Inserted ${insertedPosts.length} posts`);
};
