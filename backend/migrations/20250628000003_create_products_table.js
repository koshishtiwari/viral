/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('seller_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.string('title').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('compare_at_price', 10, 2); // Original price for discounts
    table.string('sku').unique();
    table.integer('inventory_quantity').defaultTo(0);
    table.boolean('track_inventory').defaultTo(true);
    table.json('images'); // Array of image URLs
    table.json('variants'); // Size, color, etc. variations
    table.json('tags'); // Array of tags for search
    table.decimal('weight', 8, 2); // For shipping
    table.json('dimensions'); // {length, width, height}
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.enum('status', ['draft', 'active', 'archived']).defaultTo('draft');
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('reviews_count').defaultTo(0);
    table.integer('views_count').defaultTo(0);
    table.integer('favorites_count').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['seller_id']);
    table.index(['category_id']);
    table.index(['slug']);
    table.index(['status']);
    table.index(['is_active']);
    table.index(['is_featured']);
    table.index(['price']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
