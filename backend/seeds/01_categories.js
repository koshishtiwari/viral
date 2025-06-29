/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Inserts seed entries
  await knex('categories').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, accessories',
      icon_name: 'shirt',
      is_active: true,
      sort_order: 1
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Electronics',
      slug: 'electronics',
      description: 'Phones, computers, gadgets',
      icon_name: 'smartphone',
      is_active: true,
      sort_order: 2
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Furniture, decor, tools',
      icon_name: 'home',
      is_active: true,
      sort_order: 3
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Beauty',
      slug: 'beauty',
      description: 'Makeup, skincare, hair care',
      icon_name: 'star',
      is_active: true,
      sort_order: 4
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Sports',
      slug: 'sports',
      description: 'Fitness, outdoor, equipment',
      icon_name: 'dumbbell',
      is_active: true,
      sort_order: 5
    }
  ]);
};
